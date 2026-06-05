/**
 * Analyses a batch of imported activities and produces a data quality report.
 * The enrichment UI is driven entirely by this report — no questions are asked
 * about fields that are already present in the data.
 *
 * Priority rules (from Task 4 spec):
 *
 * Priority 1 — always ask if missing AND no stored default:
 *   1. zone2_percent missing across most cardio activities → ask max HR
 *   2. elevation_gain_m missing for outdoor activities → ask terrain type
 *   3. elevation_gain_m missing for treadmill/indoor → ask incline %
 *   4. strength_focus missing for strength sessions → ask focus area
 *
 * Priority 2 — ask if missing AND no prior default:
 *   5. hrv missing → ask HRV range
 *   6. pack_weight_kg missing for hike/incline → ask pack weight
 *
 * Returns up to 5 questions in priority order.
 */

const CARDIO_TYPES  = ['run', 'hike', 'walk', 'incline_walk', 'stair_climb', 'trail_run', 'cycle', 'swim']
const OUTDOOR_TYPES = ['run', 'hike', 'walk', 'trail_run']
const INDOOR_ELEVATION_TYPES = ['incline_walk', 'stair_climb']
const STRENGTH_TYPES = ['strength_legs', 'strength_core', 'strength_full']
const PACK_RELEVANT  = ['hike', 'incline_walk', 'stair_climb', 'trail_run']

/**
 * @param {Array}  activities  - the NEWLY imported activities (not full store)
 * @param {Object} enrichment  - current enrichment.json content (to check stored defaults)
 * @returns {{ dataQuality: Object, questions: Array }}
 */
