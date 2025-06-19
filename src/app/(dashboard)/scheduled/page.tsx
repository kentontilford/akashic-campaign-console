import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { CalendarIcon, ClockIcon } from '@/lib/icons'
import ScheduledMessageCard from '@/components/messaging/ScheduledMessageCard'

async function getScheduledMessages(userId: string) {
  return prisma.message.findMany({
    where: {
      status: 'SCHEDULED',
      campaign: {
        members: {
          some: { userId }
        }
      }
    },
    include: {
      campaign: true,
      author: true
    },
    orderBy: {
      scheduledFor: 'asc'
    }
  })
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

export default async function ScheduledMessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const scheduledMessages = await getScheduledMessages(session.user.id)

  // Group messages by date
  const messagesByDate = scheduledMessages.reduce((acc, message) => {
    if (!message.scheduledFor) return acc
    
    const date = new Date(message.scheduledFor).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(message)
    return acc
  }, {} as Record<string, typeof scheduledMessages>)

  // Sort dates
  const sortedDates = Object.keys(messagesByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  )

  // Get upcoming messages in next 7 days
  const now = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  
  const upcomingCount = scheduledMessages.filter(msg => {
    if (!msg.scheduledFor) return false
    const scheduledDate = new Date(msg.scheduledFor)
    return scheduledDate >= now && scheduledDate <= sevenDaysFromNow
  }).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Messages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your scheduled content across all campaigns
          </p>
        </div>
        
        <Link
          href="/messages/new"
          className="btn-primary"
        >
          Create New Message
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Total Scheduled</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{scheduledMessages.length}</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Next 7 Days</dt>
          <dd className="mt-1 text-3xl font-semibold text-akashic-primary">{upcomingCount}</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Next Message</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {scheduledMessages[0]?.scheduledFor ? (
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {new Date(scheduledMessages[0].scheduledFor).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            ) : (
              'None'
            )}
          </dd>
        </div>
      </div>

      {/* Calendar View */}
      {scheduledMessages.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map((date) => {
            const messages = messagesByDate[date]
            const dateObj = new Date(date)
            const isToday = dateObj.toDateString() === new Date().toDateString()
            const isTomorrow = dateObj.toDateString() === new Date(Date.now() + 86400000).toDateString()
            
            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">
                    {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {messages.map((message) => (
                    <ScheduledMessageCard
                      key={message.id}
                      message={message}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No scheduled messages</h3>
          <p className="mt-2 text-gray-500">
            Create and schedule messages to publish them automatically
          </p>
          <Link
            href="/messages/new"
            className="btn-primary mt-4 inline-block"
          >
            Create Your First Message
          </Link>
        </div>
      )}
    </div>
  )
}