import type { Metadata } from 'next'
import './globals.css'
import React from 'react'

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
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
