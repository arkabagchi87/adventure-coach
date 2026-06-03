'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

function formatDate(str) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
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

export default function HrvTrendChart({ data }) {
  const hasHrv = data.some(d => d.hrv !== null)
  const hasRhr = data.some(d => d.rhr !== null)

  if (!hasHrv && !hasRhr) {
    return (
      <div className="px-5 py-4 border-t border-gray-800">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">
          HRV / RHR Trend
        </h2>
        <p className="text-sm text-gray-600">
          No recovery data yet. HRV and RHR are logged automatically from Zepp or Apple Health exports.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">
        HRV / RHR Trend
      </h2>
      <p className="text-xs text-gray-600 mb-4">Recovery signals — HRV up + RHR down = adapting well</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
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
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {hasHrv && (
            <Line
              type="monotone"
              dataKey="hrv"
              name="HRV"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3, fill: '#22c55e' }}
              connectNulls={false}
            />
          )}
          {hasRhr && (
            <Line
              type="monotone"
              dataKey="rhr"
              name="RHR"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f97316' }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
