import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { MysticalButton, MysticalCard } from '@/components/ui'
import { Plus, Users, MessageSquare } from 'lucide-react'

export default async function TestDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h2>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
          <MysticalButton asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </MysticalButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-black">Test Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {session.user.name || session.user.email}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            User ID: {session.user.id || 'Not available'}
          </p>
        </div>
        <MysticalButton variant="primary" size="lg" asChild>
          <Link href="/messages/new">
            <span className="inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Message
            </span>
          </Link>
        </MysticalButton>
      </div>

      {/* Simple Status Card */}
      <MysticalCard>
        <h2 className="text-xl font-semibold text-black mb-4">System Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Authentication</span>
            <span className="text-green-600 font-medium">✓ Working</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Session</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Database</span>
            <span className="text-yellow-600 font-medium">⚠ Testing...</span>
          </div>
        </div>
      </MysticalCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MysticalCard className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Campaigns</h3>
          <p className="text-gray-600 text-sm mt-1">Manage your campaigns</p>
          <MysticalButton variant="secondary" size="sm" asChild className="mt-4">
            <Link href="/campaigns">View Campaigns</Link>
          </MysticalButton>
        </MysticalCard>

        <MysticalCard className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Messages</h3>
          <p className="text-gray-600 text-sm mt-1">Create and manage messages</p>
          <MysticalButton variant="secondary" size="sm" asChild className="mt-4">
            <Link href="/messages">View Messages</Link>
          </MysticalButton>
        </MysticalCard>

        <MysticalCard className="text-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-gray-600 font-bold">AI</span>
          </div>
          <h3 className="font-semibold text-gray-900">Templates</h3>
          <p className="text-gray-600 text-sm mt-1">Message templates</p>
          <MysticalButton variant="secondary" size="sm" asChild className="mt-4">
            <Link href="/templates">View Templates</Link>
          </MysticalButton>
        </MysticalCard>
      </div>

      {/* Debug Info */}
      <MysticalCard>
        <h3 className="font-semibold text-gray-900 mb-2">Debug Information</h3>
        <pre className="text-xs text-gray-600 overflow-auto p-3 bg-gray-50 rounded">
{JSON.stringify({
  session: {
    user: {
      email: session.user.email,
      name: session.user.name,
      id: session.user.id,
      role: (session.user as any).role
    }
  },
  timestamp: new Date().toISOString()
}, null, 2)}
        </pre>
      </MysticalCard>
    </div>
  )
}