import { phases, goalMeta } from '@/config/goals/kilimanjaro'

/**
 * Returns the required readiness score at any given date,
 * by linearly interpolating phase targets across the 21-month timeline.
 *
 * Phase 1 starts at score 10 (day 1 of training).
 * Phase 4 ends at score 95 (goal date).
 */
export function getRequiredScoreAtDate(date, trainingStartDate = new Date('2026-06-01')) {
  const goalDate = new Date(goalMeta.target_date)
  const totalMs = goalDate - trainingStartDate
  const elapsedMs = date - trainingStartDate

  if (elapsedMs <= 0) return 10
  if (elapsedMs >= totalMs) return 95

  const progress = elapsedMs / totalMs

  // S-curve: slow start (base building), accelerates mid, plateaus at taper
  // Approximate with piecewise linear across phase milestones
  const milestones = [
    { pct: 0,    score: 10  }, // start
    { pct: 0.28, score: 35  }, // end of phase 1 (month 6)
    { pct: 0.62, score: 65  }, // end of phase 2 (month 13)
    { pct: 0.90, score: 88  }, // end of phase 3 (month 19)
    { pct: 1.0,  score: 95  }, // goal date
  ]

  for (let i = 1; i < milestones.length; i++) {
    const prev = milestones[i - 1]
    const curr = milestones[i]
    if (progress <= curr.pct) {
      const localPct = (progress - prev.pct) / (curr.pct - prev.pct)
      return Math.round(prev.score + localPct * (curr.score - prev.score))
    }
  }

  return 95
}

/**
 * Generates required trajectory data points for the full 21-month timeline.
 * Used to render the background "required" line on the trajectory chart.
 *
 * Returns array of { date: 'YYYY-MM-DD', required: number }
 */
export function generateRequiredTrajectory(
  trainingStartDate = new Date('2026-06-01'),
  intervalDays = 14
) {
  const goalDate = new Date(goalMeta.target_date)
  const points = []
  const cursor = new Date(trainingStartDate)

  while (cursor <= goalDate) {
    points.push({
      date: cursor.toISOString().slice(0, 10),
      required: getRequiredScoreAtDate(new Date(cursor), trainingStartDate),
    })
    cursor.setDate(cursor.getDate() + intervalDays)
  }

  // Always include goal date
  const last = points[points.length - 1]
  if (last?.date !== goalMeta.target_date) {
    points.push({ date: goalMeta.target_date, required: 95 })
  }

  return points
}

/**
 * Merges required trajectory with actual readiness snapshots.
 * Actual snapshots are keyed by date: { 'YYYY-MM-DD': score }.
 *
 * Returns array suitable for Recharts:
 * { date, required, actual? }
 */
export function buildTrajectoryChartData(
  actualSnapshots = {},
  trainingStartDate = new Date('2026-06-01')
) {
  const required = generateRequiredTrajectory(trainingStartDate)

  return required.map(point => {
    const entry = { date: point.date, required: point.required }
    if (actualSnapshots[point.date] !== undefined) {
      entry.actual = actualSnapshots[point.date]
    }
    return entry
  })
}

/**
 * Calculates the gap between current actual score and required score today.
 * Positive gap = behind. Negative gap = ahead.
 */
export function getReadinessGap(
  actualScore,
  trainingStartDate = new Date('2026-06-01')
) {
  if (actualScore === null || actualScore === undefined) return null
  const required = getRequiredScoreAtDate(new Date(), trainingStartDate)
  return required - actualScore
}

/**
 * Returns the number of days remaining to the goal date.
 */
export function getDaysToGoal() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const goal = new Date(goalMeta.target_date)
  return Math.max(0, Math.round((goal - now) / (1000 * 60 * 60 * 24)))
}
