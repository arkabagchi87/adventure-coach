/**
 * Kilimanjaro Goal Config — v1.0
 * Hand-authored source of truth. All goal logic lives here.
 * Never put Kilimanjaro-specific knowledge in components.
 */

// ─── 1. GOAL METADATA ────────────────────────────────────────────────────────

export const goalMeta = {
  goal_id: 'kilimanjaro',
  name: 'Mount Kilimanjaro Summit',
  subtitle: 'Uhuru Peak — 5,895m',
  location: 'Tanzania, Africa',
  target_date: '2028-02-01',
  target_date_label: 'February 2028',
  recommended_route: 'Lemosho',
  route_duration_days: 8,
  summit_elevation_m: 5895,
  trailhead_elevation_m: 2100,
  total_elevation_gain_m: 4800,
  daily_hiking_hours: '5–8 hours (summit day 12–14 hours)',
  daily_elevation_gain_m: '900–1,200m per day',
  total_route_distance_km: 70,
  pack_weight_on_mountain_kg: '5–8kg daypack (porters carry main bag)',
  success_rate_lemosho: 'up to 98%',
  goal_type: 'trek',
  total_months: 21,
}

// ─── 2. READINESS DIMENSIONS ─────────────────────────────────────────────────

export const dimensions = {
  aerobic_base: {
    key: 'aerobic_base',
    label: 'Aerobic Base',
    weight: 0.35,
    description: 'Zone 2 training builds the oxygen efficiency Kilimanjaro demands.',
  },
  elevation_capacity: {
    key: 'elevation_capacity',
    label: 'Elevation Capacity',
    weight: 0.25,
    description: 'Weekly elevation gain directly simulates mountain demands.',
  },
  multiday_endurance: {
    key: 'multiday_endurance',
    label: 'Multi-day Endurance',
    weight: 0.20,
    description: 'Consecutive active days replicate the 8-day mountain push.',
  },
  strength: {
    key: 'strength',
    label: 'Strength',
    weight: 0.12,
    description: 'Leg & eccentric strength protects joints on ascent and descent.',
  },
  recovery_quality: {
    key: 'recovery_quality',
    label: 'Recovery Quality',
    weight: 0.08,
    description: 'HRV and RHR trends show whether training load is being absorbed.',
  },
}

// ─── 3. SCORING RUBRICS ──────────────────────────────────────────────────────

/**
 * Aerobic Base — scored by rolling 4-week zone2 %
 */
export function scoreAerobicBase(zone2Percent) {
  if (zone2Percent === null || zone2Percent === undefined) return null
  if (zone2Percent < 30) return 10
  if (zone2Percent < 40) return 25
  if (zone2Percent < 50) return 45
  if (zone2Percent < 60) return 65
  if (zone2Percent < 70) return 80
  if (zone2Percent < 80) return 92
  return 100
}

/**
 * Elevation Capacity — scored by rolling 4-week average weekly elevation gain (metres)
 * Score varies by training phase (1, 2, or 3)
 */
export function scoreElevationCapacity(weeklyElevationM, phase = 1) {
  if (weeklyElevationM === null || weeklyElevationM === undefined) return null
  const table = {
    1: [
      { min: 0,    max: 100,  score: 5   },
      { min: 100,  max: 300,  score: 30  },
      { min: 300,  max: 600,  score: 60  },
      { min: 600,  max: 900,  score: 80  },
      { min: 900,  max: 1200, score: 95  },
      { min: 1200, max: 1800, score: 100 },
      { min: 1800, max: Infinity, score: 100 },
    ],
    2: [
      { min: 0,    max: 100,  score: 5   },
      { min: 100,  max: 300,  score: 15  },
      { min: 300,  max: 600,  score: 35  },
      { min: 600,  max: 900,  score: 60  },
      { min: 900,  max: 1200, score: 80  },
      { min: 1200, max: 1800, score: 95  },
      { min: 1800, max: Infinity, score: 100 },
    ],
    3: [
      { min: 0,    max: 100,  score: 5   },
      { min: 100,  max: 300,  score: 5   },
      { min: 300,  max: 600,  score: 20  },
      { min: 600,  max: 900,  score: 40  },
      { min: 900,  max: 1200, score: 60  },
      { min: 1200, max: 1800, score: 80  },
      { min: 1800, max: Infinity, score: 100 },
    ],
  }
  const rows = table[phase] || table[1]
  const row = rows.find(r => weeklyElevationM >= r.min && weeklyElevationM < r.max)
  return row ? row.score : 100
}

