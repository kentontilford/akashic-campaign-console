# Akashic Intelligence Design Implementation Guide

## Table of Contents
1. [Brand Identity & Logo Design](#brand-identity--logo-design)
2. [Design System Setup](#design-system-setup)
3. [Color Palette & Theme](#color-palette--theme)
4. [Typography System](#typography-system)
5. [Component Architecture](#component-architecture)
6. [Animation & Interactions](#animation--interactions)
7. [Responsive Design](#responsive-design)
8. [Implementation Steps](#implementation-steps)

---

## 1. Brand Identity & Logo Design

### Creating the Blue Glow Logo

#### Method 1: Using Adobe Illustrator
1. **Open your black/white SVG**
   ```
   File → Open → Select your SVG file
   ```

2. **Create the glow effect**
   - Select the logo shape
   - Effect → Stylize → Outer Glow
   - Settings:
     - Mode: Screen
     - Color: #3B82F6 (Tailwind blue-500)
     - Opacity: 75%
     - Blur: 8px

3. **Export with glow**
   - File → Export → Export As
   - Format: SVG
   - Options: Preserve Appearance

#### Method 2: Using CSS (Recommended for Web)
```css
.logo-glow {
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))
          drop-shadow(0 0 40px rgba(59, 130, 246, 0.3))
          drop-shadow(0 0 60px rgba(59, 130, 246, 0.1));
  transition: filter 0.3s ease;
}

.logo-glow:hover {
  filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.7))
          drop-shadow(0 0 50px rgba(59, 130, 246, 0.5))
          drop-shadow(0 0 75px rgba(59, 130, 246, 0.3));
}
```

#### Method 3: Using Figma (Free)
1. Import SVG to Figma
2. Add Effects → Drop Shadow
   - Color: #3B82F6
   - X: 0, Y: 0
   - Blur: 20
   - Spread: 0
3. Duplicate and stack shadows for intensity
4. Export as SVG with effects

### Logo Implementation
Create these logo files:
```
public/
├── logo/
│   ├── akashic-logo-black.svg      # Original black
│   ├── akashic-logo-white.svg      # White version
│   ├── akashic-logo-glow.svg       # With blue glow
│   ├── akashic-icon.svg            # Icon only
│   └── akashic-wordmark.svg        # Text only
```

---

## 2. Design System Setup

### Install Design Dependencies
```bash
npm install @radix-ui/react-* framer-motion @headlessui/react
npm install -D @tailwindcss/forms @tailwindcss/typography
```

### Create Theme Configuration
```typescript
// src/lib/theme.ts
export const theme = {
  colors: {
    brand: {
      primary: '#3B82F6',    // Electric Blue
      secondary: '#1E40AF',  // Deep Blue
      accent: '#60A5FA',     // Light Blue
      dark: '#0F172A',       // Near Black
      light: '#F8FAFC',      // Off White
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    neutral: {
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
    }
  },
  shadows: {
    glow: {
      sm: '0 0 10px rgba(59, 130, 246, 0.3)',
      md: '0 0 20px rgba(59, 130, 246, 0.4)',
      lg: '0 0 30px rgba(59, 130, 246, 0.5)',
      xl: '0 0 40px rgba(59, 130, 246, 0.6)',
    }
  }
}
```

---

## 3. Color Palette & Theme

### Tailwind Configuration
```javascript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
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
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 30px rgba(59, 130, 246, 0.8)',
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    }
  }
}
```

---

## 4. Typography System

### Font Setup
```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* Typography Scale */
.text-display-1 {
  @apply text-5xl font-bold tracking-tight;
}

.text-display-2 {
  @apply text-4xl font-bold tracking-tight;
}

.text-heading-1 {
  @apply text-3xl font-semibold;
}

.text-heading-2 {
  @apply text-2xl font-semibold;
}

.text-heading-3 {
  @apply text-xl font-medium;
}

.text-body-large {
  @apply text-lg;
}

.text-body {
  @apply text-base;
}

.text-body-small {
  @apply text-sm;
}

.text-caption {
  @apply text-xs;
}
```

---

## 5. Component Architecture

### Base Button Component
```typescript
// src/components/ui/Button.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500 shadow-lg hover:shadow-xl hover:shadow-brand-500/25',
        secondary: 'bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-500',
        ghost: 'hover:bg-brand-50 hover:text-brand-600 focus-visible:ring-brand-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        glow: 'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
```

### Card Component with Glow
```typescript
// src/components/ui/Card.tsx
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  interactive?: boolean
}

export function Card({ className, glow, interactive, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-6 shadow-sm',
        glow && 'shadow-[0_0_15px_rgba(59,130,246,0.1)] border-brand-200',
        interactive && 'transition-all hover:shadow-lg hover:border-brand-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### Navigation Component
```typescript
// src/components/layout/Navigation.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/logo/akashic-logo-glow.svg"
              alt="Akashic"
              className="h-8 w-8 logo-glow"
            />
            <span className="text-xl font-semibold">Akashic Intelligence</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-brand-600'
                    : 'text-gray-600 hover:text-brand-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

---

## 6. Animation & Interactions

### Page Transitions
```typescript
// src/components/layout/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### Loading States
```typescript
// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

// Usage
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### Interactive Elements
```typescript
// src/components/ui/InteractiveCard.tsx
import { motion } from 'framer-motion'

export function InteractiveCard({ children, ...props }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl cursor-pointer"
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

---

## 7. Responsive Design

### Breakpoint System
```typescript
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from 'react'

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const current = Object.entries(breakpoints)
        .reverse()
        .find(([_, value]) => width >= value)?.[0] || 'xs'
      setBreakpoint(current)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}
```

### Mobile Navigation
```typescript
// src/components/layout/MobileNav.tsx
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function MobileNav({ open, onClose }) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Navigation content */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
```

---

## 8. Implementation Steps

### Phase 1: Foundation (Week 1)
1. **Setup Design System**
   ```bash
   # Install dependencies
   npm install clsx tailwind-merge class-variance-authority
   npm install @radix-ui/react-* framer-motion
   
   # Create utils
   mkdir -p src/lib
   touch src/lib/utils.ts
   ```

2. **Create Base Components**
   - Button variants
   - Card components
   - Typography system
   - Form elements

3. **Implement Theme**
   - Update tailwind.config.ts
   - Create CSS variables
   - Setup dark mode

### Phase 2: Core Components (Week 2)
1. **Navigation System**
   - Desktop nav
   - Mobile nav
   - Breadcrumbs
   - Side navigation

2. **Layout Components**
   - Page layouts
   - Grid systems
   - Container components
   - Section dividers

3. **Feedback Components**
   - Toast notifications
   - Modals/Dialogs
   - Loading states
   - Empty states

### Phase 3: Feature Components (Week 3)
1. **Dashboard Components**
   - Stats cards
   - Charts with glow effects
   - Activity feeds
   - Progress indicators

2. **Message Components**
   - Message editor
   - Version comparison
   - Preview cards
   - Status badges

3. **Campaign Components**
   - Campaign cards
   - Team member cards
   - Timeline views
   - Settings panels

### Phase 4: Polish & Animation (Week 4)
1. **Micro-interactions**
   - Hover effects
   - Click feedback
   - Loading transitions
   - Success animations

2. **Page Transitions**
   - Route transitions
   - Component animations
   - Scroll animations
   - Parallax effects

3. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Focus indicators
   - ARIA labels

### Phase 5: Testing & Optimization
1. **Performance**
   - Lazy loading
   - Image optimization
   - Code splitting
   - Bundle analysis

2. **Cross-browser Testing**
   - Chrome, Firefox, Safari
   - Mobile browsers
   - Progressive enhancement

3. **User Testing**
   - A/B testing setup
   - Analytics integration
   - Feedback collection

---

## Quick Start Commands

```bash
# 1. Install all design dependencies
npm install @radix-ui/react-alert-dialog @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast framer-motion class-variance-authority clsx tailwind-merge lucide-react

# 2. Setup component directories
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/features
mkdir -p src/styles
mkdir -p public/logo

# 3. Create component index
touch src/components/ui/index.ts
touch src/components/layout/index.ts

# 4. Generate color palette
npx tailwindcss init -p
```

## Design Resources

### Tools
- **Figma**: Main design tool (free)
- **Coolors.co**: Color palette generator
- **Heroicons**: Icon library
- **Lucide**: Alternative icons
- **Radix UI**: Headless components
- **Framer Motion**: Animations

### Inspiration
- **Dribbble**: Search "SaaS dashboard"
- **Behance**: "Political campaign design"
- **Awwwards**: Award-winning web designs
- **Collect UI**: Component examples

### Testing Tools
- **Lighthouse**: Performance testing
- **WAVE**: Accessibility testing
- **BrowserStack**: Cross-browser testing

---

This guide provides a complete roadmap from basic setup to a polished, professional UI. Start with Phase 1 and progress through each phase, testing and refining as you go.