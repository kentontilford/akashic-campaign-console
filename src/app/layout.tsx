import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'
import ToastProvider from '@/components/providers/ToastProvider'

// Skip validation during build

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Akashic Intelligence - Campaign Console',
  description: 'The Key to Comprehensive Political Understanding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}