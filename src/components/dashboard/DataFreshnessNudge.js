'use client'

import { useState, useEffect } from 'react'
import UploadModal from '@/components/shared/UploadModal'

/**
 * Shows a dismissible card if data is more than 7 days old.
 * Dismiss is stored in sessionStorage so it reappears next visit.
 *
 * Props:
 *   lastActivityDate - 'YYYY-MM-DD' string of the most recent activity, or null
 */
export default function DataFreshnessNudge({ lastActivityDate }) {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid SSR flash
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    const key = `freshnessNudgeDismissed_${lastActivityDate}`
    const isDismissed = sessionStorage.getItem(key)
    if (!isDismissed) setDismissed(false)
  }, [lastActivityDate])

  function dismiss() {
    const key = `freshnessNudgeDismissed_${lastActivityDate}`
    sessionStorage.setItem(key, '1')
    setDismissed(true)
  }

  function handleUploadSuccess() {
    setShowUpload(false)
    setDismissed(true)
    setTimeout(() => window.location.reload(), 1200)
  }

  // Compute days old
  const daysOld = lastActivityDate
    ? Math.floor((Date.now() - new Date(lastActivityDate + 'T00:00:00').getTime()) / 86400000)
    : null

  if (dismissed || daysOld === null || daysOld <= 7) return null

  return (
    <>
      <div className="mx-5 mb-4 rounded-xl bg-gray-800 border border-gray-700 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-white">
                Your data is {daysOld} days old
              </p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Upload this week&apos;s activities to keep your readiness score current.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpload(true)}
                className="text-xs font-bold bg-orange-500 text-white px-4 py-2 rounded-lg active:opacity-70"
              >
                Upload now
              </button>
              <button
                onClick={dismiss}
                className="text-xs text-gray-500 px-3 py-2"
              >
                Remind me later
              </button>
            </div>
          </div>
          <button onClick={dismiss} className="text-gray-600 text-lg leading-none flex-shrink-0">
            ×
          </button>
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  )
}
