# Akashic Intelligence UI Implementation - Step by Step Guide

## Overview
This guide takes you from zero to a fully polished, professional UI for Akashic Intelligence Campaign Console.

---

## Phase 1: Foundation Setup (Days 1-3)

### Step 1: Logo Implementation
✅ **Completed**
- Created logo variations (white, black, glow)
- Implemented CSS glow effects
- Built Logo component with multiple variants

### Step 2: Install Core Dependencies
```bash
npm install @radix-ui/react-alert-dialog @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-scroll-area @radix-ui/react-avatar
npm install framer-motion class-variance-authority clsx tailwind-merge
npm install recharts react-hot-toast
npm install -D @tailwindcss/forms @tailwindcss/typography
```

### Step 3: Create Utility Functions
Create `/src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Step 4: Update Tailwind Configuration
Replace your `tailwind.config.ts` with:
```javascript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.5)',
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
        'glow-xl': '0 0 40px rgba(59, 130, 246, 0.6)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
```

---

## Phase 2: Core Components (Days 4-7)

### Step 5: Create Button Component
Create `/src/components/ui/Button.tsx` (already provided in design guide)

### Step 6: Create Card Components
Create `/src/components/ui/Card.tsx`:
```typescript
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ 
  className, 
  variant = 'default', 
  padding = 'md',
  children, 
  ...props 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glow: 'bg-white border border-brand-200 shadow-glow-sm',
    interactive: 'bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all cursor-pointer',
  }

  if (variant === 'interactive') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={cn(
          'rounded-xl',
          paddingClasses[padding],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl',
        paddingClasses[padding],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-xl font-semibold text-gray-900', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gray-600', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex items-center justify-between', className)} {...props} />
}
```

### Step 7: Create Input Components
Create `/src/components/ui/Input.tsx`:
```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-200 hover:border-gray-300',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

### Step 8: Create Typography Components
Create `/src/components/ui/Typography.tsx`:
```typescript
import { cn } from '@/lib/utils'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption'
  as?: React.ElementType
}

const variantStyles = {
  h1: 'text-4xl font-bold tracking-tight text-gray-900',
  h2: 'text-3xl font-semibold tracking-tight text-gray-900',
  h3: 'text-2xl font-semibold text-gray-900',
  h4: 'text-xl font-medium text-gray-900',
  body: 'text-base text-gray-700',
  'body-sm': 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
}

export function Typography({ 
  variant = 'body', 
  as,
  className,
  ...props 
}: TypographyProps) {
  const Component = as || (variant.startsWith('h') ? variant : 'p')
  
  return (
    <Component 
      className={cn(variantStyles[variant], className)} 
      {...props} 
    />
  )
}
```

---

## Phase 3: Layout Components (Days 8-10)

### Step 9: Update Navigation Component
Update `/src/components/layout/Navigation.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/messages', label: 'Messages' },
  { href: '/analytics', label: 'Analytics' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            <Link href="/" className="flex items-center">
              <Logo size="sm" showText glow="subtle" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    pathname === item.href
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button variant="primary" size="sm">
                Get Started
              </Button>
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
              <div className="p-6 space-y-3 border-t">
                <Button variant="secondary" className="w-full">
                  Sign In
                </Button>
                <Button variant="primary" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

### Step 10: Create Page Layout Component
Create `/src/components/layout/PageLayout.tsx`:
```typescript
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
  containerClassName?: string
}

export function PageLayout({
  children,
  title,
  description,
  actions,
  className,
  containerClassName,
}: PageLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('min-h-screen bg-gray-50', className)}
    >
      <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8', containerClassName)}>
        {(title || description || actions) && (
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-2 text-gray-600">{description}</p>
                )}
              </div>
              {actions && (
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  )
}
```

---

## Phase 4: Feature Components (Days 11-14)

### Step 11: Create Dashboard Stats Card
Create `/src/components/dashboard/StatsCard.tsx`:
```typescript
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card variant="glow" className={cn('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {trend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="p-3 bg-brand-50 rounded-lg text-brand-600">
              {icon}
            </div>
          </div>
        )}
      </div>
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-100/20" />
    </Card>
  )
}
```

### Step 12: Create Message Card Component
Create `/src/components/messages/MessageCard.tsx`:
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface MessageCardProps {
  title: string
  preview: string
  status: 'draft' | 'pending' | 'approved' | 'published'
  audience: string
  scheduledFor?: Date
  onClick?: () => void
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  published: 'bg-blue-100 text-blue-700',
}

export function MessageCard({
  title,
  preview,
  status,
  audience,
  scheduledFor,
  onClick,
}: MessageCardProps) {
  return (
    <Card variant="interactive" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          <Badge className={cn('ml-2', statusColors[status])}>
            {status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {preview}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            <span>{audience}</span>
          </div>
          {scheduledFor && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(scheduledFor).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="ml-auto">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Step 13: Create Loading States
Create `/src/components/ui/LoadingStates.tsx`:
```typescript
import { cn } from '@/lib/utils'

export function Skeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-shimmer before:bg-gradient-to-r',
        'before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <Skeleton className="h-6 w-2/3 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg 
      className={cn('animate-spin h-5 w-5 text-brand-600', className)} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
      />
    </svg>
  )
}
```

---

## Phase 5: Polish & Final Touches (Days 15-16)

### Step 14: Create Toast Notifications
Create `/src/components/ui/Toast.tsx`:
```typescript
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

