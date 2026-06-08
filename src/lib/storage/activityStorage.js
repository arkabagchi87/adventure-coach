const ACTIVITIES_KEY = 'adventure_coach_activities'
const ENRICHMENT_KEY = 'adventure_coach_enrichment'

export function getActivities() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]') }
  catch { return [] }
}

export function setActivities(activities) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
}

export function getEnrichment() {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(ENRICHMENT_KEY) || '{}') }
  catch { return {} }
}

export function setEnrichment(enrichment) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ENRICHMENT_KEY, JSON.stringify(enrichment))
}

export function isInitialized() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ACTIVITIES_KEY) !== null
}

/** First load: seed localStorage from the read-only API endpoint. */
export async function initializeIfNeeded() {
  if (typeof window === 'undefined' || isInitialized()) return
  try {
    const res = await fetch('/api/activities')
    if (res.ok) {
      const { activities, enrichment } = await res.json()
      setActivities(activities || [])
      setEnrichment(enrichment || {})
    } else {
      setActivities([])
      setEnrichment({})
    }
  } catch {
    setActivities([])
    setEnrichment({})
  }
}
