import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-black">
          Akashic Intelligence
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The Key to Comprehensive Political Understanding
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="inline-block px-6 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  )
}