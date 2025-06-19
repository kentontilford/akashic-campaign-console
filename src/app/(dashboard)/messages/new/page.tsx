'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import MessageEditor from '@/components/messaging/MessageEditor'
import AIAssistancePanel from '@/components/messaging/AIAssistancePanel'
import VersionSelector from '@/components/version-control/VersionSelector'
import { Platform } from '@prisma/client'
import { VersionControlEngine } from '@/lib/version-control'

const platforms = [
  { id: Platform.EMAIL, name: 'Email', icon: '✉️' },
  { id: Platform.FACEBOOK, name: 'Facebook', icon: '📘' },
  { id: Platform.TWITTER, name: 'Twitter', icon: '🐦' },
  { id: Platform.INSTAGRAM, name: 'Instagram', icon: '📷' },
  { id: Platform.PRESS_RELEASE, name: 'Press Release', icon: '📰' },
  { id: Platform.WEBSITE, name: 'Website', icon: '🌐' },
  { id: Platform.SMS, name: 'SMS', icon: '💬' }
]

function NewMessageForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedVersion, setSelectedVersion] = useState(VersionControlEngine.getDefaultProfiles()[0])
  const templateId = searchParams.get('templateId')
  
  const [formData, setFormData] = useState({
    campaignId: searchParams.get('campaignId') || '',
    title: '',
    content: '',
    platform: Platform.EMAIL as Platform,
    saveAsDraft: true
  })

  // Fetch user's campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch('/api/campaigns')
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data)
          
          // If no campaign selected but user has campaigns, select the first one
          if (!formData.campaignId && data.length > 0) {
            setFormData(prev => ({ ...prev, campaignId: data[0].campaign.id }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
      }
    }
    
    fetchCampaigns()
  }, [formData.campaignId])

  // Load template if templateId is provided
  useEffect(() => {
    if (!templateId) return

    async function loadTemplate() {
      try {
        const response = await fetch(`/api/templates/${templateId}`)
        if (response.ok) {
          const { template } = await response.json()
          setFormData(prev => ({
            ...prev,
            title: template.name,
            content: template.content,
            platform: template.platform,
            campaignId: template.campaignId || prev.campaignId
          }))
          
          // Update template usage count
          await fetch(`/api/templates/${templateId}/use`, { method: 'POST' })
          
          toast.success('Template loaded successfully')
        }
      } catch (error) {
        console.error('Failed to load template:', error)
        toast.error('Failed to load template')
      }
    }

    loadTemplate()
  }, [templateId])

  const handleSave = async (asDraft: boolean) => {
    if (!formData.campaignId) {
      toast.error('Please select a campaign')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a message title')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Please enter message content')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: asDraft ? 'DRAFT' : 'PENDING_APPROVAL',
          versionProfileId: selectedVersion.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create message')
      }

      const message = await response.json()
      toast.success(asDraft ? 'Message saved as draft!' : 'Message submitted for approval!')
      router.push(`/messages/${message.id}`)
    } catch (error) {
      toast.error('Failed to save message')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIGenerate = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Message</h1>
        <p className="mt-2 text-sm text-gray-600">
          Craft your message with AI assistance and version control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="space-y-6">
              {/* Campaign Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign
                </label>
                <select
                  className="input"
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                  disabled={isLoading}
                >
                  <option value="">Select a campaign</option>
                  {campaigns.map(({ campaign }) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: platform.id })}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.platform === platform.id
                          ? 'border-akashic-primary bg-akashic-primary/10 text-akashic-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={isLoading}
                    >
                      <span className="text-2xl block mb-1">{platform.icon}</span>
                      <span className="text-sm">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Version Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <div className="flex items-center gap-4">
                  <VersionSelector 
                    value={selectedVersion}
                    onChange={setSelectedVersion}
                  />
                  <p className="text-sm text-gray-500">
                    AI will adapt content for {selectedVersion.name} audience
                  </p>
                </div>
              </div>

              {/* Message Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Title
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    formData.platform === Platform.EMAIL ? 'Email Subject Line' :
                    formData.platform === Platform.PRESS_RELEASE ? 'Press Release Headline' :
                    'Message Title'
                  }
                  disabled={isLoading}
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <MessageEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder={
                    formData.platform === Platform.TWITTER ? 'What\'s happening? (280 characters)' :
                    formData.platform === Platform.SMS ? 'Enter your text message (160 characters)' :
                    'Start writing your message...'
                  }
                />
                {(formData.platform === Platform.TWITTER || formData.platform === Platform.SMS) && (
                  <p className="mt-2 text-sm text-gray-500">
                    Character count: {formData.content.replace(/<[^>]*>/g, '').length}
                    {formData.platform === Platform.TWITTER ? '/280' : '/160'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="btn-secondary"
                    disabled={isLoading}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    Submit for Approval
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistance Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <AIAssistancePanel
              campaignId={formData.campaignId}
              versionProfile={selectedVersion.id}
              platform={formData.platform}
              onGenerate={handleAIGenerate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewMessagePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading message editor...</p>
        </div>
      </div>
    }>
      <NewMessageForm />
    </Suspense>
  )
}