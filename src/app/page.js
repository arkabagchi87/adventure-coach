'use client'

import { useState, useEffect } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import Countdown from '@/components/dashboard/Countdown'
import ReadinessRing from '@/components/dashboard/ReadinessRing'
import DimensionBreakdown from '@/components/dashboard/DimensionBreakdown'
import TrajectoryChart from '@/components/dashboard/TrajectoryChart'
import PhaseIndicator from '@/components/dashboard/PhaseIndicator'
import NextMilestone from '@/components/dashboard/NextMilestone'
import CoachTeaser from '@/components/dashboard/CoachTeaser'
import DataFreshnessNudge from '@/components/dashboard/DataFreshnessNudge'
import BottomNav from '@/components/shared/BottomNav'
import { calculateReadiness } from '@/lib/scoring/calculateReadiness'
import { buildTrajectoryChartData, getDaysToGoal, getReadinessGap } from '@/lib/trajectory/calculateTrajectory'
import { getCurrentPhase } from '@/config/goals/kilimanjaro'
import { initializeIfNeeded, getActivities, getEnrichment } from '@/lib/storage/activityStorage'

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false)
  const [activities, setActivities] = useState([])
  const [enrichment, setEnrichment] = useState({})

  useEffect(() => {
    initializeIfNeeded().then(() => {
      setActivities(getActivities())
      setEnrichment(getEnrichment())
      setLoaded(true)
    })
  }, [])

  if (!loaded) {
    return <div className="min-h-screen bg-gray-950" />
  }

  const readiness = calculateReadiness(activities, enrichment)
  const daysToGoal = getDaysToGoal()
  const gap = getReadinessGap(readiness.score)
  const phase = getCurrentPhase()

  // Last activity date for freshness nudge
  const lastActivityDate = activities.length > 0
    ? [...activities].sort((a, b) => b.date.localeCompare(a.date))[0].date
    : null

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
        {/* Header with upload button */}
        <DashboardHeader />

        {/* Countdown */}
        <Countdown daysToGoal={daysToGoal} />

        {/* Data freshness nudge — shows only if last upload > 7 days ago */}
        <DataFreshnessNudge lastActivityDate={lastActivityDate} />

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
