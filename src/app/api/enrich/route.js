/**
 * POST /api/enrich
 * Accepts enrichment answers from the post-upload flow.
 * Saves them as defaults to enrichment.json so future uploads skip already-answered questions.
 * Returns the updated enrichment object.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ENRICHMENT_PATH = join(process.cwd(), 'src/data/enrichment.json')

function loadEnrichment() {
  try {
    return JSON.parse(readFileSync(ENRICHMENT_PATH, 'utf8'))
  } catch {
    return { defaults: {}, activities: {} }
  }
}

function saveEnrichment(data) {
  writeFileSync(ENRICHMENT_PATH, JSON.stringify(data, null, 2))
}

/**
 * Applies a dot-path key like "defaults.max_hr" to a nested object.
 */
function setDeep(obj, path, value) {
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { answers } = body // Array of { saveAs: 'defaults.max_hr', value: 180 }

    if (!Array.isArray(answers) || answers.length === 0) {
      return Response.json({ error: 'No answers provided' }, { status: 400 })
    }

    const enrichment = loadEnrichment()

    for (const { saveAs, value } of answers) {
      if (saveAs && value !== undefined && value !== null) {
        setDeep(enrichment, saveAs, value)
      }
    }

    saveEnrichment(enrichment)
    return Response.json({ success: true, enrichment })
  } catch (err) {
    console.error('Enrich error:', err)
    return Response.json({ error: 'Failed to save enrichment: ' + err.message }, { status: 500 })
  }
}
