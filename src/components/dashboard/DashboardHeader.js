'use client'

import { useState } from 'react'
import UploadModal from '@/components/shared/UploadModal'

export default function DashboardHeader() {
  const [showUpload, setShowUpload] = useState(false)

  function handleSuccess() {
    // Reload the page after a successful upload to reflect new data
    setTimeout(() => window.location.reload(), 1200)
  }

  return (
    <>
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

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
