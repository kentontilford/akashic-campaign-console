'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    logger.error('Application error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
            Something went wrong!
          </h2>
          
          <p className="mt-2 text-sm text-center text-gray-600">
            An unexpected error occurred. Our team has been notified.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-gray-100 rounded text-xs">
              <summary className="cursor-pointer font-medium">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
          
          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-akashic-secondary transition-colors"
            >
              Try again
            </button>
            
            <a
              href="/"
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}