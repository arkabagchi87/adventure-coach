import Link from 'next/link'

export default function CoachTeaser({ readiness, gap }) {
  // Generate a context-aware teaser based on current data
  let message = "Your coach is ready. Ask anything about your Kilimanjaro preparation."

  if (readiness?.score !== null && readiness?.score !== undefined) {
    const zone2 = readiness.dimensions?.aerobic_base?.input?.zone2Percent
    const elev = readiness.dimensions?.elevation_capacity?.input?.weeklyElevationM
    const eccentric = readiness.dimensions?.strength?.input?.eccentricConfirmed

    if (gap > 20) {
      message = `You're ${gap} points behind the required trajectory. Your coach has a plan to close the gap.`
    } else if (zone2 !== null && zone2 < 40) {
      message = `Zone 2 is at ${zone2}% — below where it needs to be. Your coach can walk you through why slowing down builds a faster summit.`
    } else if (!eccentric) {
      message = "Descent training is missing from your log. Your coach knows exactly what to add."
    } else if (elev < 300) {
      message = `Weekly elevation is ${elev}m — the mountain demands 10× that. Your coach can build a progressive plan.`
    } else if (readiness.score >= 60) {
      message = `Readiness at ${readiness.score} — solid progress. Your coach has observations about what to focus on next.`
    }
  }

  return (
    <div className="mx-5 my-4 rounded-xl bg-gray-800/60 border border-gray-700 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1">
            Coach
          </p>
          <p className="text-sm text-gray-300 leading-snug">{message}</p>
        </div>
        <Link
          href="/coach"
          className="flex-shrink-0 flex items-center gap-1 text-orange-500 text-sm font-semibold mt-1"
        >
          Reply
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
