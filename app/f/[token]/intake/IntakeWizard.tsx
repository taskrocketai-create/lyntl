'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  familyId: string
  token: string
  deceasedName: string
  deceasedDod: string | null
}

type Answer = string | boolean | string[] | null

interface Answers {
  [key: string]: Answer
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

export default function IntakeWizard({ familyId, token, deceasedName, deceasedDod }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: Answer) {
    setAnswers(a => ({ ...a, [key]: value }))
  }

  function get(key: string): Answer {
    return answers[key] ?? null
  }

  const sections = [
    {
      id: 'deceased',
      title: 'About the deceased',
      subtitle: `Tell us a bit about ${deceasedName}'s situation.`,
    },
    {
      id: 'estate',
      title: 'Estate & assets',
      subtitle: 'This helps us know which tasks apply.',
    },
    {
      id: 'benefits',
      title: 'Benefits & government',
      subtitle: 'We\'ll make sure nothing is missed.',
    },
    {
      id: 'family',
      title: 'Family & executor',
      subtitle: 'So we know who\'s handling what.',
    },
    {
      id: 'foreign',
      title: 'International assets',
      subtitle: 'Only if applicable.',
    },
  ]

  const totalSteps = sections.length
  const progress = Math.round(((step) / totalSteps) * 100)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/family/complete-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, token, answers }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setLoading(false)
        return
      }
      router.push(`/f/${token}/checklist`)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  function YesNo({ qKey, label }: { qKey: string; label: string }) {
    const val = get(qKey)
    return (
      <div className="mb-5">
        <label className="block text-sm font-medium text-ink mb-2">{label}</label>
        <div className="flex gap-3">
          {['Yes', 'No', 'Unknown'].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => set(qKey, opt)}
              className={`px-5 py-2.5 rounded text-sm font-medium border transition-all ${
                val === opt
                  ? 'bg-forest text-linen border-forest'
                  : 'bg-white text-mid border-sand hover:border-leaf'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    )
  }

  function TextInput({ qKey, label, placeholder }: { qKey: string; label: string; placeholder?: string }) {
    return (
      <div className="mb-5">
        <label className="block text-sm font-medium text-ink mb-2">{label}</label>
        <input
          type="text"
          className="input-linen"
          placeholder={placeholder}
          value={(get(qKey) as string) || ''}
          onChange={e => set(qKey, e.target.value)}
        />
      </div>
    )
  }

  function Select({ qKey, label, options }: { qKey: string; label: string; options: string[] }) {
    return (
      <div className="mb-5">
        <label className="block text-sm font-medium text-ink mb-2">{label}</label>
        <select
          className="input-linen"
          value={(get(qKey) as string) || ''}
          onChange={e => set(qKey, e.target.value)}
        >
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0: // Deceased
        return (
          <>
            <Select qKey="deceased_state" label="State of primary residence at time of death" options={US_STATES} />
            <YesNo qKey="us_citizen" label="Were they a US citizen or permanent resident?" />
            <YesNo qKey="was_veteran" label="Were they a veteran or active military?" />
            <YesNo qKey="was_employed" label="Were they employed at the time of passing?" />
            {get('was_employed') === 'Yes' && (
              <TextInput qKey="employer_name" label="Employer name" placeholder="Company name" />
            )}
            <YesNo qKey="owned_business" label="Did they own a business?" />
            {get('owned_business') === 'Yes' && (
              <Select qKey="business_type" label="Business type" options={['Sole proprietor', 'LLC', 'Corporation', 'Partnership']} />
            )}
          </>
        )
      case 1: // Estate
        return (
          <>
            <YesNo qKey="has_will" label="Is there a will?" />
            <YesNo qKey="has_trust" label="Is there a revocable living trust?" />
            <YesNo qKey="jointly_held" label="Were assets jointly held with a surviving spouse?" />
            <YesNo qKey="has_property" label="Did they own real estate?" />
            {get('has_property') === 'Yes' && (
              <TextInput qKey="property_states" label="Which state(s) is the property in?" placeholder="e.g. NC, FL" />
            )}
            <YesNo qKey="has_vehicle" label="Did they own a vehicle?" />
            <YesNo qKey="has_bank_accounts" label="Did they have bank or investment accounts?" />
            <YesNo qKey="has_retirement" label="Did they have retirement accounts (401k, IRA, pension)?" />
            <YesNo qKey="has_life_insurance" label="Did they have life insurance?" />
            <YesNo qKey="has_digital_assets" label="Did they have digital assets with monetary value (crypto, PayPal, Venmo, brokerage apps)?" />
            <YesNo qKey="has_debts" label="Did they have significant debts or liabilities?" />
            <YesNo qKey="has_safe_deposit" label="Did they have a safe deposit box?" />
          </>
        )
      case 2: // Benefits
        return (
          <>
            <YesNo qKey="received_ss" label="Were they receiving Social Security?" />
            <YesNo qKey="received_pension" label="Were they receiving a pension?" />
            {get('received_pension') === 'Yes' && (
              <Select qKey="pension_type" label="Pension type" options={['Government', 'Private employer']} />
            )}
            <YesNo qKey="received_va" label="Were they receiving VA benefits?" />
            <YesNo qKey="received_medicare" label="Were they receiving Medicare or Medicaid?" />
          </>
        )
      case 3: // Family
        return (
          <>
            <TextInput qKey="executor_name" label="Who is the executor or estate administrator?" placeholder="Full name" />
            <Select qKey="executor_relation" label="Their relationship to the deceased" options={['Spouse', 'Child', 'Sibling', 'Parent', 'Friend', 'Attorney', 'Other']} />
            <YesNo qKey="has_spouse" label="Is there a surviving spouse?" />
            <YesNo qKey="has_minor_children" label="Are there minor children?" />
            {get('has_minor_children') === 'Yes' && (
              <YesNo qKey="has_guardianship_docs" label="Are there guardianship documents in place?" />
            )}
            <Select qKey="family_size" label="How many people are actively managing the estate?" options={['Just me', '2–3 people', '4 or more']} />
          </>
        )
      case 4: // Foreign
        return (
          <>
            <YesNo qKey="has_foreign_assets" label="Did they have assets, property, or accounts outside the US?" />
            {get('has_foreign_assets') === 'Yes' && (
              <TextInput qKey="foreign_countries" label="Which countries?" placeholder="e.g. Dominican Republic, Canada" />
            )}
            <YesNo qKey="has_foreign_pension" label="Did they receive a foreign pension or government benefit?" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-mid mb-2">
          <span>Section {step + 1} of {totalSteps}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-forest rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3">
          <p className="text-xs font-semibold tracking-widest uppercase text-leaf">
            {sections[step].id}
          </p>
          <h2 className="font-display text-2xl font-bold text-ink">{sections[step].title}</h2>
          <p className="text-mid text-sm mt-1">{sections[step].subtitle}</p>
        </div>
      </div>

      {/* Section divider */}
      <div className="h-px bg-sand mb-7" />

      {/* Questions */}
      <div>{renderStep()}</div>

      {/* Error */}
      {error && (
        <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="btn-ghost flex-1 text-ink border-sand"
          >
            Back
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="btn-forest flex-1"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Building your plan…' : 'Build my estate plan →'}
          </button>
        )}
      </div>

      {step === totalSteps - 1 && (
        <p className="text-center text-mid text-xs mt-4">
          This takes about 30 seconds. Claude AI will generate your personalized checklist.
        </p>
      )}
    </div>
  )
}
