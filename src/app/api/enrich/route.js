/**
 * POST /api/enrich
 * Accepts enrichment answers from the post-upload flow.
 * Returns the updated enrichment object — client stores it in localStorage.
 */

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
    const { answers, currentEnrichment } = body // answers: Array of { saveAs, value }; currentEnrichment from localStorage

    if (!Array.isArray(answers) || answers.length === 0) {
      return Response.json({ error: 'No answers provided' }, { status: 400 })
    }

    // Start from the client-provided enrichment (or empty object)
    const enrichment = (currentEnrichment && typeof currentEnrichment === 'object')
      ? currentEnrichment
      : { defaults: {}, activities: {} }

    for (const { saveAs, value } of answers) {
      if (saveAs && value !== undefined && value !== null) {
        setDeep(enrichment, saveAs, value)
      }
    }

    return Response.json({ success: true, enrichment })
  } catch (err) {
    console.error('Enrich error:', err)
    return Response.json({ error: 'Failed to save enrichment: ' + err.message }, { status: 500 })
  }
}
