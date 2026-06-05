import { readFileSync } from 'fs'
import { join } from 'path'
import BottomNav from '@/components/shared/BottomNav'
import CoachClient from './CoachClient'

function getLastActivityDate() {
  try {
    const activities = JSON.parse(
      readFileSync(join(process.cwd(), 'src/data/activities.json'), 'utf8')
    )
    if (!activities.length) return null
    return [...activities].sort((a, b) => b.date.localeCompare(a.date))[0].date
  } catch {
    return null
  }
}

export default function CoachPage() {
  const lastActivityDate = getLastActivityDate()
  const daysOld = lastActivityDate
    ? Math.floor((Date.now() - new Date(lastActivityDate + 'T00:00:00').getTime()) / 86400000)
    : null

  return (
    // h-[100dvh] locks the page to the visible viewport — no body scroll
    <div className="h-[100dvh] bg-gray-950 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* Header — fixed height, never shrinks */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-3 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Coach</h1>
            <p className="text-xs text-gray-500">Knows your goal, your data, your timeline</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-sm font-black text-white">K</span>
          </div>
        </div>

        {/* Chat area — fills all remaining height */}
        <CoachClient daysOld={daysOld} />

      </div>

      {/* Fixed bottom nav — sits on top of the layout */}
      <BottomNav />
    </div>
  )
}
