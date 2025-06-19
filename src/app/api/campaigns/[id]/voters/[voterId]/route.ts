import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateVoterSchema = z.object({
  phone: z.string().optional().nullable(),
  phoneType: z.enum(['MOBILE', 'LANDLINE', 'VOIP']).optional().nullable(),
  email: z.string().email().optional().nullable(),
  supportLevel: z.enum([
    'STRONG_SUPPORT', 
    'LEAN_SUPPORT', 
    'UNDECIDED', 
    'LEAN_OPPOSE', 
    'STRONG_OPPOSE'
  ]).optional().nullable(),
  volunteerStatus: z.boolean().optional(),
  donorStatus: z.boolean().optional(),
  doNotContact: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
})

export async function GET(
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

    // Get voter with all related data
    const voter = await prisma.voter.findFirst({
      where: {
        id: voterId,
        campaignId
      },
      include: {
        votingHistory: {
          orderBy: { electionDate: 'desc' }
        },
        contactHistory: {
          orderBy: { contactDate: 'desc' },
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        tags: {
          include: {
            createdBy: {
              select: { name: true }
            }
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    if (!voter) {
      return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
    }

    return NextResponse.json(voter)

  } catch (error: any) {
    console.error('[VOTER_DETAIL]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
        userId: session.user.id,
        role: { in: ['CAMPAIGN_MANAGER', 'ADMIN', 'FIELD_DIRECTOR', 'VOLUNTEER'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const data = updateVoterSchema.parse(body)

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update voter
      const voter = await tx.voter.update({
        where: {
          id: voterId,
          campaignId
        },
        data: {
          phone: data.phone,
          phoneType: data.phoneType,
          email: data.email,
          supportLevel: data.supportLevel,
          volunteerStatus: data.volunteerStatus,
          donorStatus: data.donorStatus,
          doNotContact: data.doNotContact,
          updatedAt: new Date()
        }
      })

      // Update tags if provided
      if (data.tags !== undefined) {
        // Remove existing tags
        await tx.voterTag.deleteMany({
          where: { voterId }
        })

        // Add new tags
        if (data.tags.length > 0) {
          await tx.voterTag.createMany({
            data: data.tags.map(tag => ({
              voterId,
              tag,
              createdById: session.user.id
            }))
          })
        }
      }

      // Add note if provided
      if (data.notes) {
        await tx.voterNote.create({
          data: {
            voterId,
            note: data.notes,
            createdById: session.user.id
          }
        })
      }

      // Log activity
      await tx.activity.create({
        data: {
          campaignId,
          userId: session.user.id,
          type: 'VOTER_UPDATED',
          description: `Updated voter ${voter.firstName} ${voter.lastName}`,
          metadata: {
            voterId,
            changes: data
          }
        }
      })

      return voter
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('[VOTER_UPDATE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}