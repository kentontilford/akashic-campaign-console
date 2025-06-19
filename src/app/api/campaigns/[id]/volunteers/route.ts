import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createVolunteerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(10),
  phoneType: z.enum(['MOBILE', 'HOME', 'WORK']).optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(5),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  source: z.enum(['WEBSITE', 'EVENT', 'REFERRAL', 'WALKIN', 'IMPORT']),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  hasVehicle: z.boolean().optional(),
  canHost: z.boolean().optional(),
  availability: z.any().optional(),
  preferredTasks: z.array(z.string()).optional(),
  maxHoursPerWeek: z.number().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

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

    // Parse query params
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const skill = searchParams.get('skill')
    const hasUpcomingShift = searchParams.get('hasUpcomingShift') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = { campaignId }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (skill) {
      where.skills = { has: skill }
    }

    // Get volunteers with counts
    const [volunteers, total] = await Promise.all([
      prisma.volunteer.findMany({
        where,
        include: {
          _count: {
            select: {
              shifts: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.volunteer.count({ where })
    ])

    // Get stats
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [activeCount, new30Days, skillCounts] = await Promise.all([
      prisma.volunteer.count({
        where: { campaignId, status: 'ACTIVE' }
      }),
      prisma.volunteer.count({
        where: {
          campaignId,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.$queryRaw<{ skill: string; count: bigint }[]>`
        SELECT skill, COUNT(*) as count
        FROM (
          SELECT unnest(skills) as skill
          FROM "Volunteer"
          WHERE "campaignId" = ${campaignId}
        ) as skills
        GROUP BY skill
        ORDER BY count DESC
        LIMIT 10
      `
    ])

    // Calculate total hours (simplified - you'd want to aggregate from shifts)
    const totalHours = await prisma.volunteerShift.aggregate({
      where: {
        volunteer: { campaignId },
        status: 'COMPLETED'
      },
      _sum: {
        hoursWorked: true
      }
    })

    const stats = {
      total,
      active: activeCount,
      new30Days,
      totalHours: totalHours._sum.hoursWorked?.toNumber() || 0,
      topSkills: skillCounts.map(s => ({
        skill: s.skill,
        count: Number(s.count)
      }))
    }

    return NextResponse.json({
      volunteers,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('[VOLUNTEERS_LIST]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

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
    const data = createVolunteerSchema.parse(body)

    // Check for duplicate email
    const existing = await prisma.volunteer.findUnique({
      where: {
        campaignId_email: {
          campaignId,
          email: data.email
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A volunteer with this email already exists' },
        { status: 400 }
      )
    }

    // Create volunteer
    const volunteer = await prisma.volunteer.create({
      data: {
        ...data,
        campaignId,
        createdById: session.user.id,
        skills: data.skills || [],
        languages: data.languages || ['English'],
        preferredTasks: data.preferredTasks || [],
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'VOLUNTEER_ADDED',
        description: `Added volunteer ${volunteer.firstName} ${volunteer.lastName}`,
        metadata: {
          volunteerId: volunteer.id,
          source: data.source
        }
      }
    })

    return NextResponse.json(volunteer, { status: 201 })

  } catch (error: any) {
    console.error('[VOLUNTEER_CREATE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}