import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import type { Family, Partner } from '@/types/database'

export default async function FamilyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  // Look up family by token
  const { data: family } = await service
    .from('families')
    .select('*, partners(*)')
    .eq('token', token)
    .single()

  if (!family) notFound()

  const partner = (family as any).partners as Partner

  return (
    <div className="min-h-screen bg-linen text-ink">
      {/* Family portal nav */}
      <nav className="flex items-center justify-between px-8 h-14 bg-forest border-b border-forest/80 sticky top-0 z-10">
        <div className="font-display text-lg font-bold text-linen">
          Estate<span className="text-gold">Desk</span>
        </div>
        <div className="text-moss text-xs text-right">
          <div className="text-sand text-sm font-medium">{partner?.name}</div>
          <div>Family portal</div>
        </div>
      </nav>
      {children}
    </div>
  )
}
