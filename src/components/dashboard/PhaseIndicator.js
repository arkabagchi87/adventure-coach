export default function PhaseIndicator({ phase }) {
  if (!phase) return null

  const dots = [1, 2, 3, 4]

  return (
    <div className="px-5 py-4 border-t border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Training Phase
        </h2>
        <div className="flex gap-1.5">
          {dots.map(n => (
            <div
              key={n}
              className={`w-2 h-2 rounded-full ${n <= phase.phase ? 'bg-orange-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-base font-bold text-white">
        Phase {phase.phase} — {phase.label}
      </p>
      <p className="text-sm text-gray-400 mt-1">{phase.description}</p>
      <p className="text-xs text-orange-400 mt-2 leading-snug">{phase.coachPriority}</p>
    </div>
  )
}
