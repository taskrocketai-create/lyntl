import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import IntakeWizard from './IntakeWizard'

export default async function IntakePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  const { data: familyRaw } = await service
    .from('families')
    .select('id, token, deceased_name, contact_name, intake_completed, deceased_dod')
    .eq('token', token)
    .single()

  const family = familyRaw as {
    id: string
    token: string
    deceased_name: string
    contact_name: string
    intake_completed: boolean
    deceased_dod: string | null
  } | null

  if (!family) notFound()
  if (family.intake_completed) redirect(`/f/${token}/checklist`)

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-leaf text-xs font-semibold tracking-widest uppercase mb-3">
            Getting started
          </p>
          <h1 className="font-display text-4xl font-bold text-ink leading-tight mb-3">
            Let's build your plan,<br />
            <span className="text-forest">{family.contact_name}.</span>
          </h1>
          <p className="text-mid text-base leading-relaxed">
            We'll ask you a few questions about {family.deceased_name}'s estate.
            Your answers help us build a personalized checklist — only the tasks
            that apply to your situation.
          </p>
        </div>

        <IntakeWizard
          familyId={family.id}
          token={family.token}
          deceasedName={family.deceased_name}
          deceasedDod={family.deceased_dod}
        />
      </div>
    </div>
  )
}
