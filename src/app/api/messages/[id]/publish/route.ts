import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MessageStatus, Platform } from '@prisma/client'
import { z } from 'zod'

const publishMessageSchema = z.object({
  platform: z.nativeEnum(Platform),
  settings: z.record(z.any())
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = publishMessageSchema.parse(body)

    // Get message and verify access
    const message = await prisma.message.findFirst({
      where: {
        id: params.id,
        campaign: {
          members: {
            some: { userId: session.user.id }
          }
        }
      },
      include: {
        campaign: true
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Verify message is approved or scheduled
    if (message.status !== MessageStatus.APPROVED && message.status !== MessageStatus.SCHEDULED) {
      return NextResponse.json(
        { error: 'Only approved messages can be published' },
        { status: 400 }
      )
    }

    // Verify platform matches
    if (message.platform !== validatedData.platform) {
      return NextResponse.json(
        { error: 'Platform mismatch' },
        { status: 400 }
      )
    }

    // In a real implementation, this would integrate with actual platform APIs
    // For now, we'll simulate the publishing process
    const publishRecord = await prisma.publishRecord.create({
      data: {
        messageId: params.id,
        platform: validatedData.platform,
        status: 'SUCCESS',
        metadata: validatedData.settings,
        externalId: `sim_${Date.now()}` // Simulated external ID
      }
    })

    // Update message status
    await prisma.message.update({
      where: { id: params.id },
      data: {
        status: MessageStatus.PUBLISHED,
        publishedAt: new Date()
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId: message.campaignId,
        userId: session.user.id,
        type: 'MESSAGE_PUBLISHED',
        description: `published message "${message.title}" to ${validatedData.platform}`,
        metadata: {
          messageId: message.id,
          platform: validatedData.platform,
          publishRecordId: publishRecord.id
        }
      }
    })

    return NextResponse.json({
      publishRecord,
      message: {
        id: message.id,
        status: MessageStatus.PUBLISHED,
        publishedAt: new Date()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error publishing message:', error)
    return NextResponse.json(
      { error: 'Failed to publish message' },
      { status: 500 }
    )
  }
}