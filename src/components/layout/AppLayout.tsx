'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { useSession } from 'next-auth/react'
import { MysticalPageLoader } from '@/components/ui/MysticalLoading'

interface AppLayoutProps {
  children: React.ReactNode
  showVersionSelector?: boolean
  pageTitle?: string
}

export function AppLayout({ 
  children, 
  showVersionSelector = false,
  pageTitle
}: AppLayoutProps) {
  const { status } = useSession()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  if (status === 'loading') {
    return <MysticalPageLoader isLoading={true} text="Initializing mystical connection..." />
  }

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden lg:block transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-[280px]'
      )}>
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        'lg:hidden fixed left-0 top-0 h-full w-[280px] z-50 transform transition-transform duration-300',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar 
          collapsed={false}
          onToggleCollapse={() => setMobileSidebarOpen(false)}
          isMobile
        />
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <TopNav 
          onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          showVersionSelector={showVersionSelector}
          pageTitle={pageTitle}
        />
        
        <main className="page-content">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Page Header Component
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="text-gray-600 hover:text-black transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-black font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Content Section Component
export function ContentSection({
  title,
  description,
  actions,
  children,
  className
}: {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-8', className)}>
      {(title || actions) && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold text-black">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}