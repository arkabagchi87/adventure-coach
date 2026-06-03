import {
  dimensions,
  scoreAerobicBase,
  scoreElevationCapacity,
  scoreMultidayEndurance,
  scoreStrength,
  scoreRecoveryQuality,
  getCurrentPhase,
  getActivityTier,
} from '@/config/goals/kilimanjaro'

// ─── HELPERS ────────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string into a Date at midnight local time. */
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Returns activities within the last N days (inclusive of today). */
function recentActivities(activities, days) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)
  return activities.filter(a => parseDate(a.date) >= cutoff)
}

/** Groups activities into ISO week buckets (Monday-based). Returns Map<weekKey, activities[]>. */
function groupByWeek(activities) {
  const weeks = new Map()
  for (const a of activities) {
    const d = parseDate(a.date)
    // Monday of this week
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1 - day)
    const monday = new Date(d)
    monday.setDate(d.getDate() + diff)
    const key = monday.toISOString().slice(0, 10)
    if (!weeks.has(key)) weeks.set(key, [])
    weeks.get(key).push(a)
  }
  return weeks
}

/** Returns the rolling N-week average for a given extractor function. */
function rollingWeeklyAverage(activities, weeks, extractor) {
  const cut = new Date()
  cut.setDate(cut.getDate() - weeks * 7)
  const recent = activities.filter(a => parseDate(a.date) >= cut)
  const byWeek = groupByWeek(recent)
  if (byWeek.size === 0) return 0
  const totals = Array.from(byWeek.values()).map(extractor)
  return totals.reduce((a, b) => a + b, 0) / byWeek.size
}

// ─── AEROBIC BASE ────────────────────────────────────────────────────────────

/**
 * Rolling 4-week zone 2 % across all cardio activities.
 * Excludes strength/mobility (no meaningful HR zone distribution).
 */
function computeZone2Percent(activities) {
  const cardioTiers = ['tier1', 'tier2', 'tier3']
  const cardio = activities.filter(a => {
    const tier = getActivityTier(a.activity_type)
    return cardioTiers.includes(tier)
  })
  const recent = recentActivities(cardio, 28)
  if (recent.length === 0) return null

  const totalMinutes = recent.reduce((s, a) => s + a.duration_minutes, 0)
  if (totalMinutes === 0) return null

  const zone2Minutes = recent.reduce((s, a) => {
    return s + (a.duration_minutes * (a.zone2_percent || 0)) / 100
  }, 0)

  return Math.round((zone2Minutes / totalMinutes) * 100)
}

// ─── ELEVATION CAPACITY ──────────────────────────────────────────────────────

/** Rolling 4-week average weekly elevation gain (metres). */
function computeWeeklyElevationGain(activities) {
  return Math.round(rollingWeeklyAverage(activities, 4,
    weekActivities => weekActivities.reduce((s, a) => s + (a.elevation_gain_m || 0), 0)
  ))
}

// ─── MULTI-DAY ENDURANCE ─────────────────────────────────────────────────────

/** Longest single activity in hours across all activities. */
function computeLongestActivityHrs(activities) {
  if (activities.length === 0) return 0
  const longest = Math.max(...activities.map(a => a.duration_minutes || 0))
  return longest / 60
}

/** Max number of consecutive active days across all activities. */
function computeMaxConsecutiveDays(activities) {
  if (activities.length === 0) return 0
  const dates = [...new Set(activities.map(a => a.date))].sort()
  let max = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = parseDate(dates[i - 1])
    const curr = parseDate(dates[i])
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      max = Math.max(max, current)
    } else {
      current = 1
    }
  }
  return max
}

// ─── STRENGTH ────────────────────────────────────────────────────────────────

/** Average strength sessions per week over last 4 weeks. */
function computeStrengthSessionsPerWeek(activities) {
  const strengthTypes = ['strength_legs', 'strength_core', 'strength_full']
  const recent = recentActivities(activities, 28)
  const sessions = recent.filter(a => strengthTypes.includes(a.activity_type))
  return sessions.length / 4
}

