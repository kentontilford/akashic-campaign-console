'use client'

import { useState } from 'react'
import { SparklesIcon } from '@/lib/icons'
import toast from 'react-hot-toast'

interface AIAssistancePanelProps {
  campaignId: string
  versionProfile: string
  platform: string
  onGenerate: (content: string) => void
}

export default function AIAssistancePanel({
  campaignId,
  versionProfile,
  platform,
  onGenerate
}: AIAssistancePanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions] = useState([
    'Thank supporters for recent donations',
    'Announce upcoming town hall meeting',
    'Share position on healthcare reform',
    'Invite volunteers for phone banking',
    'Update on campaign progress'
  ])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/messages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          campaignId,
          versionProfile,
          platform
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate content')
      }

      const data = await response.json()
      onGenerate(data.content)
      toast.success('Content generated successfully!')
      setPrompt('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content')
      console.error('AI Generation Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="h-5 w-5 text-akashic-primary" />
        <h3 className="font-medium text-gray-900">AI Assistant</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to write about?
          </label>
          <textarea
            className="input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Write a message thanking supporters for their contributions..."
            disabled={isGenerating}
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick suggestions:</p>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="w-full text-left text-sm p-2 rounded hover:bg-gray-100 transition-colors"
                disabled={isGenerating}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}