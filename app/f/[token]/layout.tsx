import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'

export default async function FamilyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  const { data: familyRaw } = await service
    .from('families')
    .select('id, token, partner_id')
    .eq('token', token)
    .single()

  const family = familyRaw as { id: string; token: string; partner_id: string } | null
  if (!family) notFound()

  const { data: partnerRaw } = await service
    .from('partners')
    .select('name')
    .eq('id', family.partner_id)
    .single()

  const partner = partnerRaw as { name: string } | null

  return (
    <div className="min-h-screen bg-linen text-ink">
      <nav className="flex items-center justify-between px-8 h-14 bg-forest border-b border-forest/80 sticky top-0 z-10">
        <img src="/logo-horizontal.svg" alt="Lyntl" className="h-8 brightness-0 invert" />
        <div className="text-right">
          <div className="text-sand text-sm font-medium">{partner?.name}</div>
          <div className="text-moss text-xs">Family portal</div>
        </div>
      </nav>
      {children}
    </div>
  )
}
