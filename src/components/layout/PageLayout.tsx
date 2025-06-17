'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  showVersionSelector?: boolean
}

export default function PageLayout({ 
  children, 
  title,
  description, 
  showVersionSelector = false 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showVersionSelector={showVersionSelector} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-2 text-lg text-gray-600">{description}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}