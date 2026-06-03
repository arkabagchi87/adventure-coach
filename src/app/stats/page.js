import { readFileSync } from 'fs'
import { join } from 'path'
import StatsClient from './StatsClient'
import BottomNav from '@/components/shared/BottomNav'

function loadData() {
  try {
    const path = join(process.cwd(), 'src/data/activities.json')
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return []
  }
}

export default function StatsPage() {
  const activities = loadData()

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between px-5 pt-12 pb-2">
          <h1 className="text-xl font-black text-white tracking-tight">Stats</h1>
          <p className="text-xs text-gray-500">Kilimanjaro-lens view</p>
        </div>
        <StatsClient activities={activities} />
      </div>
      <BottomNav />
    </div>
  )
}
