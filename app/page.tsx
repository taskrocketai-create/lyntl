import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-12 h-16 border-b border-white/10">
        <Image
          src="/logo-horizontal.svg"
          alt="Lyntl"
          width={200}
          height={42}
          priority
          className="brightness-0 invert"
        />
        <Link href="/partner/login" className="btn-ghost text-xs py-2 px-4">
          Partner login
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center px-12 py-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-6">Built for funeral homes</p>
          <h1 className="font-display text-6xl font-bold text-linen leading-tight mb-6">
            Estate assistance,<br />
            <em className="text-gold italic">carrying what<br />comes next.</em>
          </h1>
          <p className="text-moss text-lg font-light leading-relaxed mb-10 max-w-lg">
            Lyntl gives every family you serve a guided AI checklist for the
            40+ administrative tasks that follow a loss — branded with your name,
            activated in seconds, $49 per family.
          </p>
          <div className="flex gap-4">
            <Link href="/partner/signup" className="btn-primary">
              Get started
            </Link>
            <Link href="/partner/login" className="btn-ghost">
              Partner login
            </Link>
          </div>
        </div>
      </section>

      {/* Stat bar */}
      <div className="bg-forest grid grid-cols-3 divide-x divide-white/10">
        {[
          { num: '3.2M', label: 'Americans lose a loved one every year' },
          { num: '62%', label: 'of families miss a government benefit they\'re owed' },
          { num: '$49', label: 'per family, wholesale, only when you activate' },
        ].map((s) => (
          <div key={s.num} className="text-center py-8 px-6">
            <div className="font-display text-4xl font-bold text-gold mb-2">{s.num}</div>
            <div className="text-xs text-moss leading-relaxed">{s.label}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
