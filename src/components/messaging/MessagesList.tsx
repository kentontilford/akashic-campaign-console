'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  TrashIcon, 
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@/lib/icons'

interface Message {
  id: string
  title: string
  content?: string | null
  platform: string
  status: string
  approvalTier?: string | null
  scheduledFor?: Date | null
  createdAt: Date
  campaign: {
    id: string
    name: string
  }
  author: {
    id: string
    name?: string | null
    email: string
  }
  _count: {
    versions: number
    approvals: number
  }
}

interface MessagesListProps {
  messages: Message[]
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500'
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

export default function MessagesList({ messages: initialMessages }: MessagesListProps) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(messages.map(m => m.id))
    }
  }

  const handleBulkAction = async (action: 'archive' | 'delete' | 'approve' | 'reject') => {
    if (selectedIds.length === 0) {
      toast.error('Please select messages to perform this action')
      return
    }

    const confirmMessage = {
      archive: `Archive ${selectedIds.length} message(s)?`,
      delete: `Delete ${selectedIds.length} message(s)? This cannot be undone.`,
      approve: `Approve ${selectedIds.length} message(s)?`,
      reject: `Reject ${selectedIds.length} message(s)?`
    }

    if (!confirm(confirmMessage[action])) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/messages/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageIds: selectedIds,
          action
        })
      })

      if (!response.ok) {
        throw new Error('Failed to perform bulk action')
      }

      const result = await response.json()
      
      // Update local state
      if (action === 'delete') {
        setMessages(prev => prev.filter(m => !selectedIds.includes(m.id)))
      } else if (action === 'archive') {
        setMessages(prev => prev.map(m => 
          selectedIds.includes(m.id) 
            ? { ...m, status: 'ARCHIVED' }
            : m
        ))
      } else if (action === 'approve') {
        setMessages(prev => prev.map(m => 
          selectedIds.includes(m.id) && m.status === 'PENDING_APPROVAL'
            ? { ...m, status: 'APPROVED' }
            : m
        ))
      } else if (action === 'reject') {
        setMessages(prev => prev.map(m => 
          selectedIds.includes(m.id) && m.status === 'PENDING_APPROVAL'
            ? { ...m, status: 'REJECTED' }
            : m
        ))
      }

      setSelectedIds([])
      toast.success(`${result.count} message(s) ${action}d successfully`)
    } catch (error) {
      toast.error(`Failed to ${action} messages`)
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {messages.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedIds.length === messages.length && messages.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
              />
              <span className="text-sm text-gray-700">
                {selectedIds.length > 0 
                  ? `${selectedIds.length} selected`
                  : 'Select all'
                }
              </span>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  disabled={isProcessing}
                  className="btn-secondary text-sm inline-flex items-center gap-1"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  disabled={isProcessing}
                  className="btn-secondary text-sm inline-flex items-center gap-1"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  disabled={isProcessing}
                  className="btn-secondary text-sm inline-flex items-center gap-1"
                >
                  <ArchiveBoxIcon className="h-4 w-4" />
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={isProcessing}
                  className="btn-secondary text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages List */}
      {messages.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="min-w-full divide-y divide-gray-200">
            {messages.map((message) => (
              <div key={message.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-4 flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(message.id)}
                    onChange={() => toggleSelect(message.id)}
                    className="mt-1 rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                  />
                  
                  <Link
                    href={`/messages/${message.id}`}
                    className="flex-1 block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl" title={message.platform}>
                            {platformIcons[message.platform as keyof typeof platformIcons]}
                          </span>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {message.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {message.campaign.name} • {message.author.name || message.author.email}
                            </p>
                          </div>
                        </div>
                        
                        {message.content && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {message.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </p>
                        )}
                        
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Created {new Date(message.createdAt).toLocaleDateString()}</span>
                          {message._count.versions > 0 && (
                            <span>{message._count.versions} versions</span>
                          )}
                          {message.scheduledFor && (
                            <span>Scheduled for {new Date(message.scheduledFor).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[message.status as keyof typeof statusColors]}`}>
                          {message.status.replace(/_/g, ' ')}
                        </span>
                        {message.approvalTier && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            message.approvalTier === 'GREEN' ? 'bg-green-100 text-green-700' :
                            message.approvalTier === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {message.approvalTier}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first message to start engaging with your audience
          </p>
          <Link
            href="/messages/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            Create Your First Message
          </Link>
        </div>
      )}
    </div>
  )
}