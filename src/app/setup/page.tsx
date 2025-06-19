'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MysticalButton, MysticalCard, MysticalInput } from '@/components/ui'

export default function SetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    setupKey: '',
    email: 'admin@akashic.com',
    password: 'Admin123!'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Admin user created successfully!')
        router.push('/login')
      } else {
        const errorMessage = data.message ? `${data.error}: ${data.message}` : data.error || 'Setup failed'
        toast.error(errorMessage)
        console.error('Setup error:', data)
      }
    } catch (error) {
      toast.error('An error occurred during setup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <MysticalCard className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Initial Setup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <MysticalInput
            label="Setup Key"
            type="password"
            value={formData.setupKey}
            onChange={(e) => setFormData({ ...formData, setupKey: e.target.value })}
            placeholder="Enter setup key"
            required
          />
          
          <MysticalInput
            label="Admin Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <MysticalInput
            label="Admin Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <MysticalButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Admin User...' : 'Complete Setup'}
          </MysticalButton>
        </form>
        
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Default setup key: akashic-setup-2024</p>
          <p>Or set SETUP_KEY environment variable</p>
        </div>
      </MysticalCard>
    </div>
  )
}