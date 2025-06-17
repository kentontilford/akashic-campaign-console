import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MessageStatus } from '@prisma/client'
import { z } from 'zod'

const scheduleMessageSchema = z.object({
  scheduledFor: z.string().datetime()
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
    const validatedData = scheduleMessageSchema.parse(body)
    
    const scheduledDate = new Date(validatedData.scheduledFor)
    
    // Verify scheduled time is in the future
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

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

    // Verify message is approved
    if (message.status !== MessageStatus.APPROVED) {
      return NextResponse.json(
        { error: 'Only approved messages can be scheduled' },
        { status: 400 }
      )
    }

    // Update message with scheduled time
    const updatedMessage = await prisma.message.update({
      where: { id: params.id },
      data: {
        scheduledFor: scheduledDate,
        status: MessageStatus.SCHEDULED
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId: message.campaignId,
        userId: session.user.id,
        type: 'MESSAGE_SCHEDULED',
        description: `scheduled message "${message.title}" for ${scheduledDate.toLocaleString()}`,
        metadata: {
          messageId: message.id,
          scheduledFor: scheduledDate.toISOString()
        }
      }
    })

    return NextResponse.json({
      message: updatedMessage,
      scheduledFor: scheduledDate
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error scheduling message:', error)
    return NextResponse.json(
      { error: 'Failed to schedule message' },
      { status: 500 }
    )
  }
}