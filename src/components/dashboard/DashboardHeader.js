'use client'

import { useState, useEffect } from 'react'
import UploadModal from '@/components/shared/UploadModal'

export default function DashboardHeader() {
  const [showUpload, setShowUpload]   = useState(false)
  const [showCTA, setShowCTA]         = useState(false)

  useEffect(() => {
    // Show onboarding card until user has uploaded or dismissed
    const dismissed = localStorage.getItem('uploadCTAdismissed')
    if (!dismissed) setShowCTA(true)
  }, [])

  function handleSuccess() {
    localStorage.setItem('uploadCTAdismissed', '1')
    setShowCTA(false)
    setTimeout(() => window.location.reload(), 1200)
  }

  function dismissCTA() {
    localStorage.setItem('uploadCTAdismissed', '1')
    setShowCTA(false)
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Adventure Coach</h1>
          <p className="text-xs text-gray-500">Kilimanjaro · Lemosho Route</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center"
          aria-label="Upload activities"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Onboarding upload CTA */}
      {showCTA && (
        <div className="mx-5 mt-2 mb-1 rounded-xl bg-orange-500/10 border border-orange-500/25 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-400 mb-1">Upload your training data</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                Connect Zepp / Amazfit, Apple Health, or a manual CSV to see your real readiness score.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="text-xs font-bold bg-orange-500 text-white px-4 py-2 rounded-lg active:opacity-70"
              >
                Upload now
              </button>
            </div>
            <button
              onClick={dismissCTA}
              className="text-gray-500 text-xl leading-none flex-shrink-0"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
