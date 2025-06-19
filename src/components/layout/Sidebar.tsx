'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle,
  BarChart3,
  Map,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  History,
  X
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  isMobile?: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Users },
  { name: 'Version Control', href: '/version-control', icon: Sparkles },
  { name: 'Message Generator', href: '/messages', icon: MessageSquare },
  { name: 'Voter Analysis', href: '/voters', icon: BarChart3 },
  { name: 'Historical Insights', href: '/elections', icon: History },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ collapsed, onToggleCollapse, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="block">
            <Logo 
              variant={collapsed ? 'icon' : 'horizontal'} 
              theme="black" 
              size="sm"
              showGlow
            />
          </Link>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isMobile ? (
              <X className="h-5 w-5" />
            ) : collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                'hover:bg-gray-50 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]',
                isActive && 'bg-black text-white hover:bg-gray-900',
                !isActive && 'text-gray-700 hover:text-black',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-white')} />
              {!collapsed && (
                <span className="font-medium">{item.name}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer',
          collapsed && 'justify-center'
        )}>
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium">U</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">User Name</p>
              <p className="text-xs text-gray-500 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}