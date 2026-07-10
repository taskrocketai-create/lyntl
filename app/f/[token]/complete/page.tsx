import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'

const GateMark = () => (
  <svg width="72" height="53" viewBox="0 0 320 236" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Lyntl gate mark">
    <rect x="34" y="6" width="212" height="26" rx="1" fill="#B88A2E"/>
    <rect x="34" y="6" width="212" height="7" rx="1" fill="#CDA24A"/>
    <g fill="#0F3D2E">
      <rect x="44" y="36" width="60" height="14" rx="1"/><rect x="50" y="50" width="48" height="8"/><rect x="56" y="58" width="36" height="148"/><rect x="50" y="206" width="48" height="8"/><rect x="44" y="214" width="60" height="14" rx="1"/>
      <rect x="176" y="36" width="60" height="14" rx="1"/><rect x="182" y="50" width="48" height="8"/><rect x="188" y="58" width="36" height="148"/><rect x="182" y="206" width="48" height="8"/><rect x="176" y="214" width="60" height="14" rx="1"/>
    </g>
  </svg>
)

export default async function CompletionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  const { data: familyRaw } = await service
    .from('families')
    .select('id, deceased_name, contact_name')
    .eq('token', token)
    .single()

  const family = familyRaw as { id: string; deceased_name: string; contact_name: string } | null
  if (!family) notFound()

  const { data: tasksRaw } = await service
    .from('tasks')
    .select('id, status')
    .eq('family_id', family.id)

  const tasks = (tasksRaw as { id: string; status: string }[] | null) ?? []
  const done = tasks.filter(t => t.status === 'done' || t.status === 'skipped').length
  const total = tasks.length

  return (
    <div style={{ minHeight: '100vh', background: '#F7F2E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "Georgia, 'Times New Roman', serif", color: '#0F3D2E', boxSizing: 'border-box', padding: '40px 24px' }}>

      <GateMark />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '34px 0 30px' }}>
        <span style={{ width: '70px', height: '1px', background: '#B88A2E', display: 'block' }}></span>
        <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="5" y="0" width="7.07" height="7.07" transform="rotate(45 5 0)" fill="#B88A2E"/>
        </svg>
        <span style={{ width: '70px', height: '1px', background: '#B88A2E', display: 'block' }}></span>
      </div>

      <h1 style={{ fontSize: '42px', lineHeight: 1.15, fontWeight: 400, margin: 0, maxWidth: '560px', textAlign: 'center' }}>
        You&apos;ve taken care of everything.
      </h1>

      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '17px', lineHeight: 1.7, color: '#3a4a42', margin: '22px 0 0', maxWidth: '480px', textAlign: 'center' }}>
        Every account closed, every form filed, every deadline met. That was no small thing to carry — and you carried it.
      </p>

      <div style={{ marginTop: '44px', background: '#ffffff', borderRadius: '14px', padding: '24px 30px', boxShadow: '0 20px 40px rgba(15,61,46,0.1)', display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'system-ui, sans-serif' }}>
        <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1d5641', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', flexShrink: 0 }}>✓</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F3D2E' }}>{done} of {total} tasks complete</div>
          <div style={{ fontSize: '12.5px', color: '#8f9a90', marginTop: '2px' }}>Lyntl access remains open through day 90</div>
        </div>
      </div>

      <Link
        href={`/f/${token}/checklist`}
        style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#9a8a6a', marginTop: '32px', textDecoration: 'none', letterSpacing: '0.04em' }}
      >
        ← Back to checklist
      </Link>

      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#9a8a6a', marginTop: '40px', letterSpacing: '0.04em' }}>— With care, the Lyntl team</p>

    </div>
  )
}
