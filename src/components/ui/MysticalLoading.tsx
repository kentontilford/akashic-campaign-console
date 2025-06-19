import React from 'react'
import { cn } from '@/lib/utils'
import { AkashicStar } from './Logo'

interface MysticalLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'spinner' | 'pulse' | 'oracle'
  className?: string
}

export function MysticalLoading({
  size = 'md',
  text,
  variant = 'oracle',
  className
}: MysticalLoadingProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className={cn('animate-spin rounded-full border-4 border-gray-200 border-t-black', sizes[size])} />
        {text && (
          <p className={cn('text-gray-600 italic', textSizes[size])}>{text}</p>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className="relative">
          <div className={cn('absolute inset-0 animate-ping rounded-full bg-blue-500/20', sizes[size])} />
          <div className={cn('relative rounded-full bg-black', sizes[size])} />
        </div>
        {text && (
          <p className={cn('text-gray-600 italic', textSizes[size])}>{text}</p>
        )}
      </div>
    )
  }

  // Oracle variant (default)
  return (
    <div className={cn('akashic-loader flex-col gap-4', className)}>
      <AkashicStar 
        size={size === 'sm' ? 32 : size === 'md' ? 48 : 64} 
        showGlow 
        className="animate-pulse"
      />
      {text && (
        <p className={cn('text-black italic', textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  )
}

// Page Loading Overlay
export function MysticalPageLoader({ 
  isLoading,
  text = "Accessing the Akashic Records..."
}: { 
  isLoading: boolean
  text?: string
}) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <MysticalLoading size="lg" text={text} variant="oracle" />
    </div>
  )
}

// Skeleton Loading Components
export function MysticalSkeleton({ 
  className,
  variant = 'text'
}: { 
  className?: string
  variant?: 'text' | 'title' | 'card' | 'avatar'
}) {
  const variants = {
    text: 'h-4 bg-gray-200 rounded animate-pulse',
    title: 'h-8 bg-gray-200 rounded animate-pulse',
    card: 'h-32 bg-gray-200 rounded-lg animate-pulse',
    avatar: 'h-12 w-12 bg-gray-200 rounded-full animate-pulse'
  }

  return <div className={cn(variants[variant], className)} />
}

// Progress Bar
export function MysticalProgress({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  className
}: {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-black">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full bg-black transition-all duration-500 ease-out relative overflow-hidden',
            'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-blue-500/30 after:to-transparent',
            'after:animate-shimmer'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}