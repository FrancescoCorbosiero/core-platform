import React from 'react'

/* Root layout is a pass-through. Each route group
   ((frontend) and (payload)) provides its own <html> shell. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
