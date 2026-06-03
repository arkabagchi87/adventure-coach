export default function Countdown({ daysToGoal }) {
  const years = Math.floor(daysToGoal / 365)
  const months = Math.floor((daysToGoal % 365) / 30)
  const days = daysToGoal % 30

  return (
    <div className="px-5 pt-6 pb-4">
      <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-1">
        Kilimanjaro · Feb 2028
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black text-white tracking-tight">{daysToGoal}</span>
        <span className="text-lg text-gray-400 font-medium">days to go</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {years > 0 && `${years}y `}{months > 0 && `${months}mo `}{days}d · Lemosho Route, 8 days
      </p>
    </div>
  )
}
