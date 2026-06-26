'use client'

import { useState, useRef } from 'react'
import EnrichmentFlow from './EnrichmentFlow'
import { getActivities, getEnrichment, setActivities, setHasRealData, shouldClearMockData, getDailyMetrics, getRecoveryOptedOut } from '@/lib/storage/activityStorage'

const SOURCES = [
  {
    key: 'watch',
    label: 'Watch Export',
    description: 'Export a CSV from your fitness watch app and upload it here.',
    accept: '.csv',
  },
  {
    key: 'health_app',
    label: 'Health App',
    description: 'Export health data from your phone\'s health app and upload the file here.',
    accept: '.xml',
  },
  {
    key: 'manual',
    label: 'Manual CSV',
    description: 'Download the template below, fill in your activities, and upload it here.',
    accept: '.csv',
  },
]

export default function UploadModal({ onClose, onSuccess }) {
  const [source, setSource]     = useState('watch')
  const [file, setFile]         = useState(null)
  const [phase, setPhase]       = useState('idle')   // idle | uploading | result | enriching
  const [result, setResult]     = useState(null)     // upload result from API
  const [error, setError]       = useState(null)
  const inputRef                = useRef()

  const selected = SOURCES.find(s => s.key === source)

  async function handleUpload() {
    if (!file) return
    setPhase('uploading')
    setError(null)

    // On first real upload, if all existing activities are mock data, clear them
    // so real activities start fresh. Determined once before the fetch.
    const clearingMock = shouldClearMockData()

    const form = new FormData()
    form.append('file', file)
    form.append('type', source)
    form.append('currentActivities', JSON.stringify(clearingMock ? [] : getActivities()))
    form.append('currentEnrichment', JSON.stringify(getEnrichment()))

    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (res.ok && data.success) {
        if (data.merged) setActivities(data.merged)
        setHasRealData()

        // Override message when mock data was cleared
        const displayData = clearingMock
          ? { ...data, message: `Demo data removed. ${data.added} real ${data.added === 1 ? 'activity' : 'activities'} imported.` }
          : data

        const hasActivityRhr = data.merged?.some(a => a.rhr != null)
        const needsRecoveryCard = !getRecoveryOptedOut()
          && getDailyMetrics().length < 7
          && !hasActivityRhr

        let enrichData = displayData
        if (needsRecoveryCard) {
          const recoveryQ = {
            id: 'recovery_setup',
            type: 'recovery_log',
            priority: 0,
            title: 'Track your recovery data',
            body: "Recovery data improves your readiness accuracy. Your watch tracks HRV and resting heart rate but doesn't include them in exports. You can log them manually each morning — takes 30 seconds.",
          }
          enrichData = { ...displayData, questions: [recoveryQ, ...(displayData.questions || [])] }
        }

        setResult(enrichData)
        if (enrichData.questions?.length > 0) {
          setPhase('enriching')
        } else {
          setPhase('result')
        }
      } else {
        setError(data.error || 'Upload failed')
        setPhase('idle')
      }
    } catch {
      setError('Network error — check your connection and try again.')
      setPhase('idle')
    }
  }

  function handleEnrichDone() {
    setPhase('result')
    // Trigger page reload after a moment to show updated score
    setTimeout(() => {
      onSuccess?.()
    }, 1200)
  }

  function handleClose() {
    if (phase === 'result') onSuccess?.()
    else onClose()
  }

  // ── Enrichment phase ─────────────────────────────────────────────────────
  if (phase === 'enriching' && result?.questions?.length > 0) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
        <div
          className="w-full max-w-lg bg-gray-900 rounded-t-2xl p-6"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Improve your score</h2>
              <p className="text-xs text-gray-500 mt-0.5">{result.message}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 text-xl leading-none">×</button>
          </div>
          <EnrichmentFlow
            questions={result.questions}
            onDone={handleEnrichDone}
          />
        </div>
      </div>
    )
  }

  // ── Result phase ─────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
        <div
          className="w-full max-w-lg bg-gray-900 rounded-t-2xl p-6"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Upload complete</h2>
            <button onClick={handleClose} className="text-gray-500 text-xl leading-none">×</button>
          </div>
          <div className="rounded-xl bg-green-900/30 border border-green-700/50 p-4 mb-4">
            <p className="text-sm font-semibold text-green-400">{result.message}</p>
            {result.skipped > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {result.skipped} duplicate{result.skipped !== 1 ? 's' : ''} skipped — your existing data was not changed.
              </p>
            )}
            {result.dropped > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {result.dropped} row{result.dropped !== 1 ? 's' : ''} ignored — too short (&lt;5 min) or unrecognised activity type.
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-bold"
          >
            View updated dashboard →
          </button>
        </div>
      </div>
    )
  }

  // ── Upload phase (idle / uploading) ──────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
      <div className="w-full max-w-lg bg-gray-900 rounded-t-2xl flex flex-col max-h-[90dvh]">

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Upload Activities</h2>
            <button onClick={onClose} className="text-gray-500 text-xl leading-none">×</button>
          </div>

          {/* Source selector */}
          <div className="flex gap-2 mb-4">
            {SOURCES.map(s => (
              <button
                key={s.key}
                onClick={() => { setSource(s.key); setFile(null); setError(null) }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  source === s.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">{selected.description}</p>

          {/* File drop zone */}
          <button
            onClick={() => inputRef.current?.click()}
            className={`w-full rounded-xl border-2 border-dashed p-6 text-center transition-colors mb-4 ${
              file ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            {file ? (
              <>
                <p className="text-sm text-orange-400 font-semibold">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB · tap to change</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400">Tap to select file</p>
                <p className="text-xs text-gray-600 mt-1">{selected.accept.toUpperCase()} file</p>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={selected.accept}
            className="hidden"
            onChange={e => { setFile(e.target.files[0] || null); setError(null) }}
          />

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Actions — pinned at the bottom, always visible */}
        <div
          className="flex-shrink-0 px-6 pt-3 pb-6 flex gap-3"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          {source === 'manual' && (
            <a
              href="/api/upload"
              download="adventure-coach-template.csv"
              className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold text-center"
            >
              Download Template
            </a>
          )}
          <button
            onClick={handleUpload}
            disabled={!file || phase === 'uploading'}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              file && phase !== 'uploading'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {phase === 'uploading' ? 'Uploading…' : 'Upload'}
          </button>
        </div>

      </div>
    </div>
  )
}
