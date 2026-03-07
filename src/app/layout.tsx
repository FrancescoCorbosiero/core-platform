import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tereso - Educazione Finanziaria',
  description: 'La tua piattaforma di educazione finanziaria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