/** Average incline sessions per week over last 4 weeks. */
function computeInclineSessionsPerWeek(activities) {
  const inclineTypes = ['incline_walk', 'stair_climb']
  const recent = recentActivities(activities, 28)
  const sessions = recent.filter(a => inclineTypes.includes(a.activity_type))
  return sessions.length / 4
}

/**
 * Max pack weight carried in last 4 weeks (from activity data and enrichment).
 */
function computeMaxPackWeight(activities, enrichment = {}) {
  const recent = recentActivities(activities, 28)
  let max = 0
  for (const a of recent) {
    const packFromActivity = a.pack_weight_kg || 0
    const packFromEnrichment = enrichment.activities?.[a.id]?.pack_weight_kg || 0
    max = Math.max(max, packFromActivity, packFromEnrichment)
  }
  return max
}

/** Returns true if any strength session in enrichment has eccentric_focus: true. */
function computeEccentricConfirmed(activities, enrichment = {}) {
  const strengthTypes = ['strength_legs', 'strength_full']
  for (const a of activities) {
    if (!strengthTypes.includes(a.activity_type)) continue
    if (enrichment.activities?.[a.id]?.eccentric_focus === true) return true
  }
  return false
}

// ─── RECOVERY QUALITY ────────────────────────────────────────────────────────

/**
 * Computes 7-day HRV trend from activities with hrv data.
 * Returns: 'improving' | 'stable' | 'flat' | 'declining' | null
 */
function computeHrvTrend(activities) {
  const withHrv = activities
    .filter(a => a.hrv !== null && a.hrv !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)

  if (withHrv.length < 3) return null

  const values = withHrv.map(a => a.hrv)
  const slope = computeSlope(values)

  if (slope > 1.5) return 'improving'
  if (slope > 0.3) return 'stable'
  if (slope > -0.3) return 'flat'
  return 'declining'
}

/**
 * Computes 7-day RHR trend.
 * Returns: 'declining' (good) | 'stable' | 'flat' | 'rising' (bad) | null
 */
function computeRhrTrend(activities) {
  const withRhr = activities
    .filter(a => a.rhr !== null && a.rhr !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)

  if (withRhr.length < 3) return null

  const values = withRhr.map(a => a.rhr)
  const slope = computeSlope(values)

  if (slope < -0.3) return 'declining'
  if (slope < 0.3) return 'stable'
  if (slope < 1.0) return 'flat'
  return 'rising'
}

/** Simple linear regression slope over an array of numbers. */
function computeSlope(values) {
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean)
    den += (i - xMean) ** 2
  }
  return den === 0 ? 0 : num / den
}

// ─── ACTIVE DAYS PER WEEK ────────────────────────────────────────────────────

/** Average active days per week over last 4 weeks. */
function computeActiveDaysPerWeek(activities) {
  const recent = recentActivities(activities, 28)
  const uniqueDays = new Set(recent.map(a => a.date))
  return uniqueDays.size / 4
}

// ─── COMPOSITE SCORE ─────────────────────────────────────────────────────────

/**
 * Main entry point. Takes all activities + enrichment, returns full readiness result.
 *
 * @param {Array}  activities  - canonical activity array
 * @param {Object} enrichment  - enrichment.json data
 * @returns {ReadinessResult}
 */
