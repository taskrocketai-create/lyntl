'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  partnerId: string
  partnerName: string
}

export default function ActivateFamilyButton({ partnerId, partnerName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    deceased_name: '',
    deceased_dod: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  })

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/family/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, partner_id: partnerId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to activate family.')
        setLoading(false)
        return
      }

      setOpen(false)
      setForm({ deceased_name: '', deceased_dod: '', contact_name: '', contact_email: '', contact_phone: '' })
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        Activate family
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-ink border border-white/10 rounded-xl p-8 w-full max-w-md shadow-deep">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-linen font-semibold text-lg">Activate new family</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-mid hover:text-linen transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
              <div>
                <p className="eyebrow-moss mb-3">Deceased</p>
                <div className="space-y-3">
                  <div>
                    <label className="label">Full legal name</label>
                    <input
                      required
                      className="input"
                      placeholder="Robert Johnson"
                      value={form.deceased_name}
                      onChange={e => update('deceased_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Date of passing</label>
                    <input
                      type="date"
                      className="input"
                      value={form.deceased_dod}
                      onChange={e => update('deceased_dod', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div>
                <p className="eyebrow-moss mb-3">Family contact</p>
                <div className="space-y-3">
                  <div>
                    <label className="label">Contact name</label>
                    <input
                      required
                      className="input"
                      placeholder="Sarah Johnson"
                      value={form.contact_name}
                      onChange={e => update('contact_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Mobile number <span className="text-gold">*</span></label>
                    <input
                      type="tel"
                      required
                      className="input"
                      placeholder="(252) 000-0000"
                      value={form.contact_phone}
                      onChange={e => update('contact_phone', e.target.value)}
                    />
                    <p className="text-mid text-xs mt-1">Used to send the family their Lyntl link via SMS.</p>
                  </div>
                  <div>
                    <label className="label">Email <span className="text-mid font-normal normal-case">(optional)</span></label>
                    <input
                      type="email"
                      className="input"
                      placeholder="sarah@email.com"
                      value={form.contact_email}
                      onChange={e => update('contact_email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Activating…' : 'Activate — $49'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
