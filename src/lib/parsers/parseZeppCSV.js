/**
 * Zepp CSV Parser
 * Normalises Zepp/Amazfit export to canonical activity schema.
 * Zepp exports one row per activity with columns like:
 * Date, Type, Duration, Distance, Calories, Avg Heart Rate, Max Heart Rate, etc.
 */

const ZEPP_TYPE_MAP = {
  'outdoor running':    'run',
  'running':            'run',
  'treadmill running':  'run',
  'trail running':      'trail_run',
  'outdoor walking':    'walk',
  'walking':            'walk',
  'treadmill':          'incline_walk',
  'treadmill walking':  'incline_walk',
  'hiking':             'hike',
  'outdoor hiking':     'hike',
  'stair climbing':     'stair_climb',
  'strength training':  'strength_full',
  'indoor cycling':     'cycle',
  'cycling':            'cycle',
  'outdoor cycling':    'cycle',
  'swimming':           'swim',
  'yoga':               'yoga',
  'elliptical':         'cycle',
  'other':              'walk',
}

function normaliseType(raw) {
  if (!raw) return 'walk'
  const key = raw.toLowerCase().trim()
  return ZEPP_TYPE_MAP[key] || 'walk'
}

function parseMinutes(raw) {
  if (!raw) return 0
  // Formats: "45:30", "1:02:15", "45", "45m", "1h 30m"
  const str = String(raw).trim()
  if (str.includes(':')) {
    const parts = str.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60
    if (parts.length === 2) return parts[0] + parts[1] / 60
  }
  if (str.includes('h')) {
    const h = parseFloat(str) || 0
    const mMatch = str.match(/(\d+)m/)
    return h * 60 + (mMatch ? parseInt(mMatch[1]) : 0)
  }
  return parseFloat(str) || 0
}

function parseNum(raw) {
  if (raw === null || raw === undefined || raw === '') return null
  const n = parseFloat(String(raw).replace(',', '.'))
  return isNaN(n) ? null : n
}

function parseDate(raw) {
  if (!raw) return null
  // Zepp: "2026-06-02" or "2026/06/02" or "Jun 2, 2026"
  const str = String(raw).trim().replace(/\//g, '-')
  const iso = str.match(/^\d{4}-\d{2}-\d{2}/)
  if (iso) return iso[0]
  const d = new Date(str)
  if (!isNaN(d)) return d.toISOString().slice(0, 10)
  return null
}

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

export function parseZeppCSV(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())

  const col = (row, ...names) => {
    for (const name of names) {
      const i = headers.findIndex(h => h.includes(name))
      if (i !== -1) return row[i] ?? null
    }
    return null
  }

  const activities = []
  let idCounter = 1

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    if (row.length < 3) continue

    const date = parseDate(col(row, 'date', 'time', 'start'))
    if (!date) continue

    const rawType  = col(row, 'type', 'sport', 'activity')
    const duration = parseMinutes(col(row, 'duration', 'time'))
    const distance = parseNum(col(row, 'distance'))
    const elevGain = parseNum(col(row, 'altitude gain', 'elevation gain', 'ascent', 'climb'))
    const avgHr    = parseNum(col(row, 'avg heart rate', 'average heart rate', 'avg hr', 'heart rate'))
    const maxHr    = parseNum(col(row, 'max heart rate', 'maximum heart rate', 'max hr'))

    if (duration < 5) continue // skip accidental / too-short entries

    activities.push({
      id: `zepp_${date}_${idCounter++}`,
      date,
      activity_type:      normaliseType(rawType),
      duration_minutes:   Math.round(duration),
      distance_km:        distance !== null ? Math.round(distance * 100) / 100 : 0,
      elevation_gain_m:   elevGain !== null ? Math.round(elevGain) : 0,
      avg_heart_rate:     avgHr,
      max_heart_rate:     maxHr,
      zone1_percent:      null,
      zone2_percent:      null,
      zone3_percent:      null,
      zone4_percent:      null,
      zone5_percent:      null,
      hrv:                null,
      rhr:                null,
      pack_weight_kg:     null,
      notes:              `Imported from Zepp — ${rawType || 'activity'}`,
      source:             'zepp',
    })
  }

  return activities
}
