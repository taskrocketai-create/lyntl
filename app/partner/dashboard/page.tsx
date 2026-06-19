import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import ActivateFamilyButton from './ActivateFamilyButton'

export default async function PartnerDashboardPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/partner/login')

  // Get partner record
  const { data: partnerUser } = await supabase
    .from('partner_users')
    .select('partner_id, role')
    .eq('user_id', user.id)
    .single()

  if (!partnerUser) redirect('/partner/login')

  const service = createServiceClient()

  const { data: partner } = await service
    .from('partners')
    .select('*')
    .eq('id', partnerUser.partner_id)
    .single()

  if (!partner) redirect('/partner/login')

  // Get families for this partner
  const { data: families } = await service
    .from('families')
    .select('*')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <main className="min-h-screen bg-ink">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 h-14 border-b border-white/5 bg-ink/95 backdrop-blur sticky top-0 z-10">
        <img src="/logo-horizontal.svg" alt="Lyntl" className="h-8 brightness-0 invert" />
        <div className="flex items-center gap-6">
          <span className="text-moss text-sm">{partner.name}</span>
          <form action="/api/partner/logout" method="POST">
            <button className="text-mid text-xs hover:text-linen transition-colors uppercase tracking-widest">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="font-display text-4xl font-bold text-linen">
              {partner.name}
            </h1>
            <p className="text-mid text-sm mt-1">{partner.city}{partner.state ? `, ${partner.state}` : ''}</p>
          </div>
          <ActivateFamilyButton partnerId={partner.id} partnerName={partner.name} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total families', value: families?.length ?? 0 },
            { label: 'Intake complete', value: families?.filter(f => f.intake_completed).length ?? 0 },
            { label: 'Active this month', value: families?.filter(f => {
              const d = new Date(f.activated_at)
              const now = new Date()
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-forest/20 border border-forest/40 rounded-lg p-5">
              <div className="font-display text-3xl font-bold text-gold">{s.value}</div>
              <div className="text-moss text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Families table */}
        <div className="bg-white/5 border border-white/5 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-linen font-semibold text-sm tracking-wide">Activated families</h2>
          </div>

          {!families || families.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-mid text-sm mb-4">No families activated yet.</p>
              <p className="text-mid/60 text-xs">Click "Activate family" to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Deceased', 'Family contact', 'Activated', 'Status', 'Link'].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-mid px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {families.map((family) => (
                  <tr key={family.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-linen text-sm font-medium">{family.deceased_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sand text-sm">{family.contact_name}</div>
                      <div className="text-mid text-xs">{family.contact_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-mid text-xs">
                      {new Date(family.activated_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {!family.intake_completed ? (
                        <span className="badge-pending">Awaiting intake</span>
                      ) : !family.tasks_generated ? (
                        <span className="badge-urgent">Generating tasks</span>
                      ) : (
                        <span className="badge-done">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`${appUrl}/f/${family.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold text-xs hover:text-amber-400 transition-colors font-mono"
                      >
                        /f/{family.token}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
