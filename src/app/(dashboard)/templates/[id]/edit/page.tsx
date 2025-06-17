'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import toast from 'react-hot-toast'

const categories = [
  { id: 'fundraising', name: 'Fundraising', icon: '💰' },
  { id: 'announcement', name: 'Announcement', icon: '📢' },
  { id: 'thank-you', name: 'Thank You', icon: '🙏' },
  { id: 'event', name: 'Event', icon: '📅' },
  { id: 'volunteer', name: 'Volunteer', icon: '🤝' },
  { id: 'press', name: 'Press', icon: '📰' },
  { id: 'social', name: 'Social Media', icon: '📱' }
]

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [template, setTemplate] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    content: ''
  })

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/templates/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to load template')
        }

        const { template } = await response.json()
        setTemplate(template)
        setFormData({
          name: template.name || '',
          description: template.description || '',
          category: template.category || '',
          content: template.content || ''
        })
      } catch (error) {
        toast.error('Failed to load template')
        console.error(error)
        router.push('/templates')
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplate()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/templates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update template')
      }

      toast.success('Template updated successfully')
      router.push('/templates')
    } catch (error) {
      toast.error('Failed to update template')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">Loading template...</div>
      </div>
    )
  }

  if (!template) {
    return null
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your message template
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
            />
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

          {/* Platform (read-only) */}
          <div>
            <label className="label">Platform</label>
            <div className="text-sm text-gray-600 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">{template.platform === 'EMAIL' ? '✉️' : 
                template.platform === 'FACEBOOK' ? '📘' :
                template.platform === 'TWITTER' ? '🐦' :
                template.platform === 'INSTAGRAM' ? '📷' :
                template.platform === 'PRESS_RELEASE' ? '📰' :
                template.platform === 'WEBSITE' ? '🌐' : '💬'
              }</span>
              <span>{template.platform}</span>
              <span className="text-xs text-gray-500">(cannot be changed)</span>
            </div>
          </div>

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
            {isSubmitting ? 'Updating...' : 'Update Template'}
          </button>
        </div>
      </form>
    </div>
  )
}