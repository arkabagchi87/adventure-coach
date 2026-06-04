const QUESTIONS = [
  "What should my next 4 weeks look like?",
  "Am I building enough elevation?",
  "How is my Zone 2 progressing?",
  "I'm travelling for 2 weeks — how do I adjust?",
  "What strength work should I prioritise?",
  "How does my descent training look?",
]

export default function SuggestedQuestions({ onSelect, disabled }) {
  return (
    <div className="px-4 pb-2 flex flex-wrap gap-2">
      {QUESTIONS.map(q => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="text-xs text-orange-400 bg-gray-800 border border-gray-700 px-3 py-2 rounded-full disabled:opacity-40 active:opacity-70 transition-opacity"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
