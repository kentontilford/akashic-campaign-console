import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email/service'
import { z } from 'zod'

const sendCommunicationSchema = z.object({
  testRecipients: z.array(z.string().email()).optional(),
  approvalCode: z.string().optional()
})

export async function POST(
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

    const body = await req.json()
    const { testRecipients, approvalCode } = sendCommunicationSchema.parse(body)

    // Get communication
    const communication = await prisma.communicationCampaign.findFirst({
      where: {
        id: communicationId,
        campaignId
      }
    })

    if (!communication) {
      return NextResponse.json({ error: 'Communication not found' }, { status: 404 })
    }

    // Check if already sent
    if (['SENDING', 'SENT'].includes(communication.status)) {
      return NextResponse.json(
        { error: 'Communication has already been sent' },
        { status: 400 }
      )
    }

    // Verify approval if required
    if (!communication.testMode && !communication.approvedById && !approvalCode) {
      return NextResponse.json(
        { error: 'Communication requires approval before sending' },
        { status: 403 }
      )
    }

    // Initialize email service
    const emailService = new EmailService(campaignId)
    await emailService.initialize()

    // Get recipients
    let recipients: Array<{ id: string; email: string; name?: string }> = []

    if (testRecipients) {
      // Test mode - send to specific recipients
      recipients = testRecipients.map(email => ({
        id: 'test',
        email,
        name: 'Test Recipient'
      }))
    } else {
      // Production mode - get recipients based on audience
      if (communication.audienceType === 'VOTERS') {
        const voters = await prisma.voter.findMany({
          where: {
            campaignId,
            email: { not: null },
            ...(communication.audienceFilters as any || {})
          },
          select: { id: true, email: true, firstName: true, lastName: true }
        })
        recipients = voters
          .filter(v => v.email)
          .map(v => ({
            id: v.id,
            email: v.email!,
            name: `${v.firstName} ${v.lastName}`
          }))
      } else if (communication.audienceType === 'VOLUNTEERS') {
        const volunteers = await prisma.volunteer.findMany({
          where: {
            campaignId,
            ...(communication.audienceFilters as any || {})
          },
          select: { id: true, email: true, firstName: true, lastName: true }
        })
        recipients = volunteers.map(v => ({
          id: v.id,
          email: v.email,
          name: `${v.firstName} ${v.lastName}`
        }))
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      )
    }

    // Update communication status
    await prisma.communicationCampaign.update({
      where: { id: communicationId },
      data: {
        status: 'SENDING',
        sendingStartedAt: new Date(),
        audienceCount: recipients.length
      }
    })

    // Process in batches to avoid timeout
    const batchSize = 100
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      // Send emails
      const result = await emailService.sendBatch({
        emails: batch.map(recipient => ({
          to: recipient.email,
          subject: personalizeContent(communication.subject || '', recipient),
          html: personalizeContent(communication.content, recipient),
          metadata: {
            communicationId,
            recipientId: recipient.id,
            campaignId
          }
        })),
        from: communication.fromEmail || process.env.DEFAULT_FROM_EMAIL!,
        fromName: communication.fromName || undefined,
        replyTo: communication.replyToEmail || undefined
      })

      sentCount += result.successful
      failedCount += result.failed

      // Track messages
      for (let j = 0; j < batch.length; j++) {
        const recipient = batch[j]
        const emailResult = result.results[j]
        
        await emailService.trackMessage(
          communicationId,
          recipient.id,
          communication.audienceType === 'VOTERS' ? 'VOTER' : 'VOLUNTEER',
          recipient.email,
          emailResult
        )
      }
    }

    // Update communication with final stats
    await prisma.communicationCampaign.update({
      where: { id: communicationId },
      data: {
        status: 'SENT',
        sendingCompletedAt: new Date(),
        sentCount,
        deliveredCount: sentCount, // Will be updated via webhooks
        approvedById: approvalCode ? session.user.id : communication.approvedById,
        approvedAt: approvalCode ? new Date() : communication.approvedAt
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'COMMUNICATION_SENT',
        description: `Sent ${communication.type.toLowerCase()} to ${sentCount} recipients`,
        metadata: {
          communicationId,
          sentCount,
          failedCount,
          testMode: !!testRecipients
        }
      }
    })

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      totalRecipients: recipients.length
    })

  } catch (error: any) {
    console.error('[COMMUNICATION_SEND]', error)
    
    // Update status back to scheduled/draft on error
    await prisma.communicationCampaign.update({
      where: { id: params.communicationId },
      data: {
        status: 'DRAFT',
        sendingStartedAt: null
      }
    }).catch(() => {})

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function personalizeContent(content: string, recipient: { name?: string; email: string }): string {
  return content
    .replace(/{{name}}/g, recipient.name || 'Friend')
    .replace(/{{email}}/g, recipient.email)
    .replace(/{{firstName}}/g, recipient.name?.split(' ')[0] || 'Friend')
}