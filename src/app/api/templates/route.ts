import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's campaigns
    const campaigns = await prisma.campaignMember.findMany({
      where: { userId: session.user.id },
      select: { campaignId: true }
    })
    
    const campaignIds = campaigns.map(c => c.campaignId)

    // Get templates accessible to user
    const templates = await prisma.messageTemplate.findMany({
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

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, platform, category, content, isGlobal, campaignId } = body

    // Validate required fields
    if (!name || !platform || !category || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only admins can create global templates
    if (isGlobal && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can create global templates' },
        { status: 403 }
      )
    }

    // If campaign-specific, verify user has access
    if (campaignId) {
      const member = await prisma.campaignMember.findFirst({
        where: {
          userId: session.user.id,
          campaignId
        }
      })

      if (!member) {
        return NextResponse.json(
          { error: 'No access to this campaign' },
          { status: 403 }
        )
      }
    }

    // Get current campaign if not global and no campaignId specified
    let finalCampaignId = campaignId
    if (!isGlobal && !campaignId) {
      const firstCampaign = await prisma.campaignMember.findFirst({
        where: { userId: session.user.id },
        select: { campaignId: true }
      })
      finalCampaignId = firstCampaign?.campaignId || null
    }

    // Create template
    const template = await prisma.messageTemplate.create({
      data: {
        name,
        description,
        platform,
        category,
        content,
        isGlobal: !!isGlobal,
        campaignId: isGlobal ? null : finalCampaignId,
        createdById: session.user.id
      },
      include: {
        campaign: true,
        createdBy: true
      }
    })

    // Log activity if campaign-specific
    if (template.campaignId) {
      await prisma.activity.create({
        data: {
          campaignId: template.campaignId,
          userId: session.user.id,
          type: 'TEMPLATE_CREATED',
          description: `created template "${template.name}"`,
          metadata: {
            templateId: template.id,
            platform: template.platform,
            category: template.category
          }
        }
      })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}