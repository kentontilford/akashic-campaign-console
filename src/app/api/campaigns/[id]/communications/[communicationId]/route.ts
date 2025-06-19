import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateCommunicationSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().optional(),
  preheader: z.string().optional(),
  content: z.string().min(1).optional(),
  audienceFilters: z.any().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyToEmail: z.string().email().optional(),
  scheduledFor: z.string().optional(),
  testMode: z.boolean().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; communicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId, communicationId } = params

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

    // Get communication with all details
    const communication = await prisma.communicationCampaign.findFirst({
      where: {
        id: communicationId,
        campaignId
      },
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        approvedBy: {
          select: { name: true, email: true }
        },
        template: true,
        messages: {
          select: {
            id: true,
            status: true,
            sentAt: true,
            deliveredAt: true,
            openedAt: true,
            clickCount: true
          },
          take: 100
        },
        _count: {
          select: {
            messages: true,
            segments: true
          }
        }
      }
    })

    if (!communication) {
      return NextResponse.json({ error: 'Communication not found' }, { status: 404 })
    }

    // Calculate real-time stats
    const messageStats = await prisma.communicationMessage.groupBy({
      by: ['status'],
      where: { communicationId },
      _count: true
    })

    const stats = {
      total: communication._count.messages,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      unsubscribed: 0
    }

    messageStats.forEach(stat => {
      const status = stat.status.toLowerCase()
      if (status in stats) {
        stats[status as keyof typeof stats] = stat._count
      }
    })

    return NextResponse.json({
      ...communication,
      stats
    })

  } catch (error: any) {
    console.error('[COMMUNICATION_DETAIL]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; communicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId, communicationId } = params

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

    // Check if communication exists and is editable
    const existing = await prisma.communicationCampaign.findFirst({
      where: {
        id: communicationId,
        campaignId,
        status: { in: ['DRAFT', 'SCHEDULED'] }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Communication not found or not editable' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const data = updateCommunicationSchema.parse(body)

    // Recalculate audience count if filters changed
    let audienceCount = existing.audienceCount
    if (data.audienceFilters) {
      if (existing.audienceType === 'VOTERS') {
        audienceCount = await prisma.voter.count({
          where: { campaignId, ...data.audienceFilters }
        })
      } else if (existing.audienceType === 'VOLUNTEERS') {
        audienceCount = await prisma.volunteer.count({
          where: { campaignId, ...data.audienceFilters }
        })
      }
    }

    // Update communication
    const communication = await prisma.communicationCampaign.update({
      where: { id: communicationId },
      data: {
        ...data,
        audienceCount,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
        updatedAt: new Date()
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'COMMUNICATION_UPDATED',
        description: `Updated communication: ${communication.name}`,
        metadata: {
          communicationId: communication.id,
          changes: Object.keys(data)
        }
      }
    })

    return NextResponse.json(communication)

  } catch (error: any) {
    console.error('[COMMUNICATION_UPDATE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; communicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId, communicationId } = params

    // Check campaign access (only admins can delete)
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id,
        role: { in: ['CAMPAIGN_MANAGER', 'ADMIN'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if communication can be deleted
    const communication = await prisma.communicationCampaign.findFirst({
      where: {
        id: communicationId,
        campaignId,
        status: { in: ['DRAFT', 'SCHEDULED'] }
      }
    })

    if (!communication) {
      return NextResponse.json(
        { error: 'Communication not found or cannot be deleted' },
        { status: 404 }
      )
    }

    // Delete communication (cascades to messages)
    await prisma.communicationCampaign.delete({
      where: { id: communicationId }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'COMMUNICATION_DELETED',
        description: `Deleted communication: ${communication.name}`,
        metadata: {
          communicationId,
          type: communication.type
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[COMMUNICATION_DELETE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}