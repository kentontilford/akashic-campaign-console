import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 text-center">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            Page not found
          </h2>
          
          <p className="mt-2 text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="mt-8 flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-akashic-secondary transition-colors"
            >
              Go home
            </Link>
            
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}