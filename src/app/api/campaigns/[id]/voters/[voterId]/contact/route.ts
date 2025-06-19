import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const contactSchema = z.object({
  contactType: z.enum(['CANVASS', 'PHONE', 'TEXT', 'EMAIL', 'MAIL']),
  result: z.enum([
    'CONTACTED',
    'NOT_HOME',
    'REFUSED',
    'MOVED',
    'DECEASED',
    'WRONG_NUMBER',
    'DO_NOT_CONTACT',
    'LEFT_MESSAGE',
    'BUSY',
    'NO_ANSWER'
  ]),
  supportLevel: z.enum([
    'STRONG_SUPPORT', 
    'LEAN_SUPPORT', 
    'UNDECIDED', 
    'LEAN_OPPOSE', 
    'STRONG_OPPOSE'
  ]).optional().nullable(),
  issuesCareAbout: z.array(z.string()).optional(),
  notes: z.string().optional(),
  followUpNeeded: z.boolean().default(false),
  followUpDate: z.string().optional()
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; voterId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId, voterId } = params

    // Check if user has access to this campaign
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const data = contactSchema.parse(body)

    // Create contact record in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create contact record
      const contact = await tx.voterContact.create({
        data: {
          voterId,
          campaignId,
          userId: session.user.id,
          contactType: data.contactType,
          result: data.result,
          supportLevel: data.supportLevel,
          issuesCareAbout: data.issuesCareAbout || [],
          notes: data.notes,
          followUpNeeded: data.followUpNeeded,
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null
        }
      })

      // Update voter record if support level changed
      if (data.supportLevel) {
        await tx.voter.update({
          where: { id: voterId },
          data: { 
            supportLevel: data.supportLevel,
            updatedAt: new Date()
          }
        })
      }

      // Set do not contact if specified
      if (data.result === 'DO_NOT_CONTACT') {
        await tx.voter.update({
          where: { id: voterId },
          data: { 
            doNotContact: true,
            updatedAt: new Date()
          }
        })
      }

      // Get voter info for activity log
      const voter = await tx.voter.findUnique({
        where: { id: voterId },
        select: { firstName: true, lastName: true }
      })

      // Log activity
      await tx.activity.create({
        data: {
          campaignId,
          userId: session.user.id,
          type: 'VOTER_CONTACTED',
          description: `${data.contactType} contact with ${voter?.firstName} ${voter?.lastName}: ${data.result}`,
          metadata: {
            voterId,
            contactId: contact.id,
            contactType: data.contactType,
            result: data.result,
            supportLevel: data.supportLevel
          }
        }
      })

      return contact
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('[VOTER_CONTACT]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}