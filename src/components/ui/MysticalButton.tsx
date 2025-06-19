import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { Slot } from '@radix-ui/react-slot'

interface MysticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'mystical'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  showGlow?: boolean
  asChild?: boolean
  children: React.ReactNode
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'bg-transparent border-2 border-transparent hover:border-black text-black hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]',
  mystical: 'ai-element'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-6 py-3 text-base min-h-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[52px]'
}

export function MysticalButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  showGlow = true,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: MysticalButtonProps) {
  const Comp = asChild ? Slot : 'button'
  
  return (
    <Comp
      className={cn(
        'relative inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        variants[variant],
        sizes[size],
        showGlow && variant === 'mystical' && 'mystical-border',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Comp>
  )
}

// Icon Button Variant
export function MysticalIconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  showGlow = true,
  className,
  ...props
}: {
  icon: React.ElementType
  variant?: 'primary' | 'secondary' | 'ghost' | 'mystical'
  size?: 'sm' | 'md' | 'lg'
  showGlow?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const paddingSizes = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3'
  }

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        variants[variant],
        paddingSizes[size],
        showGlow && 'hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
        className
      )}
      {...props}
    >
      <Icon size={iconSizes[size]} />
    </button>
  )
}