/**
 * Multi-day Endurance — scored by longest activity duration + consecutive days bonus
 */
export function scoreMultidayEndurance(longestActivityHrs, maxConsecutiveDays = 1) {
  if (longestActivityHrs === null || longestActivityHrs === undefined) return null
  let base = 0
  if (longestActivityHrs < 1)  base = 10
  else if (longestActivityHrs < 2) base = 30
  else if (longestActivityHrs < 3) base = 50
  else if (longestActivityHrs < 5) base = 70
  else if (longestActivityHrs < 7) base = 88
  else                              base = 100

  let bonus = 0
  if (maxConsecutiveDays >= 3) bonus = 20
  else if (maxConsecutiveDays >= 2) bonus = 10

  return Math.min(100, base + bonus)
}

/**
 * Strength — scored by sessions/week and enrichment signals.
 * Rubric per Section 13.2 of kilimanjaro-goal-config.md.
 */
export function scoreStrength({
  strengthSessionsPerWeek = 0,
  inclineSessionsPerWeek = 0,
  inclineWithPack = false,
  eccentricWorkConfirmed = false,
  packWeightKg = 0,
  progressivePackWeight = false,
}) {
  let score = 0

  const hasStrength = strengthSessionsPerWeek > 0
  const hasIncline  = inclineSessionsPerWeek > 0

  if (!hasStrength && !hasIncline) {
    score = 0
  } else if (strengthSessionsPerWeek >= 2 && hasIncline && inclineWithPack) {
    score = 65 // 2 sessions/week + incline with pack
  } else if (strengthSessionsPerWeek >= 2) {
    score = 45 // 2 sessions/week, weighted
  } else {
    score = 20 // 1 session/week, bodyweight only
  }

  if (progressivePackWeight)  score = Math.min(100, score + 10)
  if (eccentricWorkConfirmed) score = Math.min(100, score + 15)
  if (packWeightKg > 10)      score = Math.min(100, score + 15)
  else if (packWeightKg > 8)  score = Math.min(100, score + 10)

  return score
}

/**
 * Recovery Quality — scored by HRV and RHR 7-day trends
 * trend: 'declining' | 'flat' | 'stable' | 'improving' | 'strong'
 */
export function scoreRecoveryQuality(hrvTrend, rhrTrend) {
  if (!hrvTrend || !rhrTrend) return null

  if (hrvTrend === 'declining' && rhrTrend === 'rising') return 10
  if (hrvTrend === 'flat' && rhrTrend === 'flat') return 50
  if (hrvTrend === 'stable' && rhrTrend === 'stable') return 65
  if (hrvTrend === 'improving' && rhrTrend === 'declining') return 85
  if (hrvTrend === 'strong' && rhrTrend === 'low') return 100

  // Mixed signals — interpolate
  if (hrvTrend === 'improving') return 75
  if (rhrTrend === 'declining') return 70
  if (hrvTrend === 'declining') return 30
  if (rhrTrend === 'rising') return 30
  return 50
}

// ─── 4. ACTIVITY TYPE HIERARCHY ──────────────────────────────────────────────

export const activityTiers = {
  tier1: {
    label: 'Highly Kili-specific',
    types: ['hike', 'incline_walk', 'stair_climb'],
    description: 'Full weight in all dimensions',
  },
  tier2: {
    label: 'Good Kili preparation',
    types: ['run', 'trail_run'],
    description: 'Full aerobic, partial elevation',
  },
  tier3: {
    label: 'Aerobic base building',
    types: ['cycle', 'swim', 'walk'],
    description: 'Counts for aerobic dimension only',
  },
  tier4: {
    label: 'Strength',
    types: ['strength_legs', 'strength_core', 'strength_full'],
    description: 'Counts for strength dimension only',
  },
  tier5: {
    label: 'Recovery / mobility',
    types: ['yoga', 'stretch', 'mobility'],
    description: 'Noted but minimal score contribution',
  },
}

export const allActivityTypes = [
  'run', 'hike', 'walk', 'incline_walk', 'stair_climb',
  'strength_legs', 'strength_core', 'strength_full',
  'trail_run', 'cycle', 'swim', 'yoga', 'mobility', 'stretch',
]

export function getActivityTier(activityType) {
  for (const [tierKey, tier] of Object.entries(activityTiers)) {
    if (tier.types.includes(activityType)) return tierKey
  }
  return 'tier3'
}

// ─── 5. TRAINING PHASES ──────────────────────────────────────────────────────