export function calculateReadiness(activities = [], enrichment = {}) {
  if (activities.length === 0) {
    return { score: null, confidence: 'none', dimensions: {}, meta: {} }
  }

  const phase = getCurrentPhase()

  // Compute raw inputs
  const zone2Percent        = computeZone2Percent(activities)
  const weeklyElevationM    = computeWeeklyElevationGain(activities)
  const longestActivityHrs  = computeLongestActivityHrs(activities)
  const maxConsecutiveDays  = computeMaxConsecutiveDays(activities)
  const strengthPerWeek     = computeStrengthSessionsPerWeek(activities)
  const inclinePerWeek      = computeInclineSessionsPerWeek(activities)
  const maxPackWeight       = computeMaxPackWeight(activities, enrichment)
  const eccentricConfirmed  = computeEccentricConfirmed(activities, enrichment)
  const hrvTrend            = computeHrvTrend(activities)
  const rhrTrend            = computeRhrTrend(activities)
  const activeDaysPerWeek   = computeActiveDaysPerWeek(activities)

  // Score each dimension
  const rawScores = {
    aerobic_base:       scoreAerobicBase(zone2Percent),
    elevation_capacity: scoreElevationCapacity(weeklyElevationM, phase.phase),
    multiday_endurance: scoreMultidayEndurance(longestActivityHrs, maxConsecutiveDays),
    strength:           scoreStrength({
                          strengthSessionsPerWeek: strengthPerWeek,
                          inclineSessionsPerWeek:  inclinePerWeek,
                          eccentricWorkConfirmed:  eccentricConfirmed,
                          packWeightKg:            maxPackWeight,
                        }),
    recovery_quality:   scoreRecoveryQuality(hrvTrend, rhrTrend),
  }

  // If recovery data is absent, re-weight remaining dimensions proportionally
  const hasRecovery = rawScores.recovery_quality !== null
  const activeWeights = {}
  if (hasRecovery) {
    for (const [key, dim] of Object.entries(dimensions)) {
      activeWeights[key] = dim.weight
    }
  } else {
    const totalWithoutRecovery = 1 - dimensions.recovery_quality.weight
    for (const [key, dim] of Object.entries(dimensions)) {
      if (key === 'recovery_quality') continue
      activeWeights[key] = dim.weight / totalWithoutRecovery
    }
  }

  // Composite score
  let composite = 0
  for (const [key, weight] of Object.entries(activeWeights)) {
    const score = rawScores[key]
    if (score !== null && score !== undefined) {
      composite += score * weight
    }
  }

  // Confidence level
  const dataCoverage = activities.length
  let confidence = 'low'
  if (dataCoverage >= 20 && zone2Percent !== null && weeklyElevationM > 0) confidence = 'high'
  else if (dataCoverage >= 8) confidence = 'medium'

  return {
    score: Math.round(composite),
    confidence,
    hasRecoveryData: hasRecovery,
    dimensions: {
      aerobic_base: {
        score:    rawScores.aerobic_base,
        weight:   activeWeights.aerobic_base,
        input:    { zone2Percent },
        label:    dimensions.aerobic_base.label,
      },
      elevation_capacity: {
        score:    rawScores.elevation_capacity,
        weight:   activeWeights.elevation_capacity,
        input:    { weeklyElevationM, phase: phase.phase },
        label:    dimensions.elevation_capacity.label,
      },
      multiday_endurance: {
        score:    rawScores.multiday_endurance,
        weight:   activeWeights.multiday_endurance,
        input:    { longestActivityHrs: Math.round(longestActivityHrs * 10) / 10, maxConsecutiveDays },
        label:    dimensions.multiday_endurance.label,
      },
      strength: {
        score:    rawScores.strength,
        weight:   activeWeights.strength,
        input:    { strengthPerWeek: Math.round(strengthPerWeek * 10) / 10, inclinePerWeek: Math.round(inclinePerWeek * 10) / 10, eccentricConfirmed, maxPackWeight },
        label:    dimensions.strength.label,
      },
      recovery_quality: {
        score:    rawScores.recovery_quality,
        weight:   activeWeights.recovery_quality || dimensions.recovery_quality.weight,
        input:    { hrvTrend, rhrTrend },
        label:    dimensions.recovery_quality.label,
      },
    },
    meta: {
      phase:              phase.phase,
      phaseLabel:         phase.label,
      activeDaysPerWeek:  Math.round(activeDaysPerWeek * 10) / 10,
      totalActivities:    activities.length,
      dataWindowDays:     28,
    },
  }
}
