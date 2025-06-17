import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { 
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import MessageActions from '@/components/messaging/MessageActions'
import VersionComparison from '@/components/messaging/VersionComparison'

async function getMessage(messageId: string, userId: string) {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      campaign: {
        members: {
          some: { userId }
        }
      }
    },
    include: {
      campaign: true,
      author: true,
      versions: {
        include: {
          createdBy: true
        }
      },
      approvals: {
        include: {
          approvedBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      publishHistory: {
        orderBy: {
          publishedAt: 'desc'
        }
      }
    }
  })

  return message
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

export default async function MessageDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const message = await getMessage(params.id, session.user.id)
  
  if (!message) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/messages"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{message.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {message.campaign.name} • Created by {message.author.name || message.author.email}
            </p>
          </div>
        </div>
        
        <MessageActions message={message} />
      </div>

      {/* Status Bar */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[message.status]}`}>
                {message.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Platform</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">{platformIcons[message.platform]}</span>
                <span className="text-sm font-medium">{message.platform}</span>
              </div>
            </div>
            
            {message.approvalTier && (
              <div>
                <p className="text-sm text-gray-500">Approval Tier</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                  message.approvalTier === 'GREEN' ? 'bg-green-100 text-green-700' :
                  message.approvalTier === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {message.approvalTier}
                </span>
              </div>
            )}

            {message.scheduledFor && (
              <div>
                <p className="text-sm text-gray-500">Scheduled For</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(message.scheduledFor).toLocaleString()}
                </p>
              </div>
            )}

            {message.publishedAt && (
              <div>
                <p className="text-sm text-gray-500">Published At</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(message.publishedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <p>Created {new Date(message.createdAt).toLocaleDateString()}</p>
            {message.updatedAt !== message.createdAt && (
              <p>Updated {new Date(message.updatedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Message Content</h2>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          </div>

          {/* Versions */}
          {message.versions.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Version History</h2>
              <div className="space-y-3">
                {message.versions.map((version) => (
                  <div key={version.id} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {version.versionProfile} Version
                        </p>
                        <p className="text-sm text-gray-500">
                          Created by {version.createdBy.name || version.createdBy.email}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Approval History */}
          {message.approvals.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approval History</h3>
              <div className="space-y-3">
                {message.approvals.map((approval) => (
                  <div key={approval.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      approval.status === 'APPROVED' ? 'text-green-500' :
                      approval.status === 'REJECTED' ? 'text-red-500' :
                      'text-orange-500'
                    }`}>
                      {approval.status === 'APPROVED' ? <CheckIcon className="h-5 w-5" /> :
                       approval.status === 'REJECTED' ? <XMarkIcon className="h-5 w-5" /> :
                       <ClockIcon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {approval.status.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {approval.approvedBy.name || approval.approvedBy.email}
                      </p>
                      {approval.comments && (
                        <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(approval.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Analysis */}
          {message.approvalAnalysis && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Analysis</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Word Count</dt>
                  <dd className="mt-1">{(message.approvalAnalysis as any)?.wordCount || 0}</dd>
                </div>
                {(message.approvalAnalysis as any)?.riskFactors?.length > 0 && (
                  <div>
                    <dt className="font-medium text-gray-500">Risk Factors</dt>
                    <dd className="mt-1">
                      <ul className="list-disc list-inside space-y-1">
                        {(message.approvalAnalysis as any).riskFactors.map((factor: string, index: number) => (
                          <li key={index} className="text-gray-600">{factor}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-gray-500">Confidence Score</dt>
                  <dd className="mt-1">{((message.approvalAnalysis as any)?.confidence * 100).toFixed(0)}%</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Publishing History */}
          {message.publishHistory.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing History</h3>
              <div className="space-y-3">
                {message.publishHistory.map((record) => (
                  <div key={record.id} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {record.platform}
                        </p>
                        <p className={`text-sm ${
                          record.status === 'SUCCESS' ? 'text-green-600' :
                          record.status === 'FAILED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {record.status}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(record.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version Comparison Tool */}
      {['DRAFT', 'APPROVED'].includes(message.status) && (
        <div className="card">
          <VersionComparison
            messageId={message.id}
            campaignId={message.campaignId}
            originalContent={message.content}
            platform={message.platform}
          />
        </div>
      )}
    </div>
  )
}