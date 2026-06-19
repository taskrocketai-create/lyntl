import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function PartnerLoginPage() {
  return (
    <main className="min-h-screen bg-ink flex flex-col items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-sm text-center">
          <div className="font-display text-3xl font-bold text-linen mb-2">
            Lyntl
          </div>
          <p className="text-mid text-sm">Loading…</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  )
}