export const phases = [
  {
    phase: 1,
    label: 'Base Building',
    months: '1–6',
    monthStart: 1,
    monthEnd: 6,
    description: 'Build the aerobic engine. Establish consistency. Introduce elevation.',
    targets: {
      weeklyElevationGainM: { start: 0, end: 600 },
      zone2Percent: { start: 30, end: 60 },
      longestActivityHrs: { start: 0.75, end: 2.5 },
      activeDaysPerWeek: { start: 3, end: 5 },
      strengthSessionsPerWeek: { start: 0, end: 2 },
      packWeightKg: { start: 0, end: 4 },
    },
    coachPriority: 'Zone 2 correction is #1 priority. Slow down — every session should feel conversational.',
    never: [
      '6-hour+ hike sessions',
      'Pack weight above 6kg',
      '700m+ elevation gain per gym session',
      'Back-to-back multi-day simulation',
      'More than 10 hours training per week',
      'Altitude exposure or simulation',
    ],
    always: [
      'Zone 2 correction as the #1 priority',
      'Consistency over intensity — 5 days/week beats 2 hard days',
      'Start incline treadmill habit (20–30min at 8–10%)',
      'Bodyweight to light-weighted strength foundation',
      'Walks and easy hikes to build time-on-feet',
      'Boring is correct at this stage',
    ],
    coachLanguage: 'You have 21 months. The biggest risk right now is doing too much too soon. Build the aerobic engine first — everything else follows.',
  },
  {
    phase: 2,
    label: 'Endurance Building',
    months: '7–13',
    monthStart: 7,
    monthEnd: 13,
    description: 'Extend duration. Add load. Build elevation-specific capacity.',
    targets: {
      weeklyElevationGainM: { start: 600, end: 1200 },
      zone2Percent: { start: 60, end: 70 },
      longestActivityHrs: { start: 2.5, end: 5 },
      activeDaysPerWeek: { start: 5, end: 6 },
      strengthSessionsPerWeek: { start: 2, end: 2 },
      packWeightKg: { start: 4, end: 8 },
    },
    coachPriority: 'Introduce back-to-back training days. Begin eccentric descent training.',
    never: [
      '8-hour+ sessions',
      'Pack weight above 10kg',
      'Full multi-day simulation (2–3 nights)',
      'Summit night simulation',
    ],
    always: [
      'Progressive pack loading — add 1–2kg every 6 weeks',
      'Longer weekend hikes as the anchor session',
      'Back-to-back days (Saturday hike + Sunday strength)',
      'Elevating incline grade gradually (10% → 12% → 15%)',
      'Beginning eccentric descent training',
    ],
    coachLanguage: 'The base is built. Now we extend duration and add load. Your weekends are the most important training time now.',
  },
  {
    phase: 3,
    label: 'Simulation',
    months: '14–19',
    monthStart: 14,
    monthEnd: 19,
    description: 'Simulate Kilimanjaro conditions. Stress-test readiness.',
    targets: {
      weeklyElevationGainM: { start: 1200, end: 1800 },
      zone2Percent: { start: 70, end: 75 },
      longestActivityHrs: { start: 5, end: 8 },
      activeDaysPerWeek: { start: 6, end: 6 },
      strengthSessionsPerWeek: { start: 2, end: 2 },
      packWeightKg: { start: 8, end: 12 }, // train heavier than mountain weight
    },
    coachPriority: 'Complete two consecutive 6hr+ hiking days. Break in all gear on terrain.',
    never: [],
    always: [
      '6–8 hour hikes with pack',
      '10–12kg pack training (heavier than mountain weight)',
      '700m+ elevation gain per session',
      'Back-to-back 3-day hiking blocks',
      'Multi-day hike overnight simulation',
      '10+ hours training per week',
    ],
    coachLanguage: 'This is where we stress-test everything. The mountain is 6 months away. Every session should feel like preparation for a specific day on the route.',
  },
  {
    phase: 4,
    label: 'Taper',
    months: '20–21',
    monthStart: 20,
    monthEnd: 21,
    description: 'Arrive fresh and injury-free.',
    targets: {
      volumeReductionPercent: 35,
      strengthSessionsPerWeek: 1,
      packWeightKg: { start: 5, end: 6 }, // drop to match actual mountain weight
    },
    coachPriority: 'Stop adding new stimulus. Protect from injury. Gear check. Doctor re: Diamox.',
    never: [
      'New training stimulus of any kind',
      'Increasing volume or intensity',
      'New exercises or movements',
      'Heavy pack sessions',
    ],
    always: [
      'Reduce volume 30–40% from Phase 3 peak',
      'Maintain intensity but do not push',
      'Gear testing — boots, poles, layers, pack',
      'Sleep and nutrition focus',
      'Diamox consultation with doctor',
      'Mental preparation',
    ],
    coachLanguage: 'Stop adding new stimulus. Protect from injury at all costs. You\'ve done the work. Now let the body consolidate it.',
  },
]

