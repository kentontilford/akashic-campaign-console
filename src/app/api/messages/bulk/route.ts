import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MessageStatus, UserRole } from '@prisma/client'
import { z } from 'zod'
import { ActivityLogger } from '@/lib/activity-logger'
import { canApproveMessages, isAdmin } from '@/lib/permissions'

const bulkActionSchema = z.object({
  messageIds: z.array(z.string()).min(1),
  action: z.enum(['archive', 'delete', 'approve', 'reject'])
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { messageIds, action } = bulkActionSchema.parse(body)

    // Get messages and verify access
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
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

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No accessible messages found' },
        { status: 404 }
      )
    }

    // Check permissions for approve/reject actions
    if (action === 'approve' || action === 'reject') {
      const userRole = session.user.role as UserRole
      if (!canApproveMessages(userRole) && !isAdmin(userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to approve/reject messages' },
          { status: 403 }
        )
      }
    }

    let updateCount = 0
    const results = []

    // Process each message
    for (const message of messages) {
      try {
        switch (action) {
          case 'archive':
            await prisma.message.update({
              where: { id: message.id },
              data: { status: MessageStatus.ARCHIVED }
            })
            await ActivityLogger.logActivity({
              campaignId: message.campaignId,
              userId: session.user.id,
              type: 'MESSAGE_UPDATED',
              description: `archived message "${message.title}"`,
              metadata: { messageId: message.id, action: 'archive' }
            })
            updateCount++
            break

          case 'delete':
            // Only allow deletion of drafts
            if (message.status === MessageStatus.DRAFT) {
              await prisma.message.delete({
                where: { id: message.id }
              })
              await ActivityLogger.logActivity({
                campaignId: message.campaignId,
                userId: session.user.id,
                type: 'MESSAGE_DELETED',
                description: `deleted message "${message.title}"`,
                metadata: { messageId: message.id, messageTitle: message.title }
              })
              updateCount++
            }
            break

          case 'approve':
            if (message.status === MessageStatus.PENDING_APPROVAL) {
              await prisma.message.update({
                where: { id: message.id },
                data: { status: MessageStatus.APPROVED }
              })
              
              await prisma.approval.create({
                data: {
                  messageId: message.id,
                  approvedById: session.user.id,
                  status: 'APPROVED',
                  comments: 'Bulk approved'
                }
              })

              await ActivityLogger.messageApproved(
                message.campaignId,
                session.user.id,
                message.title,
                message.id,
                'Bulk approved'
              )
              updateCount++
            }
            break

          case 'reject':
            if (message.status === MessageStatus.PENDING_APPROVAL) {
              await prisma.message.update({
                where: { id: message.id },
                data: { status: MessageStatus.REJECTED }
              })
              
              await prisma.approval.create({
                data: {
                  messageId: message.id,
                  approvedById: session.user.id,
                  status: 'REJECTED',
                  comments: 'Bulk rejected'
                }
              })

              await ActivityLogger.messageRejected(
                message.campaignId,
                session.user.id,
                message.title,
                message.id,
                'Bulk rejected'
              )
              updateCount++
            }
            break
        }
      } catch (error) {
        console.error(`Failed to ${action} message ${message.id}:`, error)
        results.push({ id: message.id, success: false })
      }
    }

    return NextResponse.json({
      success: true,
      count: updateCount,
      total: messages.length,
      action
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}