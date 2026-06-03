export default function SummaryStrip({ totalElevation, activeDays, totalHours }) {
  const stats = [
    {
      label: 'Elevation',
      value: totalElevation >= 1000
        ? `${(totalElevation / 1000).toFixed(1)}km`
        : `${totalElevation}m`,
      sub: 'total gain',
    },
    {
      label: 'Active Days',
      value: activeDays,
      sub: 'sessions logged',
    },
    {
      label: 'Hours',
      value: totalHours.toFixed(1),
      sub: 'total training',
    },
  ]

  return (
    <div className="flex px-5 py-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="flex-1 bg-gray-800/60 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-medium mb-0.5">{s.label}</p>
          <p className="text-xl font-black text-white">{s.value}</p>
          <p className="text-xs text-gray-600">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
