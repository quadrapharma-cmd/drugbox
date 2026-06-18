import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drugbox — Pharma Professional Network',
  description: 'The professional network for pharma, cosmetics & medical devices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
