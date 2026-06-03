import { getActivityTier } from '@/config/goals/kilimanjaro'

/** Returns cutoff date for a range key. */
export function getCutoffDate(range) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  if (range === '7D')  { const d = new Date(now); d.setDate(d.getDate() - 7);   return d }
  if (range === '30D') { const d = new Date(now); d.setDate(d.getDate() - 30);  return d }
  if (range === '90D') { const d = new Date(now); d.setDate(d.getDate() - 90);  return d }
  if (range === 'YTD') { return new Date(now.getFullYear(), 0, 1) }
  return new Date(now); // fallback: today
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Filter activities by time range. */
export function filterByRange(activities, range) {
  const cutoff = getCutoffDate(range)
  return activities.filter(a => parseDate(a.date) >= cutoff)
}

/** Monday of a given date. */
function getMondayKey(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function shortWeekLabel(mondayKey) {
  const d = new Date(mondayKey + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** Weekly elevation bar chart data. */
export function buildElevationChartData(activities) {
  const byWeek = new Map()
  for (const a of activities) {
    const key = getMondayKey(parseDate(a.date))
    byWeek.set(key, (byWeek.get(key) || 0) + (a.elevation_gain_m || 0))
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, elev]) => ({ week: shortWeekLabel(key), elevation: Math.round(elev) }))
}

/** Weekly active days chart data. */
export function buildActivityDaysData(activities) {
  const byWeek = new Map()
  for (const a of activities) {
    const key = getMondayKey(parseDate(a.date))
    if (!byWeek.has(key)) byWeek.set(key, new Set())
    byWeek.get(key).add(a.date)
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, days]) => ({ week: shortWeekLabel(key), days: days.size }))
}

/** Rolling zone distribution (weighted by duration). */
export function computeZoneDistribution(activities) {
  const cardioTiers = ['tier1', 'tier2', 'tier3']
  const cardio = activities.filter(a => cardioTiers.includes(getActivityTier(a.activity_type)))
  const totalMin = cardio.reduce((s, a) => s + (a.duration_minutes || 0), 0)
  if (totalMin === 0) return null

  const zones = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 }
  for (const a of cardio) {
    const m = a.duration_minutes || 0
    zones.z1 += m * (a.zone1_percent || 0) / 100
    zones.z2 += m * (a.zone2_percent || 0) / 100
    zones.z3 += m * (a.zone3_percent || 0) / 100
    zones.z4 += m * (a.zone4_percent || 0) / 100
    zones.z5 += m * (a.zone5_percent || 0) / 100
  }

  return {
    z1: (zones.z1 / totalMin) * 100,
    z2: (zones.z2 / totalMin) * 100,
    z3: (zones.z3 / totalMin) * 100,
    z4: (zones.z4 / totalMin) * 100,
    z5: (zones.z5 / totalMin) * 100,
  }
}

/** Activity type counts. */
export function computeTypeCounts(activities) {
  const counts = {}
  for (const a of activities) {
    counts[a.activity_type] = (counts[a.activity_type] || 0) + 1
  }
  return counts
}

/** HRV/RHR data points for trend chart. */
export function buildHrvRhrData(activities) {
  return activities
    .filter(a => a.hrv !== null || a.rhr !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(a => ({ date: a.date, hrv: a.hrv ?? null, rhr: a.rhr ?? null }))
}

/** Summary strip totals. */
export function computeSummaryTotals(activities) {
  const totalElevation = activities.reduce((s, a) => s + (a.elevation_gain_m || 0), 0)
  const activeDays = new Set(activities.map(a => a.date)).size
  const totalHours = activities.reduce((s, a) => s + (a.duration_minutes || 0), 0) / 60
  return { totalElevation: Math.round(totalElevation), activeDays, totalHours }
}
