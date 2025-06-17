'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import VersionSelector from '../version-control/VersionSelector'

interface NavigationProps {
  showVersionSelector?: boolean
}

export default function Navigation({ showVersionSelector }: NavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/messages', label: 'Messages' },
    { href: '/templates', label: 'Templates' },
    { href: '/scheduled', label: 'Scheduled' },
    { href: '/approvals', label: 'Approvals' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/activity', label: 'Activity' },
    { href: '/mapping', label: 'Election Mapping' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-akashic-primary">
                Akashic Intelligence
              </span>
            </Link>
            
            {session && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-akashic-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {showVersionSelector && <VersionSelector />}
            
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary text-sm"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}