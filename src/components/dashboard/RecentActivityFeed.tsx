'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MysticalCard } from '@/components/ui'
import { 
  MessageSquare, 
  Users, 
  CheckCircle, 
  XCircle, 
  FileText,
  Edit,
  Trash,
  Eye
} from 'lucide-react'
import Link from 'next/link'

// Import the Activity type from Prisma if available, or define a compatible interface
interface ActivityData {
  id: string
  action: string
  entityType: string
  entityId: string
  metadata?: any
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  campaign?: {
    id: string
    name: string
  } | null
}

interface RecentActivityFeedProps {
  activities: ActivityData[]
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActivityIcon = (action: string, entityType: string) => {
    if (action === 'CREATE' && entityType === 'MESSAGE') return MessageSquare
    if (action === 'CREATE' && entityType === 'CAMPAIGN') return Users
    if (action === 'APPROVE') return CheckCircle
    if (action === 'REJECT') return XCircle
    if (action === 'UPDATE') return Edit
    if (action === 'DELETE') return Trash
    if (action === 'VIEW') return Eye
    return FileText
  }

  const getActivityColor = (action: string) => {
    if (action === 'CREATE') return 'text-green-600 bg-green-100'
    if (action === 'APPROVE') return 'text-blue-600 bg-blue-100'
    if (action === 'REJECT') return 'text-red-600 bg-red-100'
    if (action === 'UPDATE') return 'text-amber-600 bg-amber-100'
    if (action === 'DELETE') return 'text-gray-600 bg-gray-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatActivityMessage = (activity: ActivityData) => {
    const entityName = activity.metadata?.name || activity.entityType.toLowerCase()
    const action = activity.action.toLowerCase()
    
    return (
      <>
        <span className="font-medium text-black">{activity.user.name || activity.user.email}</span>
        {' '}{action}d {entityName}
        {activity.campaign && (
          <>
            {' in '}
            <span className="font-medium text-black">{activity.campaign.name}</span>
          </>
        )}
      </>
    )
  }

  return (
    <MysticalCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Recent Activity</h2>
        <Link 
          href="/activity" 
          className="text-sm font-medium text-black hover:text-blue-600 transition-colors"
        >
          View all →
        </Link>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.action, activity.entityType)
            const colorClasses = getActivityColor(activity.action)

            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 group"
              >
                <div className={`p-2 rounded-lg ${colorClasses} transition-transform group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {formatActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </MysticalCard>
  )
}