/**
 * Returns the current training phase (1–4) based on months elapsed since a start date.
 * startDate defaults to June 2026 (approximate training start).
 */
export function getCurrentPhase(startDate = new Date('2026-06-01')) {
  const now = new Date()
  const monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12
    + (now.getMonth() - startDate.getMonth())

  for (const phase of phases) {
    if (monthsElapsed >= phase.monthStart - 1 && monthsElapsed <= phase.monthEnd - 1) {
      return phase
    }
  }
  // Default to phase 1 if before start, phase 4 if past end
  return monthsElapsed < 0 ? phases[0] : phases[3]
}

// ─── 6. MILESTONE GATES ──────────────────────────────────────────────────────

export const milestoneGates = [
  {
    month: 3,
    gates: [
      { id: 'm3_2hr_hike',      label: 'First 2-hour continuous hike completed' },
      { id: 'm3_strength',      label: 'First weighted strength session (legs) logged' },
    ],
  },
  {
    month: 6,
    gates: [
      { id: 'm6_zone2',         label: 'Zone 2 % above 50% for 4 consecutive weeks' },
      { id: 'm6_elevation_hike', label: 'First hike with 500m+ elevation gain in single session' },
      { id: 'm6_incline',       label: 'Incline treadmill 45min at 10%+ completed' },
    ],
  },
  {
    month: 9,
    gates: [
      { id: 'm9_zone2',         label: 'Zone 2 % above 60% for 4 consecutive weeks' },
      { id: 'm9_3hr',           label: 'Longest activity reached 3hrs+' },
      { id: 'm9_incline',       label: 'Incline treadmill 90min at 12% completed' },
      { id: 'm9_eccentric',     label: 'Eccentric descent training added to routine' },
    ],
  },
  {
    month: 12,
    gates: [
      { id: 'm12_pack_hike',    label: 'First 4–5hr hike with pack (4kg+) completed' },
      { id: 'm12_elevation',    label: 'Weekly elevation gain averaging 900m+ for 4 weeks' },
      { id: 'm12_backtoback',   label: 'First back-to-back active days (2 consecutive)' },
    ],
  },
  {
    month: 15,
    gates: [
      { id: 'm15_backtoback',   label: 'First back-to-back 3hr+ hike days (two consecutive days)' },
      { id: 'm15_pack',         label: 'Pack weight in training reached 6kg+' },
      { id: 'm15_incline',      label: 'Incline treadmill 90min at 15% with 4kg+ pack' },
    ],
  },
  {
    month: 18,
    gates: [
      { id: 'm18_6hr',          label: '6hr+ hike with 1,000m+ elevation gain completed' },
      { id: 'm18_consecutive',  label: 'Two consecutive 6hr+ hiking days completed' },
      { id: 'm18_gear',         label: 'All gear tested on actual terrain (boots, poles, layers)' },
    ],
  },
  {
    month: 20,
    gates: [
      { id: 'm20_multiday',     label: 'Multi-day hike completed (2–3 nights) OR two consecutive 8hr days' },
      { id: 'm20_diamox',       label: 'Doctor consulted re: Diamox / altitude protocol' },
      { id: 'm20_taper',        label: 'Taper begun — volume reduced, intensity maintained' },
    ],
  },
]

// ─── 7. RED FLAGS ────────────────────────────────────────────────────────────

