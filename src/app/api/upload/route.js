import { parseZeppCSV } from '@/lib/parsers/parseZeppCSV'
import { parseManualCSV, getManualCSVTemplate } from '@/lib/parsers/parseManualCSV'
import { parseAppleHealthXML } from '@/lib/parsers/parseAppleHealth'
import { mergeActivities } from '@/lib/parsers/mergeActivities'
import { generateDataQualityReport } from '@/lib/parsers/generateDataQualityReport'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file     = formData.get('file')
    const type     = formData.get('type') // 'watch' | 'health_app' | 'manual'

    // Current data sent from client (localStorage)
    let currentActivities = []
    let currentEnrichment = {}
    try {
      const rawActivities = formData.get('currentActivities')
      if (rawActivities) currentActivities = JSON.parse(rawActivities)
    } catch { /* use empty array */ }
    try {
      const rawEnrichment = formData.get('currentEnrichment')
      if (rawEnrichment) currentEnrichment = JSON.parse(rawEnrichment)
    } catch { /* use empty object */ }

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()

    let parsed = []
    if (type === 'watch' || type === 'zepp') {
      parsed = parseZeppCSV(text)
    } else if (type === 'health_app' || type === 'apple_health') {
      parsed = parseAppleHealthXML(text)
    } else if (type === 'manual') {
      parsed = parseManualCSV(text)
    } else {
      // Auto-detect by content
      if (text.trimStart().startsWith('<?xml') || text.trimStart().startsWith('<Health')) {
        parsed = parseAppleHealthXML(text)
      } else {
        // Try watch CSV first, fall back to manual template
        parsed = parseZeppCSV(text)
        if (parsed.length === 0) parsed = parseManualCSV(text)
      }
    }

    // Count raw data rows in the file to detect silent drops
    const rawRowCount = text.split('\n').filter((l, i) => i > 0 && l.trim()).length
    const droppedByParser = rawRowCount - parsed.length

    if (parsed.length === 0) {
      return Response.json({
        error: 'No activities could be read from this file. Make sure it is a valid fitness export CSV or health app XML.',
      }, { status: 422 })
    }

    const { merged, added, total } = mergeActivities(currentActivities, parsed)

    // Generate enrichment questions based on what's missing in the newly added activities
    const newActivities = merged.slice(-added) // the appended ones are at the end after sort
    const { dataQuality, questions } = generateDataQualityReport(
      added > 0 ? newActivities : parsed,
      currentEnrichment
    )

    const skipped = parsed.length - added
    let message = `${added} new ${added === 1 ? 'activity' : 'activities'} imported. ${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped.`
    if (droppedByParser > 0) {
      message += ` ${droppedByParser} row${droppedByParser !== 1 ? 's' : ''} ignored (too short or unrecognised type).`
    }

    return Response.json({
      success:     true,
      merged,
      parsed:      parsed.length,
      added,
      skipped,
      dropped:     droppedByParser,
      total,
      message,
      dataQuality,
      questions,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: 'Could not process the file. ' + err.message }, { status: 500 })
  }
}

export async function GET() {
  // Returns the manual CSV template for download
  const csv = getManualCSVTemplate()
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="adventure-coach-template.csv"',
    },
  })
}
