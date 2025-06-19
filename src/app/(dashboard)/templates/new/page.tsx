'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@/lib/icons'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import toast from 'react-hot-toast'

const platforms = [
  { id: 'EMAIL', name: 'Email', icon: '✉️' },
  { id: 'FACEBOOK', name: 'Facebook', icon: '📘' },
  { id: 'TWITTER', name: 'Twitter', icon: '🐦' },
  { id: 'INSTAGRAM', name: 'Instagram', icon: '📷' },
  { id: 'PRESS_RELEASE', name: 'Press Release', icon: '📰' },
  { id: 'WEBSITE', name: 'Website', icon: '🌐' },
  { id: 'SMS', name: 'SMS', icon: '💬' }
]

const categories = [
  { id: 'fundraising', name: 'Fundraising', icon: '💰' },
  { id: 'announcement', name: 'Announcement', icon: '📢' },
  { id: 'thank-you', name: 'Thank You', icon: '🙏' },
  { id: 'event', name: 'Event', icon: '📅' },
  { id: 'volunteer', name: 'Volunteer', icon: '🤝' },
  { id: 'press', name: 'Press', icon: '📰' },
  { id: 'social', name: 'Social Media', icon: '📱' }
]

export default function NewTemplatePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: 'EMAIL',
    category: 'announcement',
    content: '',
    isGlobal: false,
    campaignId: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create template')
      }

      const { template } = await response.json()
      toast.success('Template created successfully')
      router.push('/templates')
    } catch (error) {
      toast.error('Failed to create template')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/templates"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Template</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a reusable message template
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-6">
          {/* Template Name */}
          <div>
            <label htmlFor="name" className="label">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Monthly Fundraising Email"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={2}
              placeholder="Brief description of when to use this template"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="label">
              Platform <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: platform.id })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    formData.platform === platform.id
                      ? 'border-akashic-primary bg-akashic-primary/10 text-akashic-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span>{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.id })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    formData.category === category.id
                      ? 'border-akashic-primary bg-akashic-primary/10 text-akashic-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Type */}
          {session?.user?.role === 'ADMIN' && (
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isGlobal}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                  className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this a global template (available to all campaigns)
                </span>
              </label>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="label">
              Template Content <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TiptapEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Enter your template content..."
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Tip: Use placeholders like {'{{candidateName}}'} or {'{{eventDate}}'} that can be replaced when using the template
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/templates"
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  )
}