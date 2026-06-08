import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const activities = JSON.parse(readFileSync(join(process.cwd(), 'src/data/activities.json'), 'utf8'))
    const enrichment = JSON.parse(readFileSync(join(process.cwd(), 'src/data/enrichment.json'), 'utf8'))
    return Response.json({ activities, enrichment })
  } catch {
    return Response.json({ activities: [], enrichment: {} })
  }
}
