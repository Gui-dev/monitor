export const metadata = {
  title: 'PulseOS.node',
  description: 'Real-time Linux server monitoring dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