export const redFlags = [
  {
    id: 'low_zone2',
    dimension: 'aerobic_base',
    condition: 'zone2Percent < 40 for 3+ consecutive weeks',
    message: "You're training in the wrong zone. The aerobic base Kilimanjaro needs builds in zone 2 — not zone 3–4. Slowing down is the right move, not a setback.",
  },
  {
    id: 'no_elevation',
    dimension: 'elevation_capacity',
    condition: 'no meaningful elevation gain for 4+ weeks',
    message: "You haven't accumulated meaningful elevation in a month. Kilimanjaro demands 900–1,200m of gain per day. This is the gap to close.",
  },
  {
    id: 'elevation_plateau',
    dimension: 'elevation_capacity',
    condition: 'elevation gain flat for 6+ weeks',
    message: "Your elevation load has flatlined. Time to find hillier routes or push the treadmill incline higher.",
  },
  {
    id: 'no_strength',
    dimension: 'strength',
    condition: 'no strength sessions for 3+ weeks',
    message: "No strength work in 3 weeks. Your legs need direct training — the mountain will expose this on days 5 and 6.",
  },
  {
    id: 'no_eccentric',
    dimension: 'strength',
    condition: 'no eccentric work ever logged',
    message: "I haven't seen any descent-specific training. The downhill will be brutal on your quads if you haven't trained this. Add slow step-downs or eccentric squats — this week.",
  },
  {
    id: 'low_incline',
    dimension: 'strength',
    condition: 'incline_percent < 10 from enrichment',
    message: "12 degrees on a treadmill is where Kilimanjaro prep begins. Below 10% isn't building the right stimulus.",
  },
  {
    id: 'gap',
    dimension: 'consistency',
    condition: 'no activity for 10+ days',
    message: "Life happens. Here's where you stand and what the next 4 weeks need to look like.",
  },
  {
    id: 'low_frequency',
    dimension: 'consistency',
    condition: 'active days/week averaging below 3 for a month',
    message: "You're getting 3 sessions a week but the mountain needs you at 5. Even short sessions count — consistency is the goal, not just volume.",
  },
  {
    id: 'hrv_declining',
    dimension: 'recovery_quality',
    condition: 'HRV declining for 10+ consecutive days',
    message: "Your recovery data is signalling stress. More training right now may be counterproductive. A lighter week could accelerate your progress.",
  },
  {
    id: 'rhr_elevated',
    dimension: 'recovery_quality',
    condition: 'RHR elevated 5+ bpm above baseline for 7+ days',
    message: "Elevated resting heart rate sustained for a week. This usually means inadequate recovery. Check sleep, stress, and training load.",
  },
  {
    id: 'ramp_too_fast',
    dimension: 'consistency',
    condition: 'week-on-week volume increase > 20%',
    message: "You increased load significantly this week. Kilimanjaro prep runs 21 months for a reason. Injury at month 8 is worse than slower progress now. Keep increases to 10% per week maximum.",
  },
]

// ─── 8. ROUTE DETAILS (for Coach context) ────────────────────────────────────

export const lemoshoRoute = [
  { day: 1, from: 'Londorossi Gate (2,100m)', to: 'Forest Camp (2,780m)',  km: 7,  hrs: 5,  elevGain: 680  },
  { day: 2, from: 'Forest Camp',               to: 'Shira 1 Camp (3,500m)', km: 8,  hrs: 5,  elevGain: 720  },
  { day: 3, from: 'Shira 1',                   to: 'Shira 2 (3,900m)',      km: 5,  hrs: 4,  elevGain: 400  },
  { day: 4, from: 'Shira 2',                   to: 'Barranco Camp (3,976m) via Lava Tower (4,630m)', km: 10, hrs: 7, elevGain: 730, note: 'Key acclimatisation day — climb high, sleep low' },
  { day: 5, from: 'Barranco',                  to: 'Karanga Camp (4,035m)', km: 5,  hrs: 4,  elevGain: 59,  note: 'Includes Barranco Wall scramble' },
  { day: 6, from: 'Karanga',                   to: 'Barafu Camp (4,673m)',  km: 5,  hrs: 4,  elevGain: 638, note: 'Rest before summit' },
  { day: 7, from: 'Barafu',                    to: 'Mweka Camp (3,100m) via Uhuru Peak (5,895m)', km: 16, hrs: 13, elevGain: 1222, note: 'Summit day — 12–14 hours continuous' },
  { day: 8, from: 'Mweka Camp',                to: 'Mweka Gate (1,640m)',   km: 10, hrs: 3.5, elevGain: 0  },
]

// ─── 10. CITY TRAINING MODE ──────────────────────────────────────────────────

/**
 * Elevation credit rates (metres/minute) for gym activities.
 * Derived from midpoints of the credit ranges in Section 11.1.
 *
 * stair_climb: ~7.2 m/min (325m / 45min baseline)
 * incline_walk at 10%: ~5.4 m/min  (325m / 60min)
 * incline_walk at 12%: ~6.25 m/min (375m / 60min)
 * incline_walk at 15%: ~7.9 m/min  (475m / 60min no pack), ~8.75 m/min (525m / 60min with pack)
 */
