'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-orange-400 font-semibold">{payload[0].value} active days</p>
    </div>
  )
}

export default function ActivityDaysChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="px-5 py-4 border-t border-gray-800">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
          Weekly Activity Days
        </h2>
        <div className="h-36 flex items-center justify-center text-gray-600 text-sm">
          No data in this period
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">
        Weekly Activity Days
      </h2>
      <p className="text-xs text-gray-600 mb-4">Consistency target: 5 days/week</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 7]}
            ticks={[0, 2, 4, 5, 7]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937' }} />
          <Bar dataKey="days" fill="#f97316" radius={[3, 3, 0, 0]} />
          <ReferenceLine
            y={5}
            stroke="#374151"
            strokeDasharray="4 4"
            label={{ value: 'Goal', fill: '#6b7280', fontSize: 9, position: 'right' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
