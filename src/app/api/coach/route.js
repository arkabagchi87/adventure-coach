import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { calculateReadiness } from '@/lib/scoring/calculateReadiness'
import { getDaysToGoal } from '@/lib/trajectory/calculateTrajectory'
import { buildCoachSystemPrompt, getCurrentPhase } from '@/config/goals/kilimanjaro'

function loadData() {
  try {
    const activities = JSON.parse(readFileSync(join(process.cwd(), 'src/data/activities.json'), 'utf8'))
    const enrichment = JSON.parse(readFileSync(join(process.cwd(), 'src/data/enrichment.json'), 'utf8'))
    return { activities, enrichment }
  } catch {
    return { activities: [], enrichment: {} }
  }
}

function buildActivitySummary(activities) {
  if (activities.length === 0) return 'No data yet.'
  const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const totalElev = activities.reduce((s, a) => s + (a.elevation_gain_m || 0), 0)
  const totalHrs  = activities.reduce((s, a) => s + (a.duration_minutes || 0), 0) / 60
  const recent = sorted.map(a =>
    `${a.date} ${a.activity_type} ${a.duration_minutes}min${a.elevation_gain_m ? ' '+a.elevation_gain_m+'m' : ''}${a.zone2_percent ? ' Z2:'+a.zone2_percent+'%' : ''}`
  ).join('; ')
  return `${activities.length} sessions, ${totalHrs.toFixed(0)}h, ${totalElev}m elev. Recent: ${recent}`
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
  const activitySummary = buildActivitySummary(activities)
  const currentPhase = getCurrentPhase()

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

    const result = await model.generateContent(fullPrompt)
    const text = result.response.text()

    return Response.json({ reply: text })
  } catch (err) {
    console.error('Gemini error:', err)
    return Response.json({
      error: 'Coach is unavailable right now. Please try again in a moment.',
    }, { status: 500 })
  }
}
