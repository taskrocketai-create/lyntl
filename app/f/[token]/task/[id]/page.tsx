import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'
import TaskActions from './TaskActions'
import type { Task } from '@/types/database'

export default async function TaskPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>
}) {
  const { token, id } = await params
  const service = createServiceClient()

  // Verify family owns this task
  const { data: familyRaw } = await service
    .from('families')
    .select('id, deceased_name, contact_name')
    .eq('token', token)
    .single()

  const family = familyRaw as { id: string; deceased_name: string; contact_name: string } | null
  if (!family) notFound()

  const { data: taskRaw } = await service
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('family_id', family.id)
    .single()

  const task = taskRaw as Task | null
  if (!task) notFound()

  // Fill letter template with family details
  const letter = task.letter_body
    ? (task.letter_body as string)
        .replace(/\[DECEASED_NAME\]/g, family.deceased_name)
        .replace(/\[EXECUTOR_NAME\]/g, family.contact_name)
        .replace(/\[DATE_OF_DEATH\]/g, new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
    : null

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Back */}
        <Link
          href={`/f/${token}/checklist`}
          className="inline-flex items-center gap-2 text-mid text-sm hover:text-forest transition-colors mb-8"
        >
          ← Back to checklist
        </Link>

        {/* Task header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            {task.urgency === 'urgent' && (
              <span className="badge-urgent">Urgent</span>
            )}
            {task.deadline_date && (
              <span className="text-xs text-mid">
                Due {new Date(task.deadline_date).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-ink mb-3">
            {task.title}
          </h1>
          <p className="text-mid leading-relaxed">{task.description}</p>
        </div>

        {/* Why it matters */}
        {task.why_it_matters && (
          <div className="bg-forest/8 border border-forest/20 rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-forest mb-1">Why this matters</p>
            <p className="text-sm text-ink leading-relaxed">{task.why_it_matters}</p>
          </div>
        )}

        {/* Government form */}
        {task.gov_form_name && (
          <div className="bg-white border border-sand rounded-lg p-5 mb-6 shadow-card">
            <p className="text-xs font-semibold tracking-widest uppercase text-mid mb-2">Official form</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{task.gov_form_name}</span>
              {task.gov_form_url && (
                <a
                  href={task.gov_form_url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold text-sm hover:text-amber-600 transition-colors font-medium"
                >
                  Open form →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Letter template */}
        {letter && (
          <div className="bg-white border border-sand rounded-lg p-6 mb-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-mid">
                Notification letter
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(letter)}
                className="text-gold text-xs hover:text-amber-600 transition-colors"
              >
                Copy letter
              </button>
            </div>
            {task.letter_subject && (
              <div className="mb-3 pb-3 border-b border-sand">
                <p className="text-xs text-mid mb-1">Subject</p>
                <p className="text-sm font-medium text-ink">{task.letter_subject}</p>
              </div>
            )}
            <pre className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
              {letter}
            </pre>
          </div>
        )}

        {/* Mark done / skip actions */}
        <TaskActions taskId={task.id} token={token} currentStatus={task.status} />

      </div>
    </div>
  )
}
