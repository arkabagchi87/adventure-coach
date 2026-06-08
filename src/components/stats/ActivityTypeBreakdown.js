import { activityTiers } from '@/config/goals/kilimanjaro'

const TIER_COLORS = {
  tier1: { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Kili-specific' },
  tier2: { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Good prep' },
  tier3: { bg: 'bg-blue-500',   text: 'text-blue-400',   label: 'Aerobic base' },
  tier4: { bg: 'bg-purple-500', text: 'text-purple-400', label: 'Strength' },
  tier5: { bg: 'bg-gray-500',   text: 'text-gray-400',   label: 'Recovery' },
}

const TYPE_LABELS = {
  hike: 'Hike', incline_walk: 'Incline Walk', stair_climb: 'Stair Climb',
  run: 'Run', trail_run: 'Trail Run',
  cycle: 'Cycle', swim: 'Swim', walk: 'Walk',
  strength_legs: 'Strength (Legs)', strength_core: 'Strength (Core)', strength_full: 'Strength (Full)',
  yoga: 'Yoga', mobility: 'Mobility', stretch: 'Stretch',
}

export default function ActivityTypeBreakdown({ typeCounts, totalSessions }) {
  if (!typeCounts || totalSessions === 0) {
    return (
      <div className="px-5 py-4 border-t border-gray-800">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          Activity Mix
        </h2>
        <p className="text-sm text-gray-600">No activities in this period</p>
      </div>
    )
  }

  // Group by tier, skip unknown types (e.g. 'other')
  const grouped = {}
  let knownTotal = 0
  for (const [type, count] of Object.entries(typeCounts)) {
    let tier = null
    for (const [t, data] of Object.entries(activityTiers)) {
      if (data.types.includes(type)) { tier = t; break }
    }
    if (!tier) continue
    if (!grouped[tier]) grouped[tier] = []
    grouped[tier].push({ type, count })
    knownTotal += count
  }
  if (knownTotal === 0) {
    return (
      <div className="px-5 py-4 border-t border-gray-800">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          Activity Mix
        </h2>
        <p className="text-sm text-gray-600">No activities in this period</p>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">
        Activity Mix
      </h2>
      <p className="text-xs text-gray-600 mb-4">Framed by Kilimanjaro relevance</p>

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tier, items]) => {
          const colors = TIER_COLORS[tier]
          const tierTotal = items.reduce((s, i) => s + i.count, 0)
          const pct = Math.round((tierTotal / knownTotal) * 100)

          return (
            <div key={tier} className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${colors.text}`}>
                  {activityTiers[tier].label}
                </span>
                <span className="text-xs text-gray-500">{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full mb-2">
                <div
                  className={`h-full rounded-full ${colors.bg}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map(({ type, count }) => (
                  <span key={type} className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                    {TYPE_LABELS[type] || type} ×{count}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}
