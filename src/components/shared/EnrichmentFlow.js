'use client'

import { useState } from 'react'
import { getEnrichment, setEnrichment, saveDailyMetric, setRecoveryOptedOut } from '@/lib/storage/activityStorage'

/**
 * Post-upload enrichment card flow.
 * Shows up to 5 question cards one at a time.
 * Each card has a Skip option. Answers are saved via /api/enrich.
 *
 * Props:
 *   questions  - array of question objects from generateDataQualityReport
 *   onDone     - called when all cards are answered/skipped
 */
export default function EnrichmentFlow({ questions, onDone }) {
  const [idx, setIdx]       = useState(0)
  const [answers, setAnswers] = useState([])
  const [numberVal, setNumberVal] = useState('')
  const [saving, setSaving]   = useState(false)
  const [showRecoveryForm, setShowRecoveryForm] = useState(false)
  const [recoveryRhr, setRecoveryRhr] = useState('')
  const [recoveryHrv, setRecoveryHrv] = useState('')

  const question = questions[idx]
  const total    = questions.length

  // Pre-fill number inputs with the question's default value
  function initNumber(q) {
    if (q?.type === 'number' && numberVal === '') {
      setNumberVal(String(q.defaultValue ?? ''))
    }
  }
  if (question?.type === 'number' && numberVal === '') {
    initNumber(question)
  }

  async function saveAnswers(collected) {
    if (collected.length === 0) { onDone(); return }
    setSaving(true)
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: collected, currentEnrichment: getEnrichment() }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.enrichment) {
          setEnrichment(data.enrichment)
        }
      }
    } catch {
      // non-blocking — enrichment failure is silent
    } finally {
      setSaving(false)
      onDone()
    }
  }

  function handleAnswer(value) {
    const next = [...answers, { saveAs: question.saveAs, value }]
    setAnswers(next)
    setNumberVal('')
    if (idx + 1 < total) {
      setIdx(idx + 1)
    } else {
      saveAnswers(next)
    }
  }

  function handleSkip() {
    setNumberVal('')
    setShowRecoveryForm(false)
    setRecoveryRhr('')
    setRecoveryHrv('')
    if (idx + 1 < total) {
      setIdx(idx + 1)
    } else {
      saveAnswers(answers)
    }
  }

  function advanceRecovery() {
    setShowRecoveryForm(false)
    setRecoveryRhr('')
    setRecoveryHrv('')
    if (idx + 1 < total) {
      setIdx(idx + 1)
    } else {
      saveAnswers(answers)
    }
  }

  if (!question) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">
          Improve your score — {idx + 1} of {total}
        </span>
        {question.type !== 'recovery_log' && (
          <button
            onClick={handleSkip}
            className="text-xs text-gray-500 underline underline-offset-2"
          >
            Skip
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all"
          style={{ width: `${((idx) / total) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-gray-800 rounded-xl p-4">
        <p className="text-sm font-bold text-white mb-1">{question.title}</p>
        {question.body && (
          <p className="text-xs text-gray-400 leading-relaxed mb-4">{question.body}</p>
        )}

        {/* Option-style questions */}
        {question.type === 'options' && (
          <div className="flex flex-col gap-2">
            {question.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 active:opacity-70 transition-opacity"
              >
                <span className="text-sm font-semibold text-white">{opt.label}</span>
                {opt.sub && (
                  <span className="block text-xs text-gray-400 mt-0.5">{opt.sub}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Recovery log card */}
        {question.type === 'recovery_log' && (
          <div className="flex flex-col gap-3">
            {!showRecoveryForm ? (
              <>
                <button
                  onClick={() => setShowRecoveryForm(true)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 active:opacity-70 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">Log now</span>
                </button>
                <button
                  onClick={advanceRecovery}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 active:opacity-70 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">Remind me later</span>
                </button>
                <button
                  onClick={() => { setRecoveryOptedOut(); advanceRecovery() }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 active:opacity-70 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">I don&apos;t track these</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Resting HR (bpm)</label>
                  <input
                    type="number"
                    value={recoveryRhr}
                    onChange={e => setRecoveryRhr(e.target.value)}
                    placeholder="e.g. 58"
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">HRV (ms)</label>
                  <input
                    type="number"
                    value={recoveryHrv}
                    onChange={e => setRecoveryHrv(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <button
                  disabled={!recoveryRhr && !recoveryHrv}
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10)
                    saveDailyMetric({
                      date: today,
                      rhr: recoveryRhr ? parseFloat(recoveryRhr) : null,
                      hrv: recoveryHrv ? parseFloat(recoveryHrv) : null,
                    })
                    advanceRecovery()
                  }}
                  className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-40"
                >
                  Save &amp; continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Number input questions */}
        {question.type === 'number' && (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="number"
                value={numberVal}
                onChange={e => setNumberVal(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                placeholder={String(question.defaultValue ?? '')}
              />
              {question.unit && (
                <p className="text-xs text-gray-500 mt-1 ml-1">{question.unit}</p>
              )}
            </div>
            <button
              onClick={() => {
                const val = parseFloat(numberVal)
                if (!isNaN(val)) handleAnswer(val)
              }}
              disabled={!numberVal || isNaN(parseFloat(numberVal))}
              className="px-5 py-3 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-40 flex-shrink-0"
            >
              Confirm
            </button>
          </div>
        )}
      </div>

      {/* Skip all */}
      {total > 1 && (
        <button
          onClick={() => saveAnswers(answers)}
          disabled={saving}
          className="text-xs text-gray-600 text-center"
        >
          Skip all remaining
        </button>
      )}
    </div>
  )
}
