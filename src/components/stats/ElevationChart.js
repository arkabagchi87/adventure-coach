'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}m
        </p>
      ))}
    </div>
  )
}

export default function ElevationChart({ data, phaseTarget }) {
  if (!data || data.length === 0) {
    return (
      <div className="px-5 py-4 border-t border-gray-800">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          Weekly Elevation Gain
        </h2>
        <div className="h-36 flex items-center justify-center text-gray-600 text-sm">
          No elevation data in this period
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Weekly Elevation Gain
        </h2>
        {phaseTarget && (
          <span className="text-xs text-gray-600">Target: {phaseTarget}m/wk</span>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-4">Most Kili-relevant metric</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937' }} />
          <Bar dataKey="elevation" name="Elevation" fill="#f97316" radius={[3, 3, 0, 0]} />
          {phaseTarget && (
            <ReferenceLine
              y={phaseTarget}
              stroke="#374151"
              strokeDasharray="4 4"
              label={{ value: 'Target', fill: '#6b7280', fontSize: 9, position: 'right' }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
