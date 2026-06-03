/**
 * Apple Health XML Parser
 * Parses the export.xml from Apple Health.
 * Works in Node.js (API route) — uses regex-based parsing, no DOM dependency.
 *
 * Relevant record types:
 *   HKWorkoutActivityType* — workouts with duration, distance, energy
 *   HKQuantityTypeIdentifierHeartRate — individual HR readings
 *   HKQuantityTypeIdentifierHeartRateVariabilitySDNN — HRV
 *   HKQuantityTypeIdentifierRestingHeartRate — RHR
 */

const APPLE_TYPE_MAP = {
  'HKWorkoutActivityTypeRunning':          'run',
  'HKWorkoutActivityTypeTraditionalStrengthTraining': 'strength_full',
  'HKWorkoutActivityTypeFunctionalStrengthTraining':  'strength_full',
  'HKWorkoutActivityTypeHiking':           'hike',
  'HKWorkoutActivityTypeWalking':          'walk',
  'HKWorkoutActivityTypeCycling':          'cycle',
  'HKWorkoutActivityTypeSwimming':         'swim',
  'HKWorkoutActivityTypeYoga':             'yoga',
  'HKWorkoutActivityTypeStairClimbing':    'stair_climb',
  'HKWorkoutActivityTypeElliptical':       'cycle',
  'HKWorkoutActivityTypeCrossTraining':    'strength_full',
  'HKWorkoutActivityTypeMixedCardio':      'run',
  'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'run',
}

function parseISODate(str) {
  if (!str) return null
  return str.slice(0, 10)
}

function extractAttr(tag, attr) {
  const match = tag.match(new RegExp(`${attr}="([^"]*)"`, 'i'))
  return match ? match[1] : null
}

function extractWorkouts(xml) {
  const workouts = []
  const workoutRegex = /<Workout\s[^>]*>[\s\S]*?<\/Workout>/g
  const matches = xml.match(workoutRegex) || []

  let idCounter = 1

  for (const block of matches) {
    const openTag = block.match(/<Workout\s[^>]*/)?.[0] || ''
    const activityType = extractAttr(openTag, 'workoutActivityType')
    const mappedType   = APPLE_TYPE_MAP[activityType]
    if (!mappedType) continue

    const startDate = extractAttr(openTag, 'startDate')
    const endDate   = extractAttr(openTag, 'endDate')
    const date      = parseISODate(startDate)
    if (!date) continue

    // Duration in minutes
    let durationMin = 0
    if (startDate && endDate) {
      durationMin = (new Date(endDate) - new Date(startDate)) / 60000
    }
    const durationAttr = extractAttr(openTag, 'duration')
    if (durationAttr) {
      const unit = extractAttr(openTag, 'durationUnit') || 'min'
      const val  = parseFloat(durationAttr) || 0
      durationMin = unit.toLowerCase().startsWith('h') ? val * 60 : val
    }
    if (durationMin < 5) continue

    // Distance
    let distanceKm = 0
    const distMatch = block.match(/WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*sum="([^"]+)"[^>]*unit="([^"]+)"/i)
    if (distMatch) {
      const val  = parseFloat(distMatch[1]) || 0
      const unit = distMatch[2].toLowerCase()
      distanceKm = unit.startsWith('km') ? val : val * 1.60934
    }

    // Elevation
    let elevGain = 0
    const elevMatch = block.match(/WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierFlightsClimbed"[^>]*sum="([^"]+)"/i)
    if (elevMatch) {
      elevGain = (parseFloat(elevMatch[1]) || 0) * 3 // approx: 1 flight ≈ 3m
    }

    // HR stats
    let avgHr = null, maxHr = null
    const hrAvgMatch = block.match(/WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierHeartRate"[^>]*average="([^"]+)"/i)
    const hrMaxMatch = block.match(/WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierHeartRate"[^>]*maximum="([^"]+)"/i)
    if (hrAvgMatch) avgHr = Math.round(parseFloat(hrAvgMatch[1]))
    if (hrMaxMatch) maxHr = Math.round(parseFloat(hrMaxMatch[1]))

    workouts.push({
      id:               `apple_${date}_${idCounter++}`,
      date,
      activity_type:    mappedType,
      duration_minutes: Math.round(durationMin),
      distance_km:      Math.round(distanceKm * 100) / 100,
      elevation_gain_m: Math.round(elevGain),
      avg_heart_rate:   avgHr,
      max_heart_rate:   maxHr,
      zone1_percent:    null,
      zone2_percent:    null,
      zone3_percent:    null,
      zone4_percent:    null,
      zone5_percent:    null,
      hrv:              null,
      rhr:              null,
      pack_weight_kg:   null,
      notes:            `Imported from Apple Health — ${activityType}`,
      source:           'apple_health',
    })
  }

  return workouts
}

function extractHrvReadings(xml) {
  const readings = {}
  const regex = /<Record[^>]*type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/gi
  let match
  while ((match = regex.exec(xml)) !== null) {
    const date = parseISODate(match[1])
    const val  = parseFloat(match[2])
    if (date && !isNaN(val)) {
      // Keep highest HRV reading per day
      readings[date] = Math.max(readings[date] || 0, Math.round(val))
    }
  }
  return readings
}

function extractRhrReadings(xml) {
  const readings = {}
  const regex = /<Record[^>]*type="HKQuantityTypeIdentifierRestingHeartRate"[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/gi
  let match
  while ((match = regex.exec(xml)) !== null) {
    const date = parseISODate(match[1])
    const val  = Math.round(parseFloat(match[2]))
    if (date && !isNaN(val)) {
      readings[date] = val
    }
  }
  return readings
}

export function parseAppleHealthXML(xmlText) {
  const workouts  = extractWorkouts(xmlText)
  const hrvByDate = extractHrvReadings(xmlText)
  const rhrByDate = extractRhrReadings(xmlText)

  // Attach HRV/RHR to same-day workouts
  for (const w of workouts) {
    if (hrvByDate[w.date]) w.hrv = hrvByDate[w.date]
    if (rhrByDate[w.date]) w.rhr = rhrByDate[w.date]
  }

  return workouts
}
