import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { calculateReadiness } from '@/lib/scoring/calculateReadiness'
import { getDaysToGoal } from '@/lib/trajectory/calculateTrajectory'
import { buildCoachSystemPrompt } from '@/config/goals/kilimanjaro'

function loadData() {
  try {
    const activities = JSON.parse(readFileSync(join(process.cwd(), 'src/data/activities.json'), 'utf8'))
    const enrichment = JSON.parse(readFileSync(join(process.cwd(), 'src/data/enrichment.json'), 'utf8'))
    return { activities, enrichment }
  } catch {
    return { activities: [], enrichment: {} }
  }
}

function buildActivitySummary(activities, enrichment) {
  if (activities.length === 0) return 'No activities uploaded yet.'

  const recent = activities
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20)

  const totalActivities = activities.length
  const dateRange = `${activities[0].date} to ${activities[activities.length - 1].date}`

  const typeCounts = {}
  for (const a of activities) {
    typeCounts[a.activity_type] = (typeCounts[a.activity_type] || 0) + 1
  }

  const totalElevation = activities.reduce((s, a) => s + (a.elevation_gain_m || 0), 0)
  const totalHours = activities.reduce((s, a) => s + (a.duration_minutes || 0), 0) / 60

  const recentList = recent.map(a => {
    const enrich = enrichment.activities?.[a.id] || {}
    const parts = [
      `${a.date}: ${a.activity_type} ${a.duration_minutes}min`,
      a.elevation_gain_m ? `${a.elevation_gain_m}m gain` : null,
      a.avg_heart_rate ? `avg HR ${a.avg_heart_rate}` : null,
      a.zone2_percent ? `Z2 ${a.zone2_percent}%` : null,
      a.hrv ? `HRV ${a.hrv}` : null,
      enrich.incline_percent ? `${enrich.incline_percent}% incline` : null,
      enrich.eccentric_focus ? 'eccentric' : null,
      a.pack_weight_kg ? `${a.pack_weight_kg}kg pack` : null,
    ].filter(Boolean)
    return parts.join(', ')
  })

  return `Total: ${totalActivities} activities | ${dateRange}
Hours trained: ${totalHours.toFixed(1)}h | Total elevation: ${totalElevation}m
Activity mix: ${Object.entries(typeCounts).map(([t, n]) => `${t}×${n}`).join(', ')}

Recent 20 activities:
${recentList.join('\n')}`
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

  const { messages } = body
  if (!messages?.length) {
    return Response.json({ error: 'No messages provided.' }, { status: 400 })
  }

  const { activities, enrichment } = loadData()
  const readiness = calculateReadiness(activities, enrichment)
  const daysToGoal = getDaysToGoal()
  const activitySummary = buildActivitySummary(activities, enrichment)
  const systemPrompt = buildCoachSystemPrompt(activitySummary, readiness, daysToGoal)

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    })

    // Build history (all but last message)
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(lastMessage)
    const text = result.response.text()

    return Response.json({ reply: text })
  } catch (err) {
    console.error('Gemini error:', err)
    return Response.json({
      error: 'Coach is unavailable right now. Check your Gemini API key.',
    }, { status: 500 })
  }
}
