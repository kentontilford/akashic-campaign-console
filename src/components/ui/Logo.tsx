import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'icon' | 'horizontal' | 'vertical' | 'full'
  theme?: 'black' | 'white'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showGlow?: boolean
}

const sizeMap = {
  xs: { icon: 32, full: 120 },
  sm: { icon: 40, full: 160 },
  md: { icon: 48, full: 200 },
  lg: { icon: 64, full: 280 },
  xl: { icon: 80, full: 360 },
}

export function Logo({
  variant = 'icon',
  theme = 'black',
  size = 'md',
  className,
  showGlow = false,
}: LogoProps) {
  // Determine which SVG to use
  let logoSrc = ''
  if (variant === 'icon' || variant === 'vertical') {
    logoSrc = `/logos/akashic-logo-${theme}.svg`
  } else if (variant === 'horizontal') {
    logoSrc = `/logos/akashic-logo-${theme}-alt.svg`
  } else if (variant === 'full') {
    logoSrc = '/logos/akashic-logo-full.svg'
  }

  // Calculate dimensions
  const isFullWidth = variant === 'horizontal' || variant === 'full'
  const width = isFullWidth ? sizeMap[size].full : sizeMap[size].icon
  const height = variant === 'full' ? width * 0.667 : sizeMap[size].icon

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center',
        showGlow && 'mystical-glow',
        className
      )}
    >
      <Image
        src={logoSrc}
        alt="Akashic Intelligence"
        width={width}
        height={height}
        priority
        className={cn(
          'relative z-10',
          showGlow && 'drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]'
        )}
      />
      {showGlow && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
        </div>
      )}
    </div>
  )
}

// Akashic Star Icon Component (for small uses)
export function AkashicStar({ 
  size = 24, 
  className,
  showGlow = false 
}: { 
  size?: number
  className?: string
  showGlow?: boolean 
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn(
        'inline-block',
        showGlow && 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]',
        className
      )}
    >
      {/* Simplified star/key shape from the logo */}
      <path
        d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Loading Animation Component
export function AkashicLoader({ 
  text = "Consulting the Akashic Records...",
  className 
}: { 
  text?: string
  className?: string 
}) {
  const loadingTexts = [
    "Consulting the Akashic Records...",
    "Analyzing historical patterns...",
    "Channeling political insights...",
    "Unveiling hidden connections...",
    "Accessing ancient wisdom...",
    "Decoding electoral mysteries..."
  ]

  const [currentText, setCurrentText] = React.useState(text)
  const [textIndex, setTextIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length)
      setCurrentText(loadingTexts[textIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [textIndex])

  return (
    <div className={cn('akashic-loader', className)}>
      <AkashicStar size={32} showGlow className="mr-3 animate-pulse" />
      <span className="text-sm italic">{currentText}</span>
    </div>
  )
}