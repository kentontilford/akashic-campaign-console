'use client'

import { useEffect } from 'react'
import { MysticalButton } from '@/components/ui'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Error
        </h2>
        <p className="text-gray-600 mb-6">
          We're having trouble loading your dashboard. This might be due to a temporary connection issue.
        </p>
        <div className="space-y-2">
          <MysticalButton
            onClick={() => reset()}
            variant="primary"
            className="w-full"
          >
            Try Again
          </MysticalButton>
          <MysticalButton
            onClick={() => window.location.href = '/'}
            variant="secondary"
            className="w-full"
          >
            Go Home
          </MysticalButton>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-gray-500">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}