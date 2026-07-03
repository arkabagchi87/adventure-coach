import { GoogleGenerativeAI } from '@google/generative-ai'
import { Langfuse } from 'langfuse'
import { calculateReadiness } from '@/lib/scoring/calculateReadiness'
import { getDaysToGoal } from '@/lib/trajectory/calculateTrajectory'
import { buildCoachSystemPrompt, getCurrentPhase, estimateCityElevationCredit } from '@/config/goals/kilimanjaro'

const CARDIO_TYPES   = new Set(['run','hike','walk','incline_walk','stair_climb','trail_run','cycle','swim'])
const STRENGTH_TYPES = new Set(['strength_legs','strength_core','strength_full'])
const INCLINE_TYPES  = new Set(['incline_walk','stair_climb'])

function elevCredit(a, enrichment) {
  if (a.elevation_gain_m > 0) return a.elevation_gain_m
  if (!INCLINE_TYPES.has(a.activity_type)) return 0
  const ae = enrichment.activities?.[a.id] || {}
  const incline = ae.incline_percent ?? enrichment.defaults?.treadmill_incline ?? 10
  const hasPack = (ae.pack_weight_kg ?? enrichment.defaults?.pack_weight_kg ?? 0) > 0
  return estimateCityElevationCredit(a.activity_type, a.duration_minutes, incline, hasPack)
}

function mondayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().slice(0, 10)
}

/**
 * Builds a structured training-history summary for the coach LLM.
 * Covers the full dataset without dumping raw activities (token-efficient).
 */
