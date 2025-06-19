'use client'

import { useState, useEffect } from 'react'
import { VersionControlEngine, VersionProfile } from '@/lib/version-control'
import { SparklesIcon, ArrowsRightLeftIcon } from '@/lib/icons'
import toast from 'react-hot-toast'

interface VersionComparisonProps {
  messageId: string
  campaignId: string
  originalContent: string
  platform: string
}

export default function VersionComparison({ 
  messageId, 
  campaignId, 
  originalContent,
  platform 
}: VersionComparisonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [versions, setVersions] = useState<Record<string, string>>({})
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['union', 'chamber'])
  const [showComparison, setShowComparison] = useState(false)
  
  const profiles = VersionControlEngine.getDefaultProfiles()

  const generateVersion = async (profile: VersionProfile) => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/messages/generate-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          campaignId,
          content: originalContent,
          versionProfile: profile.id,
          platform
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate version')
      }

      const data = await response.json()
      setVersions(prev => ({
        ...prev,
        [profile.id]: data.content
      }))
      
      toast.success(`Generated ${profile.name} version`)
    } catch (error) {
      toast.error(`Failed to generate ${profile.name} version`)
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAllVersions = async () => {
    for (const profile of profiles) {
      if (selectedVersions.includes(profile.id)) {
        await generateVersion(profile)
      }
    }
    setShowComparison(true)
  }

  const highlightDifferences = (text1: string, text2: string) => {
    // Simple word-based diff highlighting
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)
    
    let result = ''
    const maxLength = Math.max(words1.length, words2.length)
    
    for (let i = 0; i < maxLength; i++) {
      if (words1[i] !== words2[i]) {
        if (words1[i]) {
          result += `<mark class="bg-yellow-200">${words1[i]}</mark> `
        }
      } else if (words1[i]) {
        result += words1[i] + ' '
      }
    }
    
    return result.trim()
  }

  return (
    <div className="space-y-6">
      {/* Version Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Version Comparisons</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {profiles.map((profile) => (
            <label
              key={profile.id}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-akashic-primary focus:ring-akashic-primary border-gray-300 rounded"
                checked={selectedVersions.includes(profile.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedVersions([...selectedVersions, profile.id])
                  } else {
                    setSelectedVersions(selectedVersions.filter(id => id !== profile.id))
                  }
                }}
              />
              <span className="ml-2 text-sm font-medium text-gray-900">{profile.name}</span>
            </label>
          ))}
        </div>

        <button
          onClick={generateAllVersions}
          disabled={isGenerating || selectedVersions.length < 2}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <SparklesIcon className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Versions'}
        </button>
      </div>

      {/* Version Display */}
      {showComparison && Object.keys(versions).length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
            <ArrowsRightLeftIcon className="h-5 w-5" />
            Version Comparison
          </div>

          {/* Original Version */}
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-2">Original Version</h4>
            <div 
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: originalContent }}
            />
          </div>

          {/* Generated Versions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedVersions.map((versionId) => {
              const profile = profiles.find(p => p.id === versionId)
              const content = versions[versionId]
              
              if (!profile || !content) return null

              return (
                <div key={versionId} className="card">
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900">{profile.name} Version</h4>
                    <p className="text-sm text-gray-500">{profile.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Tone:</span>
                        <span className="ml-2 font-medium">{profile.tone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Formality:</span>
                        <span className="ml-2 font-medium">{profile.messagingAdjustments.formality}/10</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Emotion:</span>
                        <span className="ml-2 font-medium">{profile.messagingAdjustments.emotion}/10</span>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none text-gray-600 border-t pt-4"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />

                  {/* Key Differences */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Key Adjustments:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      <li>Emphasizes: {profile.emphasis.slice(0, 3).join(', ')}</li>
                      <li>Language style: {profile.audienceTraits.language.slice(0, 2).join(', ')}</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(content.replace(/<[^>]*>/g, ''))
                          toast.success('Copied to clipboard')
                        } catch (error) {
                          toast.error('Failed to copy')
                        }
                      }}
                      className="text-sm text-akashic-primary hover:text-blue-700"
                    >
                      Copy to Clipboard
                    </button>
                    
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/messages/${messageId}/versions`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              versionProfile: versionId,
                              content
                            })
                          })
                          
                          if (!response.ok) throw new Error('Failed to save')
                          
                          toast.success(`Saved ${profile.name} version`)
                        } catch (error) {
                          toast.error('Failed to save version')
                        }
                      }}
                      className="text-sm text-akashic-accent hover:text-green-700"
                    >
                      Save Version
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}