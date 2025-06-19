'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  RocketLaunchIcon
} from '@/lib/icons'
import ScheduleModal from './ScheduleModal'
import PublishModal from './PublishModal'
import toast from 'react-hot-toast'

interface MessageActionsProps {
  message: any
}

export default function MessageActions({ message }: MessageActionsProps) {
  const router = useRouter()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canSchedule = message.status === 'APPROVED'
  const canPublish = ['APPROVED', 'SCHEDULED'].includes(message.status)
  const canEdit = ['DRAFT', 'CHANGES_REQUESTED'].includes(message.status)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/messages/${message.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      toast.success('Message deleted successfully')
      router.push('/messages')
    } catch (error) {
      toast.error('Failed to delete message')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleScheduled = () => {
    router.refresh()
  }

  const handlePublished = () => {
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {canSchedule && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Schedule
          </button>
        )}
        
        {canPublish && (
          <button
            onClick={() => setShowPublishModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RocketLaunchIcon className="h-4 w-4" />
            Publish Now
          </button>
        )}
        
        {canEdit && (
          <Link
            href={`/messages/${message.id}/edit`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Link>
        )}
        
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        messageId={message.id}
        onScheduled={handleScheduled}
      />

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        messageId={message.id}
        platform={message.platform}
        onPublished={handlePublished}
      />
    </>
  )
}