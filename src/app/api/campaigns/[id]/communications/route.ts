import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createCommunicationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['EMAIL', 'SMS', 'ROBOCALL', 'DIRECT_MAIL']),
  audienceType: z.enum(['VOTERS', 'VOLUNTEERS', 'CUSTOM']),
  audienceFilters: z.any().optional(),
  subject: z.string().optional(),
  preheader: z.string().optional(),
  content: z.string().min(1),
  templateId: z.string().optional(),
  usePersonalization: z.boolean().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyToEmail: z.string().email().optional(),
  scheduledFor: z.string().optional(),
  testMode: z.boolean().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Check campaign access
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = { campaignId }
    if (status) where.status = status
    if (type) where.type = type

    // Get communications with stats
    const [communications, total] = await Promise.all([
      prisma.communicationCampaign.findMany({
        where,
        include: {
          createdBy: {
            select: { name: true, email: true }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.communicationCampaign.count({ where })
    ])

    return NextResponse.json({
      communications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('[COMMUNICATIONS_LIST]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Check campaign access
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id,
        role: { 
          in: ['CAMPAIGN_MANAGER', 'COMMUNICATIONS_DIRECTOR', 'ADMIN'] 
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const data = createCommunicationSchema.parse(body)

    // Calculate audience count based on filters
    let audienceCount = 0
    if (data.audienceType === 'VOTERS') {
      const voterWhere = data.audienceFilters || {}
      audienceCount = await prisma.voter.count({
        where: { campaignId, ...voterWhere }
      })
    } else if (data.audienceType === 'VOLUNTEERS') {
      const volunteerWhere = data.audienceFilters || {}
      audienceCount = await prisma.volunteer.count({
        where: { campaignId, ...volunteerWhere }
      })
    }

    // Create communication campaign
    const communication = await prisma.communicationCampaign.create({
      data: {
        campaignId,
        name: data.name,
        type: data.type,
        status: 'DRAFT',
        audienceType: data.audienceType,
        audienceFilters: data.audienceFilters,
        audienceCount,
        subject: data.subject,
        preheader: data.preheader,
        content: data.content,
        templateId: data.templateId,
        usePersonalization: data.usePersonalization ?? true,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
        replyToEmail: data.replyToEmail,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        testMode: data.testMode ?? false,
        createdById: session.user.id,
        mergeFields: [] // Will be populated based on content analysis
      },
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'COMMUNICATION_CREATED',
        description: `Created ${data.type.toLowerCase()} campaign: ${data.name}`,
        metadata: {
          communicationId: communication.id,
          audienceCount
        }
      }
    })

    return NextResponse.json(communication, { status: 201 })

  } catch (error: any) {
    console.error('[COMMUNICATION_CREATE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}