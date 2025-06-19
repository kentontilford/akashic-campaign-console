'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { RocketLaunchIcon, XMarkIcon } from '@/lib/icons'
import toast from 'react-hot-toast'
import { Platform } from '@prisma/client'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  platform: Platform
  onPublished: () => void
}

const platformConfigs = {
  EMAIL: {
    icon: '✉️',
    name: 'Email',
    fields: [
      { name: 'recipientList', label: 'Recipient List', type: 'select', required: true },
      { name: 'fromName', label: 'From Name', type: 'text', required: true },
      { name: 'replyTo', label: 'Reply-To Email', type: 'email', required: false }
    ]
  },
  FACEBOOK: {
    icon: '📘',
    name: 'Facebook',
    fields: [
      { name: 'pageId', label: 'Facebook Page', type: 'select', required: true },
      { name: 'targeting', label: 'Audience Targeting', type: 'select', required: false }
    ]
  },
  TWITTER: {
    icon: '🐦',
    name: 'Twitter',
    fields: [
      { name: 'accountId', label: 'Twitter Account', type: 'select', required: true },
      { name: 'thread', label: 'Create Thread', type: 'checkbox', required: false }
    ]
  },
  INSTAGRAM: {
    icon: '📷',
    name: 'Instagram',
    fields: [
      { name: 'accountId', label: 'Instagram Account', type: 'select', required: true },
      { name: 'imageUrl', label: 'Image URL', type: 'url', required: true }
    ]
  },
  PRESS_RELEASE: {
    icon: '📰',
    name: 'Press Release',
    fields: [
      { name: 'distributionList', label: 'Media List', type: 'select', required: true },
      { name: 'embargo', label: 'Embargo Until', type: 'datetime-local', required: false }
    ]
  },
  WEBSITE: {
    icon: '🌐',
    name: 'Website',
    fields: [
      { name: 'section', label: 'Website Section', type: 'select', required: true },
      { name: 'featured', label: 'Feature on Homepage', type: 'checkbox', required: false }
    ]
  },
  SMS: {
    icon: '💬',
    name: 'SMS',
    fields: [
      { name: 'recipientList', label: 'Phone List', type: 'select', required: true },
      { name: 'shortCode', label: 'Short Code', type: 'text', required: true }
    ]
  }
}

export default function PublishModal({ 
  isOpen, 
  onClose, 
  messageId, 
  platform,
  onPublished 
}: PublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  
  const config = platformConfigs[platform]

  const handlePublish = async () => {
    // Validate required fields
    const missingFields = config.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label)
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`)
      return
    }

    setIsPublishing(true)

    try {
      const response = await fetch(`/api/messages/${messageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          settings: formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to publish message')
      }

      toast.success('Message published successfully!')
      onPublished()
      onClose()
    } catch (error) {
      toast.error('Failed to publish message')
      console.error(error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-akashic-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="text-2xl">{config.icon}</span>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Publish to {config.name}
                    </Dialog.Title>
                    
                    <div className="mt-4 space-y-4">
                      {config.fields.map(field => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          
                          {field.type === 'select' ? (
                            <select
                              className="mt-1 input"
                              value={formData[field.name] || ''}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              disabled={isPublishing}
                            >
                              <option value="">Select {field.label}</option>
                              <option value="default">Default {field.label}</option>
                              <option value="custom">Custom {field.label}</option>
                            </select>
                          ) : field.type === 'checkbox' ? (
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-akashic-primary focus:ring-akashic-primary border-gray-300 rounded"
                              checked={formData[field.name] || false}
                              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                              disabled={isPublishing}
                            />
                          ) : (
                            <input
                              type={field.type}
                              className="mt-1 input"
                              value={formData[field.name] || ''}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              disabled={isPublishing}
                            />
                          )}
                        </div>
                      ))}
                      
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Once published, this message will be immediately sent to the selected {config.name} audience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-akashic-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto disabled:opacity-50"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    <RocketLaunchIcon className="h-4 w-4 mr-1" />
                    {isPublishing ? 'Publishing...' : 'Publish Now'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    disabled={isPublishing}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}