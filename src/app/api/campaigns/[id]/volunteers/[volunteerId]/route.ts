import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateVolunteerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  preferredName: z.string().optional().nullable(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  phoneType: z.enum(['MOBILE', 'HOME', 'WORK']).optional().nullable(),
  address1: z.string().min(1).optional(),
  address2: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  state: z.string().length(2).optional(),
  zip: z.string().min(5).optional(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  employer: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  hasVehicle: z.boolean().optional(),
  canHost: z.boolean().optional(),
  availability: z.any().optional().nullable(),
  preferredTasks: z.array(z.string()).optional(),
  maxHoursPerWeek: z.number().optional().nullable(),
  backgroundCheckStatus: z.enum(['PENDING', 'CLEARED', 'FAILED']).optional().nullable(),
  backgroundCheckDate: z.string().optional().nullable(),
  emergencyName: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  emergencyRelation: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  flags: z.array(z.string()).optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; volunteerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId, volunteerId } = params

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

    // Get volunteer with all related data
    const volunteer = await prisma.volunteer.findFirst({
      where: {
        id: volunteerId,
        campaignId
      },
      include: {
        shifts: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            event: true
          }
        },
        activities: {
          orderBy: { date: 'desc' },
          take: 20
        },
        eventAttendance: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            event: true
          }
        },
        teamMemberships: {
          include: {
            leader: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        trainings: {
          orderBy: { completedDate: 'desc' }
        },
        _count: {
          select: {
            shifts: true,
            activities: true,
            phoneContacts: true,
            assignments: true
          }
        }
      }
    })

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    // Calculate additional stats
    const stats = await prisma.volunteerShift.aggregate({
      where: {
        volunteerId,
        status: 'COMPLETED'
      },
      _sum: {
        hoursWorked: true
      },
      _count: true
    })

    const volunteerWithStats = {
      ...volunteer,
      totalHours: stats._sum.hoursWorked?.toNumber() || 0,
      completedShifts: stats._count
    }

    return NextResponse.json(volunteerWithStats)

  } catch (error: any) {
    console.error('[VOLUNTEER_DETAIL]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; volunteerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId, volunteerId } = params

    // Check campaign access
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id,
        role: { in: ['CAMPAIGN_MANAGER', 'FIELD_DIRECTOR', 'ADMIN'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const data = updateVolunteerSchema.parse(body)

    // Check if email is being changed and is unique
    if (data.email) {
      const existing = await prisma.volunteer.findFirst({
        where: {
          campaignId,
          email: data.email,
          id: { not: volunteerId }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'A volunteer with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Update volunteer
    const volunteer = await prisma.volunteer.update({
      where: {
        id: volunteerId,
        campaignId
      },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        backgroundCheckDate: data.backgroundCheckDate ? new Date(data.backgroundCheckDate) : undefined,
        updatedAt: new Date()
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'VOLUNTEER_UPDATED',
        description: `Updated volunteer ${volunteer.firstName} ${volunteer.lastName}`,
        metadata: {
          volunteerId: volunteer.id,
          changes: Object.keys(data)
        }
      }
    })

    return NextResponse.json(volunteer)

  } catch (error: any) {
    console.error('[VOLUNTEER_UPDATE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; volunteerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId, volunteerId } = params

    // Check campaign access (only OWNER or ADMIN can delete)
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

    // Get volunteer name for activity log
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      select: { firstName: true, lastName: true }
    })

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    // Delete volunteer (cascades to related records)
    await prisma.volunteer.delete({
      where: {
        id: volunteerId,
        campaignId
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'VOLUNTEER_DELETED',
        description: `Deleted volunteer ${volunteer.firstName} ${volunteer.lastName}`,
        metadata: {
          volunteerId
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[VOLUNTEER_DELETE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}