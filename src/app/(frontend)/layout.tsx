import React from 'react'
import { Inter, Playfair_Display } from 'next/font/google'
import './styles.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata = {
  title: 'Multi-Tenant CMS',
  description: 'A multi-tenant blog platform powered by Payload CMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
