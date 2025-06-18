import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'white' | 'black' | 'glow' | 'color'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  glow?: 'none' | 'subtle' | 'default' | 'intense' | 'pulse'
  className?: string
  showText?: boolean
  textClassName?: string
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
}

const glowClasses = {
  none: '',
  subtle: 'logo-glow-subtle',
  default: 'logo-glow',
  intense: 'logo-glow-intense',
  pulse: 'logo-glow-pulse',
}

export function Logo({
  variant = 'glow',
  size = 'md',
  glow = 'default',
  className,
  showText = false,
  textClassName,
}: LogoProps) {
  const logoSrc = `/logo/akashic-logo-${variant}.svg`
  const dimensions = sizeMap[size]

  return (
    <div className={cn('logo-container flex items-center gap-3', className)}>
      <div className={cn('relative', glow !== 'none' && glowClasses[glow])}>
        <Image
          src={logoSrc}
          alt="Akashic Intelligence"
          width={dimensions}
          height={dimensions}
          priority
          className="relative z-10"
        />
        {glow === 'intense' && (
          <div className="absolute inset-0 logo-bg-glow" />
        )}
      </div>
      {showText && (
        <span
          className={cn(
            'font-semibold text-gray-900 dark:text-white',
            size === 'xs' && 'text-sm',
            size === 'sm' && 'text-base',
            size === 'md' && 'text-lg',
            size === 'lg' && 'text-2xl',
            size === 'xl' && 'text-4xl',
            textClassName
          )}
        >
          Akashic Intelligence
        </span>
      )}
    </div>
  )
}

// Example usage component
export function LogoShowcase() {
  return (
    <div className="space-y-8 p-8 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Logo Variations</h2>
      </div>
      
      {/* Size variations */}
      <div className="flex items-center justify-center gap-8 flex-wrap">
        <Logo size="xs" />
        <Logo size="sm" />
        <Logo size="md" />
        <Logo size="lg" />
        <Logo size="xl" />
      </div>

      {/* Glow variations */}
      <div className="flex items-center justify-center gap-8 flex-wrap bg-gray-900 p-8 rounded-lg">
        <Logo glow="none" />
        <Logo glow="subtle" />
        <Logo glow="default" />
        <Logo glow="intense" />
        <Logo glow="pulse" />
      </div>

      {/* With text */}
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" showText />
        <Logo size="md" showText glow="pulse" />
        <Logo size="sm" showText variant="white" className="bg-gray-900 p-4 rounded" />
      </div>
    </div>
  )
}