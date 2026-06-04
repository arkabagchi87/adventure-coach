'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble from '@/components/coach/MessageBubble'
import SuggestedQuestions from '@/components/coach/SuggestedQuestions'
import TypingIndicator from '@/components/coach/TypingIndicator'

const OPENING_MESSAGE = {
  role: 'assistant',
  content: "I've reviewed your training data. You're in Phase 1 — base building — which is exactly where the focus should be on Zone 2 and building consistency. Ask me anything about your preparation, your next training block, or what Kilimanjaro will actually demand from you.",
}

export default function CoachClient() {
  const [messages, setMessages]   = useState([OPENING_MESSAGE])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const trimmed = (text || input).trim()
    if (!trimmed || loading) return

    const userMessage = { role: 'user', content: trimmed }
    const next = [...messages, userMessage]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Try again.')
        setMessages(prev => prev.slice(0, -1))
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setError('Network error — check your connection.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    // flex-1 min-h-0: fills all remaining height from header down; min-h-0 enables inner scroll
    <div className="flex flex-col flex-1 min-h-0">

      {/* Messages — fills all available space, scrolls when overflows */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div className="text-xs text-red-400 text-center py-2 px-4 bg-red-900/20 rounded-lg mb-3">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer — suggestions + input, pinned to bottom, never scrolls */}
      {/* paddingBottom clears the fixed BottomNav + device safe area */}
      <div
        className="flex-shrink-0 border-t border-gray-800 bg-gray-950"
        style={{ paddingBottom: 'calc(58px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="pt-3">
          <SuggestedQuestions onSelect={sendMessage} disabled={loading} />
        </div>
        <div className="flex items-end gap-2 px-4 pb-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach…"
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-500 transition-colors leading-snug"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              input.trim() && !loading
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
