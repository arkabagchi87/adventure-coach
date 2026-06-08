'use client'

import { useState } from 'react'
import { saveDailyMetric } from '@/lib/storage/activityStorage'

export default function QuickLogModal({ onClose }) {
  const [rhr, setRhr] = useState('')
  const [hrv, setHrv] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!rhr && !hrv) return
    const today = new Date().toISOString().slice(0, 10)
    saveDailyMetric({
      date: today,
      rhr: rhr ? parseFloat(rhr) : null,
      hrv: hrv ? parseFloat(hrv) : null,
    })
    setSaved(true)
    setTimeout(() => onClose(), 1500)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
      <div
        className="w-full max-w-lg bg-gray-900 rounded-t-2xl p-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Today&apos;s Recovery</h2>
          <button onClick={onClose} className="text-gray-500 text-xl leading-none">×</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Resting HR (bpm)</label>
            <input
              type="number"
              value={rhr}
              onChange={e => setRhr(e.target.value)}
              placeholder="e.g. 58"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">HRV (ms)</label>
            <input
              type="number"
              value={hrv}
              onChange={e => setHrv(e.target.value)}
              placeholder="e.g. 42"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {saved ? (
            <div className="w-full py-3 rounded-xl bg-gray-800 text-center text-sm font-bold text-green-400">
              Saved ✓
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={!rhr && !hrv}
              className="w-full py-3 rounded-xl bg-gray-800 text-gray-200 text-sm font-bold disabled:opacity-40 transition-colors"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
