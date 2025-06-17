import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MessageStatus } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Verify message is scheduled
    if (message.status !== MessageStatus.SCHEDULED) {
      return NextResponse.json(
        { error: 'Message is not scheduled' },
        { status: 400 }
      )
    }

    // Update message to remove schedule
    const updatedMessage = await prisma.message.update({
      where: { id: params.id },
      data: {
        scheduledFor: null,
        status: MessageStatus.APPROVED // Return to approved status
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId: message.campaignId,
        userId: session.user.id,
        type: 'MESSAGE_UNSCHEDULED',
        description: `cancelled scheduled message "${message.title}"`,
        metadata: {
          messageId: message.id,
          previousSchedule: message.scheduledFor
        }
      }
    })

    return NextResponse.json({
      message: updatedMessage,
      status: 'success'
    })
  } catch (error) {
    console.error('Error unscheduling message:', error)
    return NextResponse.json(
      { error: 'Failed to unschedule message' },
      { status: 500 }
    )
  }
}