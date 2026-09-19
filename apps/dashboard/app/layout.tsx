import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PulseOS.node — Linux Monitoring Agent',
  description: 'Real-time Linux server monitoring dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
