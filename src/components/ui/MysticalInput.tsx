import React from 'react'
import { cn } from '@/lib/utils'

interface MysticalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ElementType
  showGlow?: boolean
}

export const MysticalInput = React.forwardRef<HTMLInputElement, MysticalInputProps>(
  ({ label, error, hint, icon: Icon, showGlow = true, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-black mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'form-input',
              Icon && 'pl-10',
              error && 'border-red-500 focus:border-red-500',
              showGlow && 'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-600">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

MysticalInput.displayName = 'MysticalInput'

// Select Component
interface MysticalSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  showGlow?: boolean
}

export const MysticalSelect = React.forwardRef<HTMLSelectElement, MysticalSelectProps>(
  ({ label, error, hint, options, showGlow = true, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-black mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'form-input',
            'cursor-pointer',
            error && 'border-red-500 focus:border-red-500',
            showGlow && 'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-600">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

MysticalSelect.displayName = 'MysticalSelect'

// Textarea Component
interface MysticalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showGlow?: boolean
}

export const MysticalTextarea = React.forwardRef<HTMLTextAreaElement, MysticalTextareaProps>(
  ({ label, error, hint, showGlow = true, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-black mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'form-input',
            'min-h-[100px] resize-y',
            error && 'border-red-500 focus:border-red-500',
            showGlow && 'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-600">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

MysticalTextarea.displayName = 'MysticalTextarea'

// Search Input with mystical styling
export function MysticalSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
  onSearch
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onSearch?: () => void
}) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input pl-10 pr-4"
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}