function buildActivitySummary(activities, enrichment = {}) {
  if (activities.length === 0) return 'No activity data yet.'

  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date))
  const totalHrs = sorted.reduce((s, a) => s + (a.duration_minutes || 0), 0) / 60
  const dateRange = `${sorted[0].date} to ${sorted[sorted.length - 1].date}`

  // ── Monthly breakdown ────────────────────────────────────────────────────
  const byMonth = {}
  for (const a of sorted) {
    const m = a.date.slice(0, 7)
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(a)
  }

  const monthLines = Object.entries(byMonth).map(([month, acts]) => {
    const typeCounts = {}
    let elev = 0, z2Min = 0, cardioMin = 0, z2SessionCount = 0
    for (const a of acts) {
      typeCounts[a.activity_type] = (typeCounts[a.activity_type] || 0) + 1
      elev += elevCredit(a, enrichment)
      if (CARDIO_TYPES.has(a.activity_type) && a.zone2_percent !== null) {
        z2Min          += a.duration_minutes * (a.zone2_percent / 100)
        cardioMin      += a.duration_minutes
        z2SessionCount += 1
      }
    }
    const typeStr = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([t, c]) => {
        const label = t === 'strength_full' ? 'strength' : t === 'incline_walk' ? 'incline' : t
        return `${label}×${c}`
      }).join(' ')
    const elevStr = elev > 0 ? ` ${Math.round(elev)}m↑` : ''
    let z2Str = ''
    if (cardioMin > 0) {
      const z2Pct = Math.round(z2Min / cardioMin * 100)
      const sparse = z2SessionCount === 1 ? ' ⚠ 1 session only' : ` n=${z2SessionCount}`
      z2Str = ` Z2:${z2Pct}% (${sparse})`
    }
    return `  ${month}: ${acts.length}s (${typeStr})${elevStr}${z2Str}`
  })

  // ── Weekly volumes — best and lightest ───────────────────────────────────
  const weekMap = {}
  for (const a of sorted) {
    const wk = mondayOf(a.date)
    if (!weekMap[wk]) weekMap[wk] = { sessions: 0, minutes: 0, elev: 0 }
    weekMap[wk].sessions++
    weekMap[wk].minutes += a.duration_minutes || 0
    weekMap[wk].elev += elevCredit(a, enrichment)
  }
  const weeks = Object.entries(weekMap).sort((a, b) => b[1].minutes - a[1].minutes)
  const fmt = ([wk, w]) =>
    `w/c ${wk}: ${w.sessions} sessions ${(w.minutes / 60).toFixed(1)}h${w.elev > 0 ? ' ' + Math.round(w.elev) + 'm↑' : ''}`
  const bestWeeks    = weeks.slice(0, 5).map(fmt).join('\n  ')
  const lightestWeeks = weeks.slice(-5).reverse().map(fmt).join('\n  ')

  // ── Strength trend ───────────────────────────────────────────────────────
  const now   = new Date()
  const dAgo  = n => { const d = new Date(now); d.setDate(d.getDate() - n); return d }
  const cut4w  = dAgo(28), cut12w = dAgo(84)
  const str4w  = sorted.filter(a => STRENGTH_TYPES.has(a.activity_type) && new Date(a.date + 'T00:00:00') >= cut4w).length
  const str12w = sorted.filter(a => STRENGTH_TYPES.has(a.activity_type) && new Date(a.date + 'T00:00:00') >= cut12w).length
  const strAll = sorted.filter(a => STRENGTH_TYPES.has(a.activity_type)).length

  // ── Milestones ───────────────────────────────────────────────────────────
  const runs     = sorted.filter(a => a.activity_type === 'run')
  const inclines = sorted.filter(a => a.activity_type === 'incline_walk')
  const longest  = [...sorted].sort((a, b) => b.duration_minutes - a.duration_minutes)[0]
  const longestRun     = runs.length     ? [...runs].sort((a, b) => b.duration_minutes - a.duration_minutes)[0] : null
  const longestIncline = inclines.length ? [...inclines].sort((a, b) => b.duration_minutes - a.duration_minutes)[0] : null

  const dates = [...new Set(sorted.map(a => a.date))].sort()
  let maxStreak = 1, curStreak = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i] + 'T00:00:00') - new Date(dates[i - 1] + 'T00:00:00')) / 86400000
    curStreak = diff === 1 ? curStreak + 1 : 1
    maxStreak = Math.max(maxStreak, curStreak)
  }

  const noZoneCount = sorted.filter(a =>
    CARDIO_TYPES.has(a.activity_type) &&
    !STRENGTH_TYPES.has(a.activity_type) &&
    a.zone2_percent === null
  ).length

  // ── Assemble ─────────────────────────────────────────────────────────────
  return [
    `${activities.length} sessions | ${totalHrs.toFixed(0)}h total | ${dateRange}`,
    '',
    'MONTHLY LOG (s=sessions, ↑=elevation, Z2=zone2 avg):',
    ...monthLines,
    '',
    `STRENGTH: ${strAll} sessions total | last 4 wks: ${str4w} (${(str4w / 4).toFixed(1)}/wk) | last 12 wks: ${str12w} (${(str12w / 12).toFixed(1)}/wk)`,
    '',
    'BEST WEEKS (by training volume):',
    `  ${bestWeeks}`,
    '',
    'LIGHTEST WEEKS:',
    `  ${lightestWeeks}`,
    '',
    'MILESTONES:',
    `  Longest session: ${longest?.duration_minutes}min ${longest?.activity_type} (${longest?.date})`,
    longestRun     ? `  Longest run: ${longestRun.duration_minutes}min (${longestRun.date})`              : '',
    longestIncline ? `  Longest incline: ${longestIncline.duration_minutes}min (${longestIncline.date})` : '',
    `  Max consecutive active days: ${maxStreak}`,
    `  Cardio sessions without zone data: ${noZoneCount} (HR zones not recorded by watch)`,
  ].filter(l => l !== '').join('\n')
}

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Gemini API key not configured.' }, { status: 500 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { messages, activities = [], enrichment = {}, dailyMetrics = [], recoveryOptedOut = false } = body
  if (!messages?.length) {
    return Response.json({ error: 'No messages provided.' }, { status: 400 })
  }

  const readiness = calculateReadiness(activities, enrichment, dailyMetrics, recoveryOptedOut)
  const daysToGoal = getDaysToGoal()
  const activitySummary = buildActivitySummary(activities, enrichment)
  const currentPhase = getCurrentPhase()

  // Initialise Langfuse
  const lfPublicKey = process.env.LANGFUSE_PUBLIC_KEY ?? ''
  const lfSecretKey = process.env.LANGFUSE_SECRET_KEY ?? ''
  console.log('[Langfuse] publicKey present:', !!lfPublicKey, '| secretKey present:', !!lfSecretKey)

  const langfuse = new Langfuse({
    publicKey:     lfPublicKey,
    secretKey:     lfSecretKey,
    baseUrl:       process.env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com',
    flushAt:       1,
    flushInterval: 0,
  })
  console.log('[Langfuse] baseUrl:', process.env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const userMessages = messages.filter(m => m.role === 'user')
    const lastUserMessage = userMessages[userMessages.length - 1]?.content
    if (!lastUserMessage) {
      return Response.json({ error: 'No user message found.' }, { status: 400 })
    }

    const systemPrompt = buildCoachSystemPrompt(activitySummary, readiness, daysToGoal, currentPhase)
    const fullPrompt = `${systemPrompt}

Question: ${lastUserMessage}

Answer:`

    // Debug: log the full context sent to Gemini (visible in Vercel function logs)
    console.log('=== COACH CONTEXT SENT TO GEMINI ===')
    console.log(fullPrompt)
    console.log('=== END COACH CONTEXT ===')

    // Langfuse trace — wraps the full Gemini generation
    const zone2Window   = readiness.dimensions?.aerobic_base?.input?.zone2Window ?? null
    const aerobicScore  = readiness.dimensions?.aerobic_base?.score ?? null
    const trace = langfuse.trace({
      name: 'coach-response',
      input: { activitySummary, question: lastUserMessage },
      metadata: {
        userId:       'arka',
        goalType:     'kilimanjaro',
        phase:        currentPhase?.phase ?? null,
        daysToGoal,
        zone2Window,
        aerobicScore,
      },
    })

    const result = await model.generateContent(fullPrompt)
    const text = result.response.text()

    trace.update({ output: text })

    // Must await flush before returning — Vercel terminates the function
    // the moment the response is sent, killing any background async work.
    try {
      await langfuse.flushAsync()
      console.log('[Langfuse] flush completed successfully')
    } catch (lfErr) {
      console.error('[Langfuse] flush failed:', lfErr?.message ?? lfErr)
    }

    return Response.json({ reply: text })
  } catch (err) {
    console.error('Gemini error:', err)
    return Response.json({
      error: 'Coach is unavailable right now. Please try again in a moment.',
    }, { status: 500 })
  }
}
