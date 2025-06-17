import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  candidateName: z.string().min(1),
  office: z.string().min(1),
  district: z.string().optional(),
  party: z.string().optional(),
  electionDate: z.string().nullable().optional(),
  profile: z.any(),
  versionProfiles: z.array(z.any())
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await prisma.campaignMember.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        campaign: {
          include: {
            _count: {
              select: {
                messages: true,
                members: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createCampaignSchema.parse(body)

    // Create campaign and add user as campaign manager
    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        candidateName: validatedData.candidateName,
        office: validatedData.office,
        district: validatedData.district,
        party: validatedData.party,
        electionDate: validatedData.electionDate ? new Date(validatedData.electionDate) : null,
        profile: validatedData.profile,
        versionProfiles: validatedData.versionProfiles,
        members: {
          create: {
            userId: session.user.id,
            role: 'CAMPAIGN_MANAGER'
          }
        }
      },
      include: {
        members: true
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId: campaign.id,
        userId: session.user.id,
        type: 'CAMPAIGN_CREATED',
        description: 'created the campaign'
      }
    })

    return NextResponse.json(campaign)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}