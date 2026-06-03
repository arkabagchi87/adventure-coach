'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const ZONE_COLORS = ['#1e40af', '#16a34a', '#ca8a04', '#ea580c', '#dc2626']
const ZONE_LABELS = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs">
      <p style={{ color: payload[0].payload.fill }} className="font-semibold">
        {payload[0].name}: {payload[0].value}%
      </p>
    </div>
  )
}

export default function ZoneDonut({ zones }) {
  if (!zones) return null

  const data = [
    { name: 'Zone 1', value: Math.round(zones.z1 || 0) },
    { name: 'Zone 2', value: Math.round(zones.z2 || 0) },
    { name: 'Zone 3', value: Math.round(zones.z3 || 0) },
    { name: 'Zone 4', value: Math.round(zones.z4 || 0) },
    { name: 'Zone 5', value: Math.round(zones.z5 || 0) },
  ].filter(d => d.value > 0)

  const z2 = Math.round(zones.z2 || 0)

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">
        Zone Distribution
      </h2>
      <p className="text-xs text-gray-600 mb-4">Zone 2 % is the key aerobic base signal</p>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={ZONE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Zone 2 callout */}
        <div className="flex-1">
          <div className="mb-3">
            <p className="text-3xl font-black text-green-400">{z2}%</p>
            <p className="text-xs text-gray-400">Zone 2 · aerobic base</p>
            <p className="text-xs text-gray-600 mt-0.5">Target: 60–70%+</p>
          </div>
          <div className="space-y-1">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ZONE_COLORS[i] }} />
                <span className="text-xs text-gray-500">{d.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
