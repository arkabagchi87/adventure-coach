'use client'

const RANGES = [
  { key: '7D',  label: '7D'  },
  { key: '30D', label: '30D' },
  { key: '90D', label: '90D' },
  { key: 'YTD', label: 'YTD' },
]

export default function TimeRangeSelector({ selected, onChange }) {
  return (
    <div className="flex gap-2 px-5 py-3">
      {RANGES.map(r => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            selected === r.key
              ? 'bg-orange-500 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
