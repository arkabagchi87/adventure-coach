'use client'

const SIZE = 160
const STROKE = 12
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

function scoreColor(score) {
  if (score === null) return '#374151'
  if (score < 30) return '#ef4444'
  if (score < 50) return '#f97316'
  if (score < 70) return '#eab308'
  return '#22c55e'
}

export default function ReadinessRing({ score, confidence }) {
  const pct = score !== null ? score / 100 : 0
  const dashOffset = CIRC * (1 - pct)
  const color = scoreColor(score)

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#1f2937"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score !== null ? (
            <>
              <span className="text-4xl font-black text-white">{score}</span>
              <span className="text-xs text-gray-400 font-medium">/ 100</span>
            </>
          ) : (
            <span className="text-sm text-gray-500 text-center px-4">No data yet</span>
          )}
        </div>
      </div>

      <p className="text-sm font-semibold text-white mt-2">Readiness Score</p>
      {confidence && (
        <p className="text-xs text-gray-500 mt-0.5">
          {confidence === 'high' ? 'High confidence' :
           confidence === 'medium' ? 'Medium confidence' :
           'Low confidence — upload more data'}
        </p>
      )}
    </div>
  )
}
