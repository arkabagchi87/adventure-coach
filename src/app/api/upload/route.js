import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { parseZeppCSV } from '@/lib/parsers/parseZeppCSV'
import { parseManualCSV, getManualCSVTemplate } from '@/lib/parsers/parseManualCSV'
import { parseAppleHealthXML } from '@/lib/parsers/parseAppleHealth'
import { mergeActivities } from '@/lib/parsers/mergeActivities'

const ACTIVITIES_PATH = join(process.cwd(), 'src/data/activities.json')

function loadActivities() {
  try {
    return JSON.parse(readFileSync(ACTIVITIES_PATH, 'utf8'))
  } catch {
    return []
  }
}

function saveActivities(activities) {
  writeFileSync(ACTIVITIES_PATH, JSON.stringify(activities, null, 2))
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file     = formData.get('file')
    const type     = formData.get('type') // 'zepp' | 'apple_health' | 'manual'

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()

    let parsed = []
    if (type === 'zepp' || (!type && file.name?.endsWith('.csv'))) {
      parsed = parseZeppCSV(text)
    } else if (type === 'apple_health' || file.name?.endsWith('.xml')) {
      parsed = parseAppleHealthXML(text)
    } else if (type === 'manual') {
      parsed = parseManualCSV(text)
    } else {
      // Auto-detect
      if (text.trimStart().startsWith('<?xml') || text.trimStart().startsWith('<Health')) {
        parsed = parseAppleHealthXML(text)
      } else {
        // Try Zepp first, fall back to manual (same format, just column names differ)
        parsed = parseZeppCSV(text)
        if (parsed.length === 0) parsed = parseManualCSV(text)
      }
    }

    if (parsed.length === 0) {
      return Response.json({
        error: 'No activities could be parsed from this file. Check the format matches Zepp CSV, Apple Health XML, or the manual template.',
      }, { status: 422 })
    }

    const existing = loadActivities()
    const { merged, added, total } = mergeActivities(existing, parsed)
    saveActivities(merged)

    return Response.json({
      success: true,
      parsed:  parsed.length,
      added,
      total,
      message: `${added} new activities added. ${parsed.length - added} duplicates skipped. Total: ${total}.`,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: 'Failed to process file. ' + err.message }, { status: 500 })
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
