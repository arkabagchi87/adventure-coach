import { milestoneGates } from '@/config/goals/kilimanjaro'

export default function NextMilestone({ currentMonth }) {
  // Find the next upcoming gate set
  const next = milestoneGates.find(m => m.month >= currentMonth)
  if (!next) return null

  const monthsAway = next.month - currentMonth

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Next Milestone
        </h2>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
          Month {next.month}
          {monthsAway > 0 && ` · ${monthsAway}mo away`}
        </span>
      </div>
      <ul className="space-y-2">
        {next.gates.map(gate => (
          <li key={gate.id} className="flex items-start gap-2">
            <span className="mt-0.5 w-4 h-4 rounded border border-gray-600 flex-shrink-0" />
            <span className="text-sm text-gray-300">{gate.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
