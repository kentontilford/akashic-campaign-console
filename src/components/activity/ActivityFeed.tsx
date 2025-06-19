'use client'

import { formatDistanceToNow } from 'date-fns'
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  MegaphoneIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon
} from '@/lib/icons'

interface Activity {
  id: string
  type: string
  description: string
  metadata?: any
  createdAt: Date
  user: {
    id: string
    name?: string | null
    email: string
  }
  campaign: {
    id: string
    name: string
  }
}

interface ActivityFeedProps {
  activities: Activity[]
}

const activityIcons: Record<string, any> = {
  MESSAGE_CREATED: DocumentTextIcon,
  MESSAGE_UPDATED: PencilIcon,
  MESSAGE_DELETED: TrashIcon,
  MESSAGE_APPROVED: CheckCircleIcon,
  MESSAGE_REJECTED: XCircleIcon,
  MESSAGE_SCHEDULED: ClockIcon,
  MESSAGE_PUBLISHED: MegaphoneIcon,
  MESSAGE_UNSCHEDULED: ArrowPathIcon,
  CAMPAIGN_CREATED: MegaphoneIcon,
  CAMPAIGN_UPDATED: PencilIcon,
  TEAM_MEMBER_ADDED: UserGroupIcon,
  TEAM_MEMBER_REMOVED: UserGroupIcon,
  TEAM_MEMBER_UPDATED: UserGroupIcon,
  TEMPLATE_CREATED: DocumentDuplicateIcon,
  TEMPLATE_UPDATED: PencilIcon,
  TEMPLATE_DELETED: TrashIcon,
  VERSION_GENERATED: ArrowPathIcon,
  ANALYTICS_VIEWED: ChartBarIcon
}

const activityColors: Record<string, string> = {
  MESSAGE_CREATED: 'bg-blue-100 text-blue-800',
  MESSAGE_UPDATED: 'bg-yellow-100 text-yellow-800',
  MESSAGE_DELETED: 'bg-red-100 text-red-800',
  MESSAGE_APPROVED: 'bg-green-100 text-green-800',
  MESSAGE_REJECTED: 'bg-red-100 text-red-800',
  MESSAGE_SCHEDULED: 'bg-purple-100 text-purple-800',
  MESSAGE_PUBLISHED: 'bg-green-100 text-green-800',
  MESSAGE_UNSCHEDULED: 'bg-gray-100 text-gray-800',
  CAMPAIGN_CREATED: 'bg-blue-100 text-blue-800',
  CAMPAIGN_UPDATED: 'bg-yellow-100 text-yellow-800',
  TEAM_MEMBER_ADDED: 'bg-green-100 text-green-800',
  TEAM_MEMBER_REMOVED: 'bg-red-100 text-red-800',
  TEAM_MEMBER_UPDATED: 'bg-yellow-100 text-yellow-800',
  TEMPLATE_CREATED: 'bg-blue-100 text-blue-800',
  TEMPLATE_UPDATED: 'bg-yellow-100 text-yellow-800',
  TEMPLATE_DELETED: 'bg-red-100 text-red-800',
  VERSION_GENERATED: 'bg-purple-100 text-purple-800',
  ANALYTICS_VIEWED: 'bg-gray-100 text-gray-800'
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="card text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No activity yet</h3>
        <p className="mt-2 text-gray-500">
          Activities will appear here as your team works on campaigns
        </p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => {
          const Icon = activityIcons[activity.type] || DocumentTextIcon
          const colorClass = activityColors[activity.type] || 'bg-gray-100 text-gray-800'
          
          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {activity.user.name || activity.user.email}
                        </span>{' '}
                        <span className="text-gray-500">{activity.description}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        in {activity.campaign.name} •{' '}
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    
                    {/* Metadata display */}
                    {activity.metadata && (
                      <div className="mt-2 text-sm text-gray-600">
                        {activity.type === 'MESSAGE_APPROVED' && activity.metadata.comments && (
                          <p className="italic">&quot;{activity.metadata.comments}&quot;</p>
                        )}
                        {activity.type === 'MESSAGE_REJECTED' && activity.metadata.comments && (
                          <p className="italic">Reason: &quot;{activity.metadata.comments}&quot;</p>
                        )}
                        {activity.type === 'MESSAGE_SCHEDULED' && activity.metadata.scheduledFor && (
                          <p>
                            Scheduled for: {new Date(activity.metadata.scheduledFor).toLocaleString()}
                          </p>
                        )}
                        {activity.type === 'TEAM_MEMBER_ADDED' && activity.metadata.memberEmail && (
                          <p>Added: {activity.metadata.memberEmail} as {activity.metadata.role}</p>
                        )}
                        {activity.type === 'MESSAGE_PUBLISHED' && activity.metadata.platforms && (
                          <p>Published to: {activity.metadata.platforms.join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}