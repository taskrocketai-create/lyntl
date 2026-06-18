import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'

export default async function FamilyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  const { data: family } = await service
    .from('families')
    .select('token, intake_completed, tasks_generated')
    .eq('token', token)
    .single()

  if (!family) notFound()

  if (!family.intake_completed) {
    redirect(`/f/${token}/intake`)
  }

  redirect(`/f/${token}/checklist`)
}
