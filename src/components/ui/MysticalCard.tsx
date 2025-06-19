import React from 'react'
import { cn } from '@/lib/utils'

interface MysticalCardProps {
  variant?: 'default' | 'stat' | 'ai' | 'mystical'
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function MysticalCard({
  variant = 'default',
  children,
  className,
  onClick,
  hoverable = true
}: MysticalCardProps) {
  const variants = {
    default: 'card',
    stat: 'stat-card',
    ai: 'ai-element',
    mystical: 'mystical-border'
  }

  return (
    <div
      className={cn(
        variants[variant],
        hoverable && 'cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Stat Card Component
export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  className
}: {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ElementType
  className?: string
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  }

  return (
    <MysticalCard variant="stat" className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-black">{value}</p>
          {change && trend && (
            <p className={cn('mt-2 text-sm', trendColors[trend])}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>
      <div className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl" />
    </MysticalCard>
  )
}

// AI Element Card
export function AICard({
  title,
  description,
  confidence,
  children,
  className
}: {
  title: string
  description?: string
  confidence?: number
  children?: React.ReactNode
  className?: string
}) {
  return (
    <MysticalCard variant="ai" className={className}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-black flex items-center gap-2">
            {title}
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              AI
            </span>
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {confidence && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Confidence</p>
            <p className="text-lg font-bold text-black">{confidence}%</p>
          </div>
        )}
      </div>
      {children}
    </MysticalCard>
  )
}

// Mystical Info Card
export function MysticalInfoCard({
  icon: Icon,
  title,
  content,
  action,
  className
}: {
  icon?: React.ElementType
  title: string
  content: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}) {
  return (
    <MysticalCard variant="mystical" className={className}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex-shrink-0 p-3 bg-black text-white rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-black">{title}</h4>
          <p className="mt-1 text-sm text-gray-600">{content}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-black hover:text-blue-600 transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </MysticalCard>
  )
}