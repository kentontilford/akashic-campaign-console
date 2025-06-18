'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  showVersionSelector?: boolean
  className?: string
  containerClassName?: string
}

export default function PageLayout({ 
  children, 
  title,
  description,
  actions,
  showVersionSelector = false,
  className,
  containerClassName,
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <Navigation showVersionSelector={showVersionSelector} />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24', containerClassName)}
      >
        {(title || description || actions) && (
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-2 text-lg text-gray-600">{description}</p>
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
      </motion.main>
    </div>
  )
}