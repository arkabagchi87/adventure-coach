const ACTIVITIES_KEY = 'adventure_coach_activities'
const ENRICHMENT_KEY = 'adventure_coach_enrichment'
const DAILY_METRICS_KEY = 'adventure_coach_daily_metrics'
const RECOVERY_OPT_OUT_KEY = 'adventure_coach_recovery_opted_out'

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

const HAS_REAL_DATA_KEY = 'adventure_coach_has_real_data'

export function getHasRealData() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(HAS_REAL_DATA_KEY) === 'true'
}

export function setHasRealData() {
  if (typeof window === 'undefined') return
  localStorage.setItem(HAS_REAL_DATA_KEY, 'true')
}

/**
 * Returns true if all current activities are mock/seed data and no real upload
 * has happened yet. Treats activities with source:'mock' OR no source field as
 * mock data (the original seed file had no source field).
 */
export function shouldClearMockData() {
  if (typeof window === 'undefined') return false
  if (getHasRealData()) return false
  const activities = getActivities()
  if (activities.length === 0) return false
  return activities.every(a => !a.source || a.source === 'mock')
}

export function getDailyMetrics() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(DAILY_METRICS_KEY) || '[]') }
  catch { return [] }
}

export function saveDailyMetric({ date, rhr, hrv }) {
  if (typeof window === 'undefined') return
  const metrics = getDailyMetrics()
  const existing = metrics.findIndex(m => m.date === date)
  if (existing >= 0) {
    metrics[existing] = {
      ...metrics[existing],
      ...(rhr != null ? { rhr } : {}),
      ...(hrv != null ? { hrv } : {}),
    }
  } else {
    metrics.push({ date, rhr: rhr ?? null, hrv: hrv ?? null })
  }
  localStorage.setItem(DAILY_METRICS_KEY, JSON.stringify(metrics))
}

export function getRecoveryOptedOut() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(RECOVERY_OPT_OUT_KEY) === 'true'
}

export function setRecoveryOptedOut() {
  if (typeof window === 'undefined') return
  localStorage.setItem(RECOVERY_OPT_OUT_KEY, 'true')
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
