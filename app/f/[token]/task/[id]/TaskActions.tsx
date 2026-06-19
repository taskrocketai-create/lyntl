'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  taskId: string
  token: string
  currentStatus: string
}

export default function TaskActions({ taskId, token, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(status: string) {
    setLoading(status)
    try {
      await fetch('/api/task/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, token, status }),
      })
      router.push(`/f/${token}/checklist`)
      router.refresh()
    } catch {
      setLoading(null)
    }
  }

  if (currentStatus === 'done') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-forest/10 border border-forest/20 rounded-lg px-5 py-4">
          <div className="w-5 h-5 rounded-full bg-forest flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-forest font-medium text-sm">Marked as done</span>
        </div>
        <button
          onClick={() => updateStatus('pending')}
          disabled={loading !== null}
          className="w-full text-mid text-sm py-2 hover:text-ink transition-colors"
        >
          Mark as not done
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => updateStatus('done')}
        disabled={loading !== null}
        className="btn-primary w-full"
      >
        {loading === 'done' ? 'Saving…' : '✓ Mark as done'}
      </button>
      <button
        onClick={() => updateStatus('skipped')}
        disabled={loading !== null}
        className="btn-ghost w-full text-sm"
      >
        {loading === 'skipped' ? 'Saving…' : 'Skip — does not apply to me'}
      </button>
    </div>
  )
}
