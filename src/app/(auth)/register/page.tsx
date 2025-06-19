'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Logo } from '@/components/ui/Logo'
import { MysticalInput, MysticalButton } from '@/components/ui'
import { User, Mail, Lock, KeyRound } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return false
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email')
      return false
    }
    
    if (!formData.password) {
      toast.error('Please enter a password')
      return false
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Your oracle account has been created!')
      
      // Automatically sign in the user
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (signInResult?.error) {
        // If auto sign-in fails, redirect to login
        router.push('/login')
      } else {
        // Redirect to onboarding for new users
        router.push('/onboarding')
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Mystical background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8 p-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Logo variant="icon" theme="black" size="lg" showGlow />
          </div>
          <h2 className="text-3xl font-bold text-black">
            Join the Oracle
          </h2>
          <p className="mt-2 text-gray-600">
            Gain access to mystical political intelligence
          </p>
        </div>
        
        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <MysticalInput
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              label="Full Name"
              placeholder="John Doe"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <MysticalInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Email Address"
              placeholder="john@example.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <MysticalInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              label="Password"
              placeholder="Minimum 8 characters"
              icon={Lock}
              hint="Must be at least 8 characters long"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            
            <MysticalInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              label="Confirm Password"
              placeholder="Re-enter your password"
              icon={KeyRound}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : undefined}
            />
          </div>

          <MysticalButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {isLoading ? 'Creating your oracle account...' : 'Create Account'}
          </MysticalButton>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
            </span>
            <Link 
              href="/login" 
              className="text-sm font-medium text-black hover:text-blue-600 transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 px-8">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="font-medium text-black hover:text-blue-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-black hover:text-blue-600">
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}