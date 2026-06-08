function DimensionBar({ label, score, weight, recoveryStatus }) {
  const pct = score !== null ? score : 0
  const barColor =
    score === null ? 'bg-gray-700' :
    score < 30 ? 'bg-red-500' :
    score < 50 ? 'bg-orange-500' :
    score < 70 ? 'bg-yellow-400' :
    'bg-green-500'

  if (recoveryStatus === 'excluded') {
    return (
      <div className="mb-3 opacity-40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500 font-medium">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{Math.round(weight * 100)}%</span>
            <span className="text-sm text-gray-600 w-20 text-right">Not available</span>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden" />
      </div>
    )
  }

  if (recoveryStatus === 'building') {
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-300 font-medium">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{Math.round(weight * 100)}%</span>
            <span className="text-sm text-gray-500 w-28 text-right">Building baseline</span>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden" />
      </div>
    )
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{Math.round(weight * 100)}%</span>
          <span className="text-sm font-bold text-white w-8 text-right">
            {score !== null ? score : '—'}
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function DimensionBreakdown({ dimensions, recoveryStatus }) {
  if (!dimensions) return null

  const order = [
    'aerobic_base',
    'elevation_capacity',
    'multiday_endurance',
    'strength',
    'recovery_quality',
  ]

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
        Readiness Breakdown
      </h2>
      {order.map(key => {
        const dim = dimensions[key]
        if (!dim) return null
        return (
          <DimensionBar
            key={key}
            label={dim.label}
            score={dim.score}
            weight={dim.weight}
            recoveryStatus={key === 'recovery_quality' ? recoveryStatus : undefined}
          />
        )
      })}
    </div>
  )
}
