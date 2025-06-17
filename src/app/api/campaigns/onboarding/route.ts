import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { ActivityLogger } from '@/lib/activity-logger'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, candidateName, office, district, party, electionDate, profile, description } = body

    // Create campaign with comprehensive profile
    const campaign = await prisma.campaign.create({
      data: {
        name,
        candidateName,
        office,
        district,
        party,
        electionDate: electionDate ? new Date(electionDate) : null,
        description,
        profile: profile, // Store the entire candidate profile as JSON
        // Initialize with default version profiles
        versionProfiles: {
          union: { enabled: true },
          chamber: { enabled: true },
          youth: { enabled: true },
          senior: { enabled: true },
          rural: { enabled: true },
          urban: { enabled: true }
        },
        settings: {
          notifications: {
            emailOnNewMessage: true,
            emailOnApproval: true,
            emailOnScheduled: false
          },
          publishing: {
            requireApproval: true,
            autoPublish: false,
            defaultPlatforms: ['EMAIL']
          },
          teamPermissions: {
            allowVolunteerMessaging: false,
            allowTeamInvites: true
          }
        },
        members: {
          create: {
            userId: session.user.id,
            role: UserRole.CANDIDATE
          }
        }
      },
      include: {
        members: true
      }
    })

    // Log activity
    await ActivityLogger.logActivity({
      campaignId: campaign.id,
      userId: session.user.id,
      type: 'CAMPAIGN_CREATED',
      description: 'created campaign through comprehensive onboarding',
      metadata: {
        candidateName,
        office,
        hasComprehensiveProfile: true
      }
    })

    // Create welcome message template
    await prisma.messageTemplate.create({
      data: {
        campaignId: campaign.id,
        createdById: session.user.id,
        name: 'Welcome Message',
        description: 'Introduction message for new supporters',
        platform: 'EMAIL',
        category: 'announcement',
        content: `<p>Dear Friend,</p>
<p>Thank you for your interest in our campaign for ${office}. I'm ${candidateName}, and I'm running because ${profile.campaign?.campaignTheme || 'I believe in building a better future for our community'}.</p>
<p>Together, we can make a difference. I look forward to earning your support.</p>
<p>Best regards,<br>${profile.personal?.preferredName || candidateName}</p>`,
        isGlobal: false
      }
    })

    return NextResponse.json({ 
      campaign,
      message: 'Campaign created successfully with comprehensive profile'
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}