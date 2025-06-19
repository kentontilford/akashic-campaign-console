'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClockIcon, XMarkIcon, RocketLaunchIcon } from '@/lib/icons'
import toast from 'react-hot-toast'

interface ScheduledMessageCardProps {
  message: any
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

export default function ScheduledMessageCard({ message }: ScheduledMessageCardProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this scheduled message?')) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/messages/${message.id}/unschedule`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to cancel scheduled message')
      }

      toast.success('Scheduled message cancelled')
      router.refresh()
    } catch (error) {
      toast.error('Failed to cancel message')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublishNow = async () => {
    if (!confirm('Are you sure you want to publish this message now?')) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/messages/${message.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: message.platform,
          settings: {} // Default settings for immediate publish
        })
      })

      if (!response.ok) {
        throw new Error('Failed to publish message')
      }

      toast.success('Message published successfully!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to publish message')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const scheduledDate = message.scheduledFor ? new Date(message.scheduledFor) : null
  const timeUntil = scheduledDate ? scheduledDate.getTime() - Date.now() : 0
  const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60))
  const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" title={message.platform}>
            {platformIcons[message.platform as keyof typeof platformIcons]}
          </span>
          <div>
            <Link 
              href={`/messages/${message.id}`}
              className="font-medium text-gray-900 hover:text-akashic-primary"
            >
              {message.title}
            </Link>
            <p className="text-sm text-gray-500">{message.campaign.name}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <ClockIcon className="h-4 w-4" />
          <span>
            {scheduledDate?.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {timeUntil > 0 && (
            <span className="text-gray-400">
              ({hoursUntil > 0 ? `${hoursUntil}h ` : ''}{minutesUntil}m from now)
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">
          {message.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Created by {message.author.name || message.author.email}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handlePublishNow}
            disabled={isProcessing}
            className="text-sm text-akashic-primary hover:text-blue-700 disabled:opacity-50"
            title="Publish now"
          >
            <RocketLaunchIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            title="Cancel schedule"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}