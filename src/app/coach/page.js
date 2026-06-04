import BottomNav from '@/components/shared/BottomNav'
import CoachClient from './CoachClient'

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-gray-950 pb-40">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-3 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Coach</h1>
            <p className="text-xs text-gray-500">Knows your goal, your data, your timeline</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-sm font-black text-white">K</span>
          </div>
        </div>

        {/* Chat area — natural scroll */}
        <CoachClient />
      </div>
      <BottomNav />
    </div>
  )
}
