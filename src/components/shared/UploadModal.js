'use client'

import { useState, useRef } from 'react'

const SOURCES = [
  {
    key: 'zepp',
    label: 'Zepp / Amazfit',
    description: 'Export from Zepp app → Profile → My Data → Health Data',
    accept: '.csv',
  },
  {
    key: 'apple_health',
    label: 'Apple Health',
    description: 'Health app → profile icon → Export All Health Data → export.xml',
    accept: '.xml',
  },
  {
    key: 'manual',
    label: 'Manual CSV',
    description: 'Use the template below to log activities by hand',
    accept: '.csv',
  },
]

export default function UploadModal({ onClose, onSuccess }) {
  const [source, setSource] = useState('zepp')
  const [file, setFile]     = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [message, setMessage] = useState('')
  const inputRef = useRef()

  async function handleUpload() {
    if (!file) return
    setStatus('uploading')
    setMessage('')

    const form = new FormData()
    form.append('file', file)
    form.append('type', source)

    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message)
        onSuccess?.()
      } else {
        setStatus('error')
        setMessage(data.error || 'Upload failed')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Network error — check your connection and try again')
    }
  }

  const selected = SOURCES.find(s => s.key === source)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-lg bg-gray-900 rounded-t-2xl p-6" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Upload Activities</h2>
          <button onClick={onClose} className="text-gray-500 text-xl leading-none">×</button>
        </div>

        {/* Source selector */}
        <div className="flex gap-2 mb-5">
          {SOURCES.map(s => (
            <button
              key={s.key}
              onClick={() => { setSource(s.key); setFile(null); setStatus('idle') }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                source === s.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 mb-4">{selected.description}</p>

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
          onChange={e => { setFile(e.target.files[0] || null); setStatus('idle') }}
        />

        {/* Status message */}
        {status === 'success' && (
          <div className="mb-4 rounded-lg bg-green-900/40 border border-green-700 p-3 text-sm text-green-400">
            {message}
          </div>
        )}
        {status === 'error' && (
          <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700 p-3 text-sm text-red-400">
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
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
            disabled={!file || status === 'uploading'}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              file && status !== 'uploading'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {status === 'uploading' ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