interface ToastProps {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
}

const colors = {
  success: 'bg-green-50 text-green-900 border-green-200',
  error: 'bg-red-50 text-red-900 border-red-200',
  info: 'bg-blue-50 text-blue-900 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
}

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
}

export function Toast({ 
  id, 
  title, 
  description, 
  type = 'info', 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const Icon = icons[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto',
        'border backdrop-blur-sm',
        colors[type]
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-6 w-6', iconColors[type])} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => onClose(id)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[], onClose: (id: string) => void }) {
  return (
    <div className="fixed z-50 bottom-0 right-0 p-6 space-y-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}
```

### Step 15: Create Empty States
Create `/src/components/ui/EmptyState.tsx`:
```typescript
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

### Step 16: Update Global Styles
Update `/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* Import logo styles */
@import '../styles/logo.css';

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  * {
    @apply border-border;
  }

  html {
    @apply antialiased;
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-white text-gray-900 min-h-screen;
    font-family: var(--font-sans);
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
    transition: background-color 0.2s;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400;
  }

  /* Focus styles */
  *:focus-visible {
    @apply outline-none ring-2 ring-brand-500 ring-offset-2 rounded;
  }
}

@layer components {
  /* Prose styles for content */
  .prose-brand {
    @apply prose prose-gray prose-headings:text-gray-900 prose-a:text-brand-600 prose-strong:text-gray-900;
  }

  /* Gradient text */
  .gradient-text {
    @apply bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent;
  }

  /* Glass morphism */
  .glass {
    @apply bg-white/70 backdrop-blur-xl;
  }

  /* Glow button */
  .btn-glow {
    @apply relative overflow-hidden;
  }

  .btn-glow::before {
    @apply absolute inset-0 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-400;
    content: '';
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
  }

  .btn-glow > * {
    @apply relative z-10;
  }
}

@layer utilities {
  /* Animation delay utilities */
  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .animation-delay-400 {
    animation-delay: 400ms;
  }

  .animation-delay-600 {
    animation-delay: 600ms;
  }

  /* Gradient backgrounds */
  .bg-gradient-radial {
    background-image: radial-gradient(var(--tw-gradient-stops));
  }

  .bg-gradient-conic {
    background-image: conic-gradient(var(--tw-gradient-stops));
  }
}
```

---

## Final Steps: Integration

### Step 17: Update Root Layout
Update `/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import AuthProvider from '@/components/providers/AuthProvider'
import ToastProvider from '@/components/providers/ToastProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Akashic Intelligence - Campaign Console',
  description: 'The Key to Comprehensive Political Understanding',
  icons: {
    icon: '/logo/akashic-logo-glow.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="pt-16">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Step 18: Create Example Dashboard Page
Update `/src/app/(dashboard)/dashboard/page.tsx`:
```typescript
'use client'

import { PageLayout } from '@/components/layout/PageLayout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { MessageCard } from '@/components/messages/MessageCard'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { 
  UsersIcon, 
  EnvelopeIcon, 
  ChartBarIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      description="Welcome back! Here's an overview of your campaign."
      actions={
        <Button variant="primary">
          Create New Message
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Reach"
          value="45,231"
          change={12}
          trend="up"
          icon={<UsersIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Messages Sent"
          value="892"
          change={8}
          trend="up"
          icon={<EnvelopeIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Engagement Rate"
          value="68%"
          change={-2}
          trend="down"
          icon={<ChartBarIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Approval Rate"
          value="94%"
          change={5}
          trend="up"
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MessageCard
              title="Healthcare Reform Update"
              preview="Our commitment to accessible healthcare remains strong..."
              status="published"
              audience="Urban Voters"
              scheduledFor={new Date('2024-01-15')}
            />
            <MessageCard
              title="Education Investment Plan"
              preview="Investing in our children's future with comprehensive..."
              status="approved"
              audience="Parents & Educators"
              scheduledFor={new Date('2024-01-18')}
            />
            <MessageCard
              title="Economic Recovery Strategy"
              preview="Building a stronger economy that works for everyone..."
              status="pending"
              audience="Business Community"
            />
            <MessageCard
              title="Environmental Protection Act"
              preview="Taking decisive action on climate change..."
              status="draft"
              audience="Young Voters"
            />
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
```

---

## Testing & Launch Checklist

### Functionality Testing
- [ ] All navigation links work correctly
- [ ] Mobile menu opens/closes properly
- [ ] Forms submit correctly
- [ ] Loading states appear when appropriate
- [ ] Error states display correctly
- [ ] Toast notifications appear and dismiss

### Visual Testing
- [ ] Logo displays correctly in all variants
- [ ] Glow effects work on hover
- [ ] Animations are smooth
- [ ] Dark mode works (if implemented)
- [ ] Responsive design works on all screen sizes

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images are optimized
- [ ] Fonts load correctly
- [ ] No console errors

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible

---

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Test the production build**:
   ```bash
   npm run start
   ```

3. **Deploy to Railway**:
   ```bash
   git add .
   git commit -m "Complete UI implementation"
   git push
   ```

Your beautiful, professional UI is now ready! 🎉