'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PartnerSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    funeral_home_name: '',
    contact_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    password: '',
    confirm_password: '',
  })

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/partner/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="font-display text-3xl font-bold text-linen mb-2">
            Estate<span className="text-gold">Desk</span>
          </div>
          <div className="mt-10 bg-forest/20 border border-leaf/30 rounded-lg p-8">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="font-display text-2xl font-bold text-linen mb-3">Account created</h2>
            <p className="text-moss text-sm leading-relaxed mb-6">
              Check your email to confirm your address, then sign in to your partner dashboard.
            </p>
            <Link href="/partner/login" className="btn-primary inline-block">
              Go to sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const US_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY','DC',
  ]

  return (
    <main className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="font-display text-3xl font-bold text-linen mb-2">
            Estate<span className="text-gold">Desk</span>
          </div>
          <p className="text-mid text-sm">Create your partner account</p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Funeral home info */}
            <div>
              <p className="eyebrow-moss mb-4">Funeral home</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Funeral home name</label>
                  <input
                    required
                    className="input"
                    placeholder="Joyner's Funeral Home"
                    value={form.funeral_home_name}
                    onChange={e => update('funeral_home_name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input
                      required
                      className="input"
                      placeholder="Wilson"
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <select
                      required
                      className="input"
                      value={form.state}
                      onChange={e => update('state', e.target.value)}
                    >
                      <option value="">Select</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Contact info */}
            <div>
              <p className="eyebrow-moss mb-4">Your contact info</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Your name</label>
                  <input
                    required
                    className="input"
                    placeholder="Dale Joyner"
                    value={form.contact_name}
                    onChange={e => update('contact_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="dale@joynersfuneralhome.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    placeholder="(252) 000-0000"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Password */}
            <div>
              <p className="eyebrow-moss mb-4">Set a password</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="input"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input
                    type="password"
                    required
                    className="input"
                    placeholder="••••••••"
                    value={form.confirm_password}
                    onChange={e => update('confirm_password', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-mid text-sm mt-6">
          Already have an account?{' '}
          <Link href="/partner/login" className="text-gold hover:text-amber-400 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
