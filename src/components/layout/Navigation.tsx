'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import VersionSelector from '../version-control/VersionSelector'

interface NavigationProps {
  showVersionSelector?: boolean
}

export default function Navigation({ showVersionSelector }: NavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const userNavigation = [
    { name: 'Your Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
    { name: 'Sign out', href: '#', onClick: () => signOut() },
  ]

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-lg'
            : 'bg-white/50 backdrop-blur-sm'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <Logo size="sm" showText glow="subtle" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {session && navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    pathname === item.href
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {showVersionSelector && <VersionSelector />}
              
              {session ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-brand-600">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span>{session.user?.name || 'User'}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              onClick={item.onClick}
                              className={cn(
                                'block px-4 py-2 text-sm text-gray-700',
                                active && 'bg-gray-50'
                              )}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <Button variant="primary" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div 
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <Logo size="sm" showText />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              {session && (
                <div className="p-6 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-base font-medium transition-all',
                        pathname === item.href
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              {session ? (
                <div className="p-6 border-t">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-base font-medium text-brand-600">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                  {userNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={item.onClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-6 border-t">
                  <Button variant="primary" className="w-full" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}