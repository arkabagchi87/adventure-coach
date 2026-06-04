'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1">{formatDate(label)}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function TrajectoryChart({ data, currentScore }) {
  if (!data || data.length === 0) {
    return (
      <div className="px-5 py-6 border-t border-gray-800">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          Trajectory
        </h2>
        <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
          Upload activities to see your trajectory
        </div>
      </div>
    )
  }

  // Only show data up to today for the chart window (don't render 21 months of empty future)
  const today = new Date().toISOString().slice(0, 10)
  const visibleData = data.filter(d => d.date <= today)
  // Add 6 months of required trajectory as a preview
  const futureEnd = new Date()
  futureEnd.setMonth(futureEnd.getMonth() + 6)
  const futureData = data.filter(d => d.date > today && d.date <= futureEnd.toISOString().slice(0, 10))
  const chartData = [...visibleData, ...futureData]

  // Thin out to avoid too many points, but always keep today's point
  const step = Math.max(1, Math.floor(chartData.length / 24))
  const thinned = chartData.filter((d, i) => i % step === 0 || d.date === today)

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">
        Trajectory
      </h2>
      <p className="text-xs text-gray-600 mb-4">Required vs actual readiness over time</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={thinned} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="required"
            name="Required"
            stroke="#374151"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
          <ReferenceLine
            x={today}
            stroke="#4b5563"
            strokeDasharray="3 3"
          />
          {currentScore !== null && (
            <ReferenceDot
              x={today}
              y={currentScore}
              r={6}
              fill="#f97316"
              stroke="#111827"
              strokeWidth={2}
              label={{ value: `${currentScore}`, fill: '#f97316', fontSize: 11, fontWeight: 700, position: 'top' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
