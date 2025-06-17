'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  CheckIcon, 
  XMarkIcon, 
  ChatBubbleLeftIcon,
  EyeIcon 
} from '@heroicons/react/24/outline'

interface ApprovalCardProps {
  message: any
  currentUserId: string
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

export default function ApprovalCard({ message, currentUserId }: ApprovalCardProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState('')

  const handleApproval = async (status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    if (status !== 'APPROVED' && !comments.trim()) {
      toast.error('Please provide comments for rejection or change requests')
      setShowComments(true)
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/messages/${message.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          comments: comments.trim() || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process approval')
      }

      toast.success(
        status === 'APPROVED' ? 'Message approved!' :
        status === 'REJECTED' ? 'Message rejected' :
        'Changes requested'
      )
      
      router.refresh()
    } catch (error) {
      toast.error('Failed to process approval')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const tierConfig = {
    RED: 'border-l-4 border-red-400',
    YELLOW: 'border-l-4 border-yellow-400',
    GREEN: 'border-l-4 border-green-400'
  }

  return (
    <div className={`card ${tierConfig[message.approvalTier as keyof typeof tierConfig]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl" title={message.platform}>
              {platformIcons[message.platform as keyof typeof platformIcons]}
            </span>
            <div>
              <h3 className="font-medium text-gray-900">{message.title}</h3>
              <p className="text-sm text-gray-500">
                {message.campaign.name} • {message.author.name || message.author.email}
              </p>
            </div>
          </div>
        </div>
        
        <Link
          href={`/messages/${message.id}`}
          className="text-gray-400 hover:text-gray-600"
          title="View full message"
        >
          <EyeIcon className="h-5 w-5" />
        </Link>
      </div>

      {/* Message Preview */}
      <div className="mb-4">
        <div 
          className="text-sm text-gray-600 line-clamp-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: message.content.substring(0, 300) + '...' 
          }}
        />
      </div>

      {/* Risk Analysis */}
      {message.approvalAnalysis?.riskFactors?.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Risk Factors:</p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {message.approvalAnalysis.riskFactors.map((factor: string, index: number) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Previous Approvals */}
      {message.approvals.length > 0 && (
        <div className="mb-4 text-sm text-gray-500">
          <p>Previous reviews:</p>
          {message.approvals.slice(0, 2).map((approval: any) => (
            <p key={approval.id} className="ml-4">
              • {approval.status} by {approval.approvedBy.name || approval.approvedBy.email}
              {approval.comments && `: "${approval.comments}"`}
            </p>
          ))}
        </div>
      )}

      {/* Comments Field */}
      {showComments && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments {!showComments && '(optional for approval)'}
          </label>
          <textarea
            className="input text-sm"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide feedback or reason for decision..."
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-gray-500 hover:text-gray-700"
          disabled={isProcessing}
        >
          <ChatBubbleLeftIcon className="h-4 w-4 inline mr-1" />
          Add comments
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApproval('CHANGES_REQUESTED')}
            className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 disabled:opacity-50"
            disabled={isProcessing}
          >
            Request Changes
          </button>
          
          <button
            onClick={() => handleApproval('REJECTED')}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 inline-flex items-center gap-1"
            disabled={isProcessing}
          >
            <XMarkIcon className="h-4 w-4" />
            Reject
          </button>
          
          <button
            onClick={() => handleApproval('APPROVED')}
            className="px-4 py-2 text-sm font-medium text-white bg-akashic-accent rounded-lg hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-1"
            disabled={isProcessing}
          >
            <CheckIcon className="h-4 w-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}