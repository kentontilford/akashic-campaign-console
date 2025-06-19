'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ClockIcon, DocumentTextIcon, UserGroupIcon } from '@/lib/icons'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface Activity {
  id: string
  type: string
  description: string
  createdAt: Date
  user: {
    name?: string | null
    email: string
  }
}

interface ActivitySummaryProps {
  activities: Activity[]
}

const getActivityIcon = (type: string) => {
  if (type.includes('MESSAGE')) return DocumentTextIcon
  if (type.includes('TEAM')) return UserGroupIcon
  return ClockIcon
}

const getActivityColor = (type: string) => {
  if (type.includes('CREATED')) return 'text-blue-600'
  if (type.includes('APPROVED')) return 'text-green-600'
  if (type.includes('REJECTED')) return 'text-red-600'
  if (type.includes('SCHEDULED')) return 'text-purple-600'
  return 'text-gray-600'
}

export default function ActivitySummary({ activities }: ActivitySummaryProps) {
  const recentActivities = activities.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Link
            href="/activity"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {activity.user.name || activity.user.email}
                      </span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}