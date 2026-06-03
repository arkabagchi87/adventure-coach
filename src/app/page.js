import { readFileSync } from 'fs'
import { join } from 'path'
import Countdown from '@/components/dashboard/Countdown'
import ReadinessRing from '@/components/dashboard/ReadinessRing'
import DimensionBreakdown from '@/components/dashboard/DimensionBreakdown'
import TrajectoryChart from '@/components/dashboard/TrajectoryChart'
import PhaseIndicator from '@/components/dashboard/PhaseIndicator'
import NextMilestone from '@/components/dashboard/NextMilestone'
import CoachTeaser from '@/components/dashboard/CoachTeaser'
import BottomNav from '@/components/shared/BottomNav'
import { calculateReadiness } from '@/lib/scoring/calculateReadiness'
import { buildTrajectoryChartData, getDaysToGoal, getReadinessGap } from '@/lib/trajectory/calculateTrajectory'
import { getCurrentPhase } from '@/config/goals/kilimanjaro'

function loadData() {
  try {
    const activitiesPath = join(process.cwd(), 'src/data/activities.json')
    const enrichmentPath = join(process.cwd(), 'src/data/enrichment.json')
    const activities = JSON.parse(readFileSync(activitiesPath, 'utf8'))
    const enrichment = JSON.parse(readFileSync(enrichmentPath, 'utf8'))
    return { activities, enrichment }
  } catch {
    return { activities: [], enrichment: {} }
  }
}

export default function DashboardPage() {
  const { activities, enrichment } = loadData()
  const readiness = calculateReadiness(activities, enrichment)
  const daysToGoal = getDaysToGoal()
  const gap = getReadinessGap(readiness.score)
  const phase = getCurrentPhase()

  // Build snapshot map for trajectory: use today's score as the current actual point
  const today = new Date().toISOString().slice(0, 10)
  const snapshots = readiness.score !== null ? { [today]: readiness.score } : {}
  const trajectoryData = buildTrajectoryChartData(snapshots)

  // Month of training elapsed
  const trainingStart = new Date('2026-06-01')
  const now = new Date()
  const monthsElapsed = Math.max(1,
    (now.getFullYear() - trainingStart.getFullYear()) * 12 +
    (now.getMonth() - trainingStart.getMonth()) + 1
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-2">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Adventure Coach</h1>
            <p className="text-xs text-gray-500">Kilimanjaro · Lemosho Route</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Countdown */}
        <Countdown daysToGoal={daysToGoal} />

        {/* Readiness Ring */}
        <div className="border-t border-gray-800">
          <ReadinessRing score={readiness.score} confidence={readiness.confidence} />
        </div>

        {/* Dimension Breakdown */}
        <DimensionBreakdown dimensions={readiness.dimensions} />

        {/* Trajectory Chart */}
        <TrajectoryChart data={trajectoryData} currentScore={readiness.score} />

        {/* Phase Indicator */}
        <PhaseIndicator phase={phase} />

        {/* Next Milestone */}
        <NextMilestone currentMonth={monthsElapsed} />

        {/* Coach Teaser */}
        <CoachTeaser readiness={readiness} gap={gap} />
      </div>

      <BottomNav />
    </div>
  )
}
