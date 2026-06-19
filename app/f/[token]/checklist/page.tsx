import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'
import type { Task } from '@/types/database'

const CATEGORY_LABELS: Record<string, string> = {
  government: 'Government & Benefits',
  property: 'Property',
  finance: 'Finance & Accounts',
  daily: 'Daily Life',
  veteran: 'Veteran Benefits',
  business: 'Business',
  foreign: 'International',
}

const CATEGORY_ORDER = ['government', 'veteran', 'finance', 'property', 'business', 'daily', 'foreign']

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  const { data: familyRaw } = await service
    .from('families')
    .select('id, token, deceased_name, contact_name, intake_completed, tasks_generated, activated_at')
    .eq('token', token)
    .single()

  const family = familyRaw as {
    id: string
    token: string
    deceased_name: string
    contact_name: string
    intake_completed: boolean
    tasks_generated: boolean
    activated_at: string
  } | null

  if (!family) notFound()
  if (!family.intake_completed) redirect(`/f/${token}/intake`)

  const { data: tasksRaw } = await service
    .from('tasks')
    .select('*')
    .eq('family_id', family.id)
    .order('sort_order', { ascending: true })

  const tasks = (tasksRaw as Task[] | null) ?? []

  const done = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  // Group by category
  const grouped: Record<string, Task[]> = {}
  tasks.forEach(task => {
    if (!grouped[task.category]) grouped[task.category] = []
    grouped[task.category].push(task)
  })

  const urgent = tasks.filter(t => t.urgency === 'urgent' && t.status === 'pending')

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-leaf text-xs font-semibold tracking-widest uppercase mb-2">
            Estate of {family.deceased_name}
          </p>
          <h1 className="font-display text-4xl font-bold text-ink mb-1">
            Your 90-day plan
          </h1>
          <p className="text-mid text-sm">
            {done} of {total} tasks complete
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-white border border-sand rounded-lg p-5 mb-8 shadow-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-ink">Overall progress</span>
            <span className="font-display text-2xl font-bold text-forest">{pct}%</span>
          </div>
          <div className="h-2 bg-sand rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Urgent tasks */}
        {urgent.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gold rounded-full" />
              <h2 className="text-sm font-semibold tracking-widest uppercase text-gold">
                Needs attention soon
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {urgent.slice(0, 5).map(task => (
                <Link
                  key={task.id}
                  href={`/f/${token}/task/${task.id}`}
                  className="flex items-center justify-between bg-white border border-gold/30 rounded-lg px-5 py-4 hover:border-gold/60 hover:shadow-card transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gold/40 flex-shrink-0" />
                    <span className="text-sm font-medium text-ink group-hover:text-forest transition-colors">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.deadline_date && (
                      <span className="text-xs text-gold font-medium">
                        Due {new Date(task.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className="text-mid text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All tasks by category */}
        {CATEGORY_ORDER.filter(cat => grouped[cat]?.length > 0).map(category => (
          <div key={category} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-mid">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <span className="text-xs text-mid">
                {grouped[category].filter(t => t.status === 'done').length}/{grouped[category].length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {grouped[category].map(task => (
                <Link
                  key={task.id}
                  href={`/f/${token}/task/${task.id}`}
                  className={`flex items-center justify-between rounded-lg px-5 py-4 border transition-all group ${
                    task.status === 'done'
                      ? 'bg-forest/5 border-forest/20 opacity-60'
                      : 'bg-white border-sand hover:border-leaf hover:shadow-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      task.status === 'done'
                        ? 'bg-forest border-forest'
                        : 'border-sand group-hover:border-leaf'
                    }`}>
                      {task.status === 'done' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      task.status === 'done'
                        ? 'text-mid line-through'
                        : 'text-ink group-hover:text-forest'
                    }`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.urgency === 'urgent' && task.status !== 'done' && (
                      <span className="badge-urgent">Urgent</span>
                    )}
                    {task.deadline_date && task.status !== 'done' && (
                      <span className="text-xs text-mid">
                        {new Date(task.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className="text-mid text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-16 text-mid">
            <p className="text-sm">Your plan is being generated…</p>
            <p className="text-xs mt-2">Refresh in a few seconds.</p>
          </div>
        )}
      </div>
    </div>
  )
}
