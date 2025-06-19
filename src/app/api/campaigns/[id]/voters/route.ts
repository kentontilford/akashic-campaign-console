import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const searchSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  party: z.string().optional(),
  supportLevel: z.string().optional(),
  hasPhone: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  registrationStatus: z.string().optional(),
  ageMin: z.number().optional(),
  ageMax: z.number().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().default(1),
  limit: z.number().min(1).max(100).default(50),
  sort: z.enum(['name', 'updated', 'support', 'city']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc')
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

    // Parse search params
    const { searchParams } = new URL(req.url)
    const filters = searchSchema.parse({
      search: searchParams.get('search'),
      city: searchParams.get('city'),
      zip: searchParams.get('zip'),
      party: searchParams.get('party'),
      supportLevel: searchParams.get('supportLevel'),
      hasPhone: searchParams.get('hasPhone') === 'true',
      hasEmail: searchParams.get('hasEmail') === 'true',
      registrationStatus: searchParams.get('registrationStatus'),
      ageMin: searchParams.get('ageMin') ? parseInt(searchParams.get('ageMin')!) : undefined,
      ageMax: searchParams.get('ageMax') ? parseInt(searchParams.get('ageMax')!) : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      sort: searchParams.get('sort') as any || 'name',
      order: searchParams.get('order') as any || 'asc'
    })

    // Build where clause
    const where: any = { campaignId }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } }
      ]
    }

    if (filters.city) {
      where.resCity = { equals: filters.city, mode: 'insensitive' }
    }

    if (filters.zip) {
      where.resZip = { startsWith: filters.zip }
    }

    if (filters.party) {
      where.partyAffiliation = filters.party
    }

    if (filters.supportLevel) {
      where.supportLevel = filters.supportLevel
    }

    if (filters.hasPhone) {
      where.phone = { not: null }
    }

    if (filters.hasEmail) {
      where.email = { not: null }
    }

    if (filters.registrationStatus) {
      where.registrationStatus = filters.registrationStatus
    }

    if (filters.ageMin || filters.ageMax) {
      where.age = {}
      if (filters.ageMin) where.age.gte = filters.ageMin
      if (filters.ageMax) where.age.lte = filters.ageMax
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: { in: filters.tags }
        }
      }
    }

    // Build orderBy
    const orderBy: any = {}
    switch (filters.sort) {
      case 'name':
        orderBy.lastName = filters.order
        break
      case 'updated':
        orderBy.updatedAt = filters.order
        break
      case 'support':
        orderBy.supportLevel = filters.order
        break
      case 'city':
        orderBy.resCity = filters.order
        break
    }

    // Get total count
    const total = await prisma.voter.count({ where })

    // Get voters with pagination
    const voters = await prisma.voter.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        tags: {
          select: { tag: true }
        },
        contactHistory: {
          orderBy: { contactDate: 'desc' },
          take: 1,
          select: {
            contactType: true,
            contactDate: true,
            result: true
          }
        },
        votingHistory: {
          orderBy: { electionDate: 'desc' },
          take: 5,
          select: {
            electionDate: true,
            electionType: true
          }
        }
      }
    })

    // Get aggregated stats
    const stats = await prisma.voter.groupBy({
      by: ['supportLevel'],
      where: { campaignId },
      _count: true
    })

    const supportStats = stats.reduce((acc, stat) => {
      acc[stat.supportLevel || 'unknown'] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      voters,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      },
      stats: {
        total,
        support: supportStats,
        withPhone: await prisma.voter.count({ 
          where: { campaignId, phone: { not: null } } 
        }),
        withEmail: await prisma.voter.count({ 
          where: { campaignId, email: { not: null } } 
        })
      }
    })

  } catch (error: any) {
    console.error('[VOTERS_LIST]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}