/**
 * Manual CSV Parser
 * For the downloadable template. Column names match the canonical schema exactly.
 * Most forgiving parser — accepts partial rows, skips invalid ones.
 */

const VALID_TYPES = [
  'run', 'hike', 'walk', 'incline_walk', 'stair_climb',
  'strength_legs', 'strength_core', 'strength_full',
  'trail_run', 'cycle', 'swim', 'yoga', 'mobility', 'stretch',
  'other',
]

function parseCSVLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  result.push(cur.trim())
  return result
}

function parseDate(raw) {
  if (!raw) return null
  const str = String(raw).trim().replace(/\//g, '-')
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const d = new Date(str)
  if (!isNaN(d)) return d.toISOString().slice(0, 10)
  return null
}

function parseNum(raw, fallback = null) {
  if (raw === null || raw === undefined || raw === '') return fallback
  const n = parseFloat(String(raw).replace(',', '.'))
  return isNaN(n) ? fallback : n
}

function parseActivityType(raw) {
  if (!raw) return null
  const cleaned = raw.toLowerCase().trim().replace(/\s+/g, '_')
  if (VALID_TYPES.includes(cleaned)) return cleaned
  // Fuzzy match
  if (cleaned.includes('hike') || cleaned.includes('hiking'))   return 'hike'
  if (cleaned.includes('run'))                                   return 'run'
  if (cleaned.includes('incline') || cleaned.includes('treadmill')) return 'incline_walk'
  if (cleaned.includes('stair'))                                 return 'stair_climb'
  if (cleaned.includes('strength') || cleaned.includes('gym'))  return 'strength_full'
  if (cleaned.includes('walk'))                                  return 'walk'
  if (cleaned.includes('cycle') || cleaned.includes('bike'))    return 'cycle'
  if (cleaned.includes('swim'))                                  return 'swim'
  if (cleaned.includes('yoga'))                                  return 'yoga'
  return null
}

export function parseManualCSV(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0]).map(h =>
    h.toLowerCase().trim().replace(/\s+/g, '_')
  )

  const col = (row, name) => {
    const i = headers.indexOf(name)
    return i !== -1 ? (row[i] ?? null) : null
  }

  const activities = []
  let idCounter = 1

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    if (row.every(c => !c)) continue

    const date         = parseDate(col(row, 'date'))
    const activityType = parseActivityType(col(row, 'activity_type'))
    const duration     = parseNum(col(row, 'duration_minutes'), 0)

    // Must have at minimum: date, activity type, duration
    if (!date || !activityType || duration < 5) continue

    activities.push({
      id:               `manual_${date}_${idCounter++}`,
      date,
      activity_type:    activityType,
      duration_minutes: Math.round(duration),
      distance_km:      parseNum(col(row, 'distance_km'), 0),
      elevation_gain_m: parseNum(col(row, 'elevation_gain_m')),
      avg_heart_rate:   parseNum(col(row, 'avg_heart_rate')),
      max_heart_rate:   parseNum(col(row, 'max_heart_rate')),
      zone1_percent:    parseNum(col(row, 'zone1_percent')),
      zone2_percent:    parseNum(col(row, 'zone2_percent')),
      zone3_percent:    parseNum(col(row, 'zone3_percent')),
      zone4_percent:    parseNum(col(row, 'zone4_percent')),
      zone5_percent:    parseNum(col(row, 'zone5_percent')),
      hrv:              parseNum(col(row, 'hrv')),
      rhr:              parseNum(col(row, 'rhr')),
      pack_weight_kg:   parseNum(col(row, 'pack_weight_kg')),
      notes:            col(row, 'notes') || null,
      source:           'manual',
    })
  }

  return activities
}

/** Returns the CSV template as a string for the user to download. */
export function getManualCSVTemplate() {
  const headers = [
    'date', 'activity_type', 'duration_minutes', 'distance_km',
    'elevation_gain_m', 'avg_heart_rate', 'max_heart_rate',
    'zone1_percent', 'zone2_percent', 'zone3_percent', 'zone4_percent', 'zone5_percent',
    'hrv', 'rhr', 'pack_weight_kg', 'notes',
  ]
  const example = [
    '2026-06-15', 'hike', '120', '9.5',
    '450', '132', '158',
    '15', '50', '25', '10', '0',
    '', '', '4', 'Hilly trail with pack',
  ]
  return [headers.join(','), example.join(',')].join('\n')
}
