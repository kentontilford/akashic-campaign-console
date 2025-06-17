'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  DocumentDuplicateIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface TemplateCardProps {
  template: any
}

const platformIcons = {
  EMAIL: '✉️',
  FACEBOOK: '📘',
  TWITTER: '🐦',
  INSTAGRAM: '📷',
  PRESS_RELEASE: '📰',
  WEBSITE: '🌐',
  SMS: '💬'
}

const categoryIcons = {
  fundraising: '💰',
  announcement: '📢',
  'thank-you': '🙏',
  event: '📅',
  volunteer: '🤝',
  press: '📰',
  social: '📱'
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUseTemplate = () => {
    // Navigate to message creation with template
    router.push(`/messages/new?templateId=${template.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete template')
      }

      toast.success('Template deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete template')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" title={template.platform}>
            {platformIcons[template.platform as keyof typeof platformIcons]}
          </span>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{template.name}</h3>
            {template.campaign && (
              <p className="text-xs text-gray-500">{template.campaign.name}</p>
            )}
          </div>
        </div>
        <span className="text-xl" title={template.category}>
          {categoryIcons[template.category as keyof typeof categoryIcons] || '📄'}
        </span>
      </div>

      {template.description && (
        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-500 line-clamp-3">
          {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Created by {template.createdBy.name || template.createdBy.email}</span>
        {template.usageCount > 0 && (
          <span className="flex items-center gap-1">
            <ChartBarIcon className="h-3 w-3" />
            Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleUseTemplate}
          className="flex-1 btn-primary text-sm py-1.5"
        >
          <DocumentDuplicateIcon className="h-4 w-4 inline mr-1" />
          Use Template
        </button>
        
        {!template.isGlobal && (
          <>
            <Link
              href={`/templates/${template.id}/edit`}
              className="p-1.5 text-gray-600 hover:text-gray-800"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}