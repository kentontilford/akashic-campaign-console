import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, MessageStatus } from '@prisma/client'
import { z } from 'zod'
import { ActivityLogger } from '@/lib/activity-logger'
import { canApproveMessages } from '@/lib/permissions'

const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
  comments: z.string().optional()
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

    // Check if user has approval permissions
    if (!canApproveMessages(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = approvalSchema.parse(body)

    // Get message and verify access
    const message = await prisma.message.findFirst({
      where: {
        id: params.id,
        campaign: {
          members: {
            some: {
              userId: session.user.id,
              role: {
                in: [UserRole.CANDIDATE, UserRole.CAMPAIGN_MANAGER, UserRole.COMMUNICATIONS_DIRECTOR]
              }
            }
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

    if (message.status !== MessageStatus.PENDING_APPROVAL) {
      return NextResponse.json(
        { error: 'Message is not pending approval' },
        { status: 400 }
      )
    }

    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        messageId: params.id,
        approvedById: session.user.id,
        status: validatedData.status,
        comments: validatedData.comments
      }
    })

    // Update message status
    let newStatus: MessageStatus
    switch (validatedData.status) {
      case 'APPROVED':
        newStatus = MessageStatus.APPROVED
        break
      case 'REJECTED':
        newStatus = MessageStatus.REJECTED
        break
      case 'CHANGES_REQUESTED':
        newStatus = MessageStatus.CHANGES_REQUESTED
        break
    }

    await prisma.message.update({
      where: { id: params.id },
      data: { status: newStatus }
    })

    // Log activity
    if (validatedData.status === 'APPROVED') {
      await ActivityLogger.messageApproved(
        message.campaignId,
        session.user.id,
        message.title,
        message.id,
        validatedData.comments
      )
    } else if (validatedData.status === 'REJECTED') {
      await ActivityLogger.messageRejected(
        message.campaignId,
        session.user.id,
        message.title,
        message.id,
        validatedData.comments
      )
    }

    return NextResponse.json({
      approval,
      message: {
        id: message.id,
        status: newStatus
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}