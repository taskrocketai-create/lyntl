import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function PartnerLoginPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0F3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
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