export function generateDataQualityReport(activities, enrichment = {}) {
  const defaults = enrichment.defaults || {}

  // ── Gather counts ────────────────────────────────────────────────────────

  const cardio    = activities.filter(a => CARDIO_TYPES.includes(a.activity_type))
  const outdoor   = activities.filter(a => OUTDOOR_TYPES.includes(a.activity_type))
  const indoor    = activities.filter(a => INDOOR_ELEVATION_TYPES.includes(a.activity_type))
  const strength  = activities.filter(a => STRENGTH_TYPES.includes(a.activity_type))
  const packTypes = activities.filter(a => PACK_RELEVANT.includes(a.activity_type))

  const missingZones    = cardio.filter(a => a.zone2_percent === null || a.zone2_percent === undefined)
  const missingOutElev  = outdoor.filter(a => !a.elevation_gain_m)
  const missingIndElev  = indoor.filter(a => !a.elevation_gain_m)
  const missingHrv      = activities.filter(a => a.hrv === null || a.hrv === undefined)
  const missingPack     = packTypes.filter(a => a.pack_weight_kg === null || a.pack_weight_kg === undefined)

  // ── Data quality summary ─────────────────────────────────────────────────

  const dataQuality = {
    zone2_percent:    { present: cardio.length - missingZones.length,   missing: missingZones.length },
    elevation_gain_m: { present: outdoor.length - missingOutElev.length, missing: missingOutElev.length },
    incline_percent:  { present: indoor.length - missingIndElev.length,  missing: missingIndElev.length },
    strength_focus:   { present: 0, missing: strength.length },
    hrv:              { present: activities.length - missingHrv.length,  missing: missingHrv.length },
    pack_weight_kg:   { present: packTypes.length - missingPack.length,  missing: missingPack.length },
  }

  // ── Build questions ───────────────────────────────────────────────────────

  const questions = []

  // P1-a: zone2 missing for majority of cardio activities + no max_hr default
  const zoneMissingRatio = cardio.length > 0 ? missingZones.length / cardio.length : 0
  if (zoneMissingRatio > 0.5 && !defaults.max_hr) {
    questions.push({
      id: 'max_hr',
      priority: 1,
      title: 'Confirm your maximum heart rate',
      body: `We use your max HR to calculate which training zones you spend time in — this drives your aerobic base score. The default is 180 bpm.`,
      type: 'number',
      defaultValue: 180,
      unit: 'bpm',
      saveAs: 'defaults.max_hr',
    })
  }

  // P1-b: outdoor elevation missing + no terrain default
  if (missingOutElev.length > 0 && !defaults.outdoor_terrain) {
    questions.push({
      id: 'outdoor_terrain',
      priority: 1,
      title: 'What terrain do you typically train on outdoors?',
      body: `${missingOutElev.length} of your outdoor sessions have no elevation data. Your terrain type lets us estimate elevation gain for scoring.`,
      type: 'options',
      options: [
        { value: 'flat',         label: 'Flat',          sub: 'Parks, pavements, canal paths' },
        { value: 'hilly',        label: 'Hilly',         sub: 'Rolling hills, some steep sections' },
        { value: 'steep_trail',  label: 'Steep trails',  sub: 'Mountain paths, technical terrain' },
      ],
      saveAs: 'defaults.outdoor_terrain',
    })
  }

  // P1-c: indoor elevation missing + no incline default
  if (missingIndElev.length > 0 && !defaults.treadmill_incline) {
    questions.push({
      id: 'treadmill_incline',
      priority: 1,
      title: 'What incline do you use for treadmill sessions?',
      body: `${missingIndElev.length} treadmill/indoor session${missingIndElev.length > 1 ? 's' : ''} ${missingIndElev.length > 1 ? 'have' : 'has'} no incline data.`,
      type: 'options',
      options: [
        { value: 5,  label: 'Flat (0–5%)',     sub: 'Minimal incline or flat' },
        { value: 8,  label: 'Moderate (6–10%)', sub: 'Noticeable but manageable' },
        { value: 12, label: 'Steep (11–15%)',   sub: 'Challenging — this is Kili-specific work' },
        { value: 16, label: 'Max (15%+)',        sub: 'Maximum incline setting' },
      ],
      saveAs: 'defaults.treadmill_incline',
    })
  }

  // P1-d: strength sessions exist + no focus default
  if (strength.length > 0 && !defaults.strength_focus) {
    questions.push({
      id: 'strength_focus',
      priority: 1,
      title: 'What do you focus on in strength sessions?',
      body: `${strength.length} strength session${strength.length > 1 ? 's' : ''} logged. Legs and eccentric work are the most important for Kilimanjaro.`,
      type: 'options',
      options: [
        { value: 'legs',      label: 'Legs',      sub: 'Squats, lunges, step-ups, deadlifts' },
        { value: 'core',      label: 'Core',       sub: 'Planks, dead bugs, leg raises' },
        { value: 'full_body', label: 'Full body',  sub: 'Mix of legs, core, upper' },
        { value: 'upper',     label: 'Upper body', sub: 'Minimal Kili benefit — worth noting' },
      ],
      saveAs: 'defaults.strength_focus',
    })
  }

  // P2-a: pack weight missing for relevant activities + no pack default
  if (missingPack.length > 0 && !defaults.pack_weight_kg) {
    questions.push({
      id: 'pack_weight',
      priority: 2,
      title: 'Do you carry weight during hikes and treadmill sessions?',
      body: `Pack training is important for Kilimanjaro. On summit day you'll carry 5–8kg.`,
      type: 'options',
      options: [
        { value: 0, label: 'No pack',      sub: 'Bodyweight only' },
        { value: 2, label: 'Light (<3kg)', sub: 'Small daypack / water only' },
        { value: 4, label: 'Medium (3–5kg)', sub: 'Getting Kili-specific' },
        { value: 7, label: 'Heavy (5kg+)', sub: 'Excellent summit prep' },
      ],
      saveAs: 'defaults.pack_weight_kg',
    })
  }

  // Trim to max 5
  return {
    dataQuality,
    questions: questions.slice(0, 5),
  }
}
