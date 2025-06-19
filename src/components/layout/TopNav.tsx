'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, Search, Bell, ChevronDown } from 'lucide-react'
import { MysticalButton } from '@/components/ui/MysticalButton'
import { MysticalSearch } from '@/components/ui/MysticalInput'
import { useSession, signOut } from 'next-auth/react'

interface TopNavProps {
  onMenuClick: () => void
  showVersionSelector?: boolean
  pageTitle?: string
}

export function TopNav({ onMenuClick, showVersionSelector, pageTitle }: TopNavProps) {
  const { data: session } = useSession()
  const [searchValue, setSearchValue] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {pageTitle && (
              <h1 className="text-lg font-semibold text-black hidden sm:block">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Center Section - Search & Version Control */}
          <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4">
            <MysticalSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search campaigns, messages, voters..."
              className="flex-1"
            />

            {showVersionSelector && (
              <VersionSelector />
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {showUserMenu && (
                <UserDropdown onClose={() => setShowUserMenu(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Version Control Selector
function VersionSelector() {
  const [selectedProfile, setSelectedProfile] = useState('union')
  
  const profiles = [
    { value: 'union', label: 'Union Workers' },
    { value: 'chamber', label: 'Chamber of Commerce' },
    { value: 'youth', label: 'Youth Voters' },
    { value: 'senior', label: 'Senior Citizens' },
    { value: 'rural', label: 'Rural Communities' },
    { value: 'urban', label: 'Urban Professionals' },
  ]

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-xs text-gray-500">Profile:</span>
      <select
        value={selectedProfile}
        onChange={(e) => setSelectedProfile(e.target.value)}
        className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer"
      >
        {profiles.map((profile) => (
          <option key={profile.value} value={profile.value}>
            {profile.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// User Dropdown Menu
function UserDropdown({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession()

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
        <div className="px-4 py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-black">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-gray-500">{session?.user?.email}</p>
        </div>
        
        <div className="py-2">
          <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Your Profile
          </a>
          <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Settings
          </a>
          <a href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Help & Support
          </a>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

// Notifications Dropdown
function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: 1,
      title: 'New campaign approval needed',
      message: 'Youth Outreach Campaign requires your approval',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'Message performance update',
      message: 'Your Union Workers message reached 15K voters',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'Historical insight available',
      message: 'New pattern detected in suburban voting trends',
      time: '3 hours ago',
      unread: false
    }
  ]

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-black">Notifications</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer',
                notification.unread && 'bg-blue-50/50'
              )}
            >
              <div className="flex items-start gap-3">
                {notification.unread && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-4 py-2">
          <a href="/notifications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all notifications
          </a>
        </div>
      </div>
    </>
  )
}