'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Logo, AkashicLoader } from '@/components/ui/Logo'
import { MysticalInput, MysticalButton } from '@/components/ui'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          toast.error('Invalid email or password')
        } else {
          toast.error('Invalid email or password')
        }
      } else {
        toast.success('The oracle grants you access...')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error: any) {
      if (error?.response?.status === 429) {
        toast.error('Too many login attempts. Please try again in 15 minutes.')
      } else {
        toast.error('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Mystical background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8 p-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Logo variant="icon" theme="black" size="lg" showGlow />
          </div>
          <h2 className="text-3xl font-bold text-black">
            Enter the Oracle
          </h2>
          <p className="mt-2 text-gray-600">
            Access the Akashic Records of political intelligence
          </p>
        </div>
        
        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <MysticalInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Email address"
              placeholder="your@email.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <MysticalInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              label="Password"
              placeholder="Enter your password"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>

            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-black hover:text-blue-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <MysticalButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {isLoading ? 'Consulting the oracle...' : 'Sign in'}
          </MysticalButton>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              New to Akashic Intelligence?{' '}
            </span>
            <Link 
              href="/register" 
              className="text-sm font-medium text-black hover:text-blue-600 transition-colors"
            >
              Create an account
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Demo access</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Try with demo credentials:</p>
            <p className="text-sm font-mono text-black">admin@akashic.com</p>
            <p className="text-sm font-mono text-black">admin123</p>
          </div>
        </form>

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
            <AkashicLoader text="Accessing the Akashic Records..." />
          </div>
        )}
      </div>
    </div>
  )
}