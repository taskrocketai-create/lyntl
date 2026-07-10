import Link from 'next/link'

const GateMark = ({ width = 34, height = 26, fill = '#0F3D2E' }: { width?: number; height?: number; fill?: string }) => (
  <svg width={width} height={height} viewBox="0 0 320 236" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Lyntl gate mark">
    <rect x="34" y="6" width="212" height="26" rx="1" fill="#B88A2E"/>
    <rect x="34" y="6" width="212" height="7" rx="1" fill="#CDA24A"/>
    <g fill={fill}>
      <rect x="44" y="36" width="60" height="14" rx="1"/><rect x="50" y="50" width="48" height="8"/><rect x="56" y="58" width="36" height="148"/><rect x="50" y="206" width="48" height="8"/><rect x="44" y="214" width="60" height="14" rx="1"/>
      <rect x="176" y="36" width="60" height="14" rx="1"/><rect x="182" y="50" width="48" height="8"/><rect x="188" y="58" width="36" height="148"/><rect x="182" y="206" width="48" height="8"/><rect x="176" y="214" width="60" height="14" rx="1"/>
    </g>
  </svg>
)

const notifications = [
  { title: 'SSA Deadline — 3 days', body: 'Your survivor benefit claim window closes soon.', time: 'now' },
  { title: 'Storage unit lease', body: 'Autopay renews Friday — cancel to avoid charge.', time: '2h ago' },
  { title: 'DMV title transfer ready', body: 'Form pre-filled and ready to submit.', time: 'yesterday' },
]

const missedItems = [
  'A storage unit still on autopay',
  'A life insurance policy from a job two employers ago',
  'Loyalty points still sitting on an account',
  'A benefits deadline about to quietly close',
]

const stats = [
  { num: '3.2M', label: 'Americans lose a loved one every year' },
  { num: '62%', label: 'of families miss a government benefit they\'re owed' },
  { num: '$0', label: 'spent on aftercare by most funeral homes today' },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F2E8', display: 'flex', flexDirection: 'column', fontFamily: "Georgia, 'Times New Roman', serif", color: '#0F3D2E', boxSizing: 'border-box' }}>

      {/* Nav */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <GateMark width={34} height={26} />
          <span style={{ fontSize: '20px', fontWeight: 400, letterSpacing: '0.18em' }}>LYNTL</span>
        </div>
        <Link href="/partner/login" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: '14px', fontWeight: 600, color: '#F7F2E8', background: '#0F3D2E', padding: '11px 22px', borderRadius: '6px', textDecoration: 'none' }}>
          Partner Login
        </Link>
      </header>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 64px 90px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '64px', alignItems: 'center', maxWidth: '1200px', width: '100%' }}>

          {/* Left copy */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#0F3D2E', background: '#efe6d4', padding: '8px 16px', borderRadius: '20px', marginBottom: '30px' }}>
              AI-Guided Estate Support
            </span>
            <h1 style={{ fontSize: '70px', lineHeight: 1.04, fontWeight: 400, letterSpacing: '-0.015em', margin: 0 }}>
              Carrying What<br/>
              <em style={{ fontStyle: 'italic', color: '#B88A2E' }}>Comes Next.</em>
            </h1>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '18.5px', lineHeight: 1.65, color: '#3a4a42', margin: '26px 0 0', maxWidth: '480px' }}>
              Lyntl finds the accounts, fills the forms, and tracks the deadlines that follow a loss — so you can move forward at your own pace.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '40px', alignItems: 'center' }}>
              <Link href="/partner/signup" style={{ display: 'inline-flex', alignItems: 'center', background: '#B88A2E', color: '#F7F2E8', fontFamily: 'system-ui, sans-serif', fontSize: '15.5px', fontWeight: 600, textDecoration: 'none', padding: '16px 32px', borderRadius: '8px', boxShadow: '0 12px 28px rgba(184,138,46,0.28)' }}>
                Get Started
              </Link>
              <Link href="/partner/login" style={{ fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#0F3D2E', textDecoration: 'none', opacity: 0.7 }}>
                Partner login →
              </Link>
            </div>
          </div>

          {/* Phone mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '300px', height: '500px', background: 'linear-gradient(160deg, #1a4a38, #0F3D2E)', borderRadius: '34px', boxShadow: '0 40px 70px rgba(15,61,46,0.28)', padding: '14px', boxSizing: 'border-box' as const }}>
              <div style={{ background: 'linear-gradient(160deg, #f0ead6, #e8dfc4)', borderRadius: '24px', height: '100%', padding: '20px 14px', boxSizing: 'border-box' as const, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 6px 18px', fontSize: '12px', fontWeight: 600, color: '#0F3D2E' }}>
                  <span>9:41</span><span style={{ fontSize: '10px' }}>●●●</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 300, color: '#0F3D2E', letterSpacing: '0.02em' }}>Thursday, July 10</span>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', background: '#fff', borderRadius: '16px', padding: '13px 14px', marginBottom: '10px', boxShadow: '0 6px 16px rgba(15,61,46,0.1)', opacity: i === 0 ? 1 : i === 1 ? 0.82 : 0.6 }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#B88A2E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GateMark width={14} height={10} fill="#F7F2E8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.02em' }}>LYNTL</span>
                        <span style={{ fontSize: '10.5px', color: '#a3ab9f' }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>{n.title}</div>
                      <div style={{ fontSize: '12.5px', color: '#4a544c', marginTop: '2px', lineHeight: 1.4 }}>{n.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What gets missed */}
      <section style={{ padding: '10px 64px 100px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1120px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '34px', fontWeight: 400, margin: '0 0 14px' }}>Grief leaves no room to remember everything.</h2>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', lineHeight: 1.7, color: '#3a4a42', margin: '0 auto', maxWidth: '580px' }}>
              Lyntl surfaces what&apos;s easy to overlook in a hard week, before it turns into a bigger problem.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {missedItems.map((text, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid #ece1c8', borderRadius: '12px', padding: '26px 22px' }}>
                <p style={{ margin: 0, fontFamily: 'system-ui, sans-serif', fontSize: '15px', lineHeight: 1.55 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#efe6d4', padding: '80px 64px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1120px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '52px', fontWeight: 400, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#3a4a42', marginTop: '12px', lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