const CITY_ELEVATION_RATES = {
  stair_climb: { rate: 325 / 45 },
  incline_walk: {
    10: { nopack: 325 / 60, withpack: 325 / 60 },
    12: { nopack: 375 / 60, withpack: 375 / 60 },
    15: { nopack: 475 / 60, withpack: 525 / 60 },
  },
}

/**
 * Returns estimated elevation credit (metres) for a gym session.
 * Called when elevation_gain_m is absent but activity type and duration
 * indicate meaningful elevation-equivalent work (Section 11.1).
 *
 * @param {string}  activityType    - 'stair_climb' | 'incline_walk'
 * @param {number}  durationMinutes
 * @param {number}  inclinePercent  - only relevant for incline_walk (default 10)
 * @param {boolean} hasPackWeight   - whether user carried a pack
 * @returns {number} estimated elevation in metres (0 if not applicable)
 */
export function estimateCityElevationCredit(
  activityType,
  durationMinutes,
  inclinePercent = 10,
  hasPackWeight = false,
) {
  if (!activityType || !durationMinutes || durationMinutes <= 0) return 0

  if (activityType === 'stair_climb') {
    return Math.round(CITY_ELEVATION_RATES.stair_climb.rate * durationMinutes)
  }

  if (activityType === 'incline_walk') {
    const grade = inclinePercent >= 14 ? 15 : inclinePercent >= 11 ? 12 : 10
    const rateMap = CITY_ELEVATION_RATES.incline_walk[grade]
    const rate = hasPackWeight ? rateMap.withpack : rateMap.nopack
    return Math.round(rate * durationMinutes)
  }

  return 0
}

/**
 * Pack weight progression targets by phase (Section 11.3).
 * Train with double mountain weight to stress the body at sea level.
 */
export const packWeightProgression = [
  { phase: 1, label: 'Establish the habit',              minKg: 0,  maxKg: 4  },
  { phase: 2, label: 'Build load tolerance',             minKg: 4,  maxKg: 8  },
  { phase: 3, label: 'Train heavier than mountain weight', minKg: 8,  maxKg: 12 },
  { phase: 4, label: 'Match actual mountain weight',     minKg: 5,  maxKg: 6  },
]

// ─── 11. COACH SYSTEM PROMPT ─────────────────────────────────────────────────

/**
 * Builds the full coach system prompt for Gemini.
 * Pass currentPhase to inject phase-aware NEVER/ALWAYS rules (Section 12).
 *
 * @param {string}  activitySummary
 * @param {object}  readinessScore   - result from calculateReadiness()
 * @param {number}  daysToGoal
 * @param {object}  currentPhase     - phase object from phases array (optional)
 */
export function buildCoachSystemPrompt(activitySummary, readinessScore, daysToGoal, currentPhase = null) {
  const dims = readinessScore?.dimensions || {}
  const dimSummary = Object.entries(dims)
    .map(([k, d]) => `${d.label}: ${d.score ?? '?'}`)
    .join(', ')

  const phaseRules = currentPhase ? `

CURRENT PHASE: Phase ${currentPhase.phase} — ${currentPhase.label} (months ${currentPhase.months})
Phase coaching tone: "${currentPhase.coachLanguage}"
${currentPhase.never?.length ? `\nNEVER recommend in Phase ${currentPhase.phase}:\n${currentPhase.never.map(r => `- ${r}`).join('\n')}` : ''}
${currentPhase.always?.length ? `\nALWAYS recommend in Phase ${currentPhase.phase}:\n${currentPhase.always.map(r => `- ${r}`).join('\n')}` : ''}` : ''

  return `You are a mountaineering coach preparing Arka for Mount Kilimanjaro (Uhuru Peak, 5895m, Lemosho route, Feb 2028, ${daysToGoal} days away).

KILIMANJARO DEMANDS: 5-8hrs hiking/day for 8 consecutive days, summit day 12-14hrs, ~900-1200m gain/day, 5-8kg pack. Fitness does NOT prevent altitude sickness — never promise it does. Zone 2 = pole pole pace. Eccentric descent training is non-negotiable. City training (Stairmaster, incline treadmill) is legitimate Kilimanjaro preparation — never penalise gym-based work.

READINESS SCORE: ${readinessScore?.score ?? 'unknown'}/100 (${readinessScore?.confidence ?? 'low'} confidence)
DIMENSIONS: ${dimSummary}

TRAINING DATA: ${activitySummary}
${phaseRules}
RULES: Use Arka's actual data in every response. Be direct and honest. 2-3 paragraphs max. Flag red flags proactively. Never give generic advice.`
}
