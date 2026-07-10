import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lyntl — Estate assistance, so you don\'t have to do it alone',
  description: 'Lyntl guides families through 40+ administrative tasks after a loss — AI-generated checklists, pre-written letters, and deadline reminders. Delivered through funeral homes.',
  openGraph: {
    title: 'Lyntl',
    description: 'Estate assistance, so you don\'t have to do it alone.',
    siteName: 'Lyntl',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased" style={{ background: "#F7F2E8", color: "#0F3D2E" }}>
        {children}
      </body>
    </html>
  )
}
