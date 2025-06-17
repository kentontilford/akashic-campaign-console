import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import TemplateCard from '@/components/templates/TemplateCard'

async function getTemplates(userId: string) {
  // Get user's campaigns
  const campaigns = await prisma.campaignMember.findMany({
    where: { userId },
    select: { campaignId: true }
  })
  
  const campaignIds = campaigns.map(c => c.campaignId)

  // Get templates accessible to user (global + campaign-specific)
  return prisma.messageTemplate.findMany({
    where: {
      OR: [
        { isGlobal: true },
        { campaignId: { in: campaignIds } }
      ]
    },
    include: {
      campaign: true,
      createdBy: true
    },
    orderBy: [
      { usageCount: 'desc' },
      { createdAt: 'desc' }
    ]
  })
}

const categories = [
  { id: 'all', name: 'All Templates', icon: '📚' },
  { id: 'fundraising', name: 'Fundraising', icon: '💰' },
  { id: 'announcement', name: 'Announcements', icon: '📢' },
  { id: 'thank-you', name: 'Thank You', icon: '🙏' },
  { id: 'event', name: 'Events', icon: '📅' },
  { id: 'volunteer', name: 'Volunteer', icon: '🤝' },
  { id: 'press', name: 'Press', icon: '📰' },
  { id: 'social', name: 'Social Media', icon: '📱' }
]

export default async function TemplatesPage({
  searchParams
}: {
  searchParams: { category?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const templates = await getTemplates(session.user.id)
  
  // Filter by category if specified
  const selectedCategory = searchParams.category || 'all'
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  // Group templates by global vs campaign-specific
  const globalTemplates = filteredTemplates.filter(t => t.isGlobal)
  const campaignTemplates = filteredTemplates.filter(t => !t.isGlobal)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
          <p className="mt-2 text-sm text-gray-600">
            Reusable templates to speed up your messaging workflow
          </p>
        </div>
        
        <Link
          href="/templates/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Template
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/templates${category.id !== 'all' ? `?category=${category.id}` : ''}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-akashic-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>

      {/* Templates */}
      {filteredTemplates.length > 0 ? (
        <div className="space-y-8">
          {/* Global Templates */}
          {globalTemplates.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Global Templates
                <span className="ml-2 text-sm text-gray-500">
                  ({globalTemplates.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {globalTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}

          {/* Campaign Templates */}
          {campaignTemplates.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Campaign Templates
                <span className="ml-2 text-sm text-gray-500">
                  ({campaignTemplates.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaignTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {selectedCategory === 'all' 
              ? 'No templates yet' 
              : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} templates`}
          </h3>
          <p className="mt-2 text-gray-500">
            Create templates to reuse common message formats
          </p>
          <Link
            href="/templates/new"
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Your First Template
          </Link>
        </div>
      )}
    </div>
  )
}