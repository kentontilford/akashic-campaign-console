import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { z } from 'zod'
import { ActivityLogger } from '@/lib/activity-logger'

const settingsSchema = z.object({
  settings: z.object({
    notifications: z.object({
      emailOnNewMessage: z.boolean(),
      emailOnApproval: z.boolean(),
      emailOnScheduled: z.boolean()
    }),
    publishing: z.object({
      requireApproval: z.boolean(),
      autoPublish: z.boolean(),
      defaultPlatforms: z.array(z.string())
    }),
    teamPermissions: z.object({
      allowVolunteerMessaging: z.boolean(),
      allowTeamInvites: z.boolean()
    })
  })
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update campaign settings
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId: params.id,
        userId: session.user.id,
        role: {
          in: [UserRole.CANDIDATE, UserRole.CAMPAIGN_MANAGER, UserRole.ADMIN]
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update campaign settings' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { settings } = settingsSchema.parse(body)

    // Update campaign settings
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        settings: settings as any // Prisma Json type
      }
    })

    // Log activity
    await ActivityLogger.logActivity({
      campaignId: params.id,
      userId: session.user.id,
      type: 'CAMPAIGN_UPDATED',
      description: 'updated campaign settings',
      metadata: {
        settingsUpdated: Object.keys(settings)
      }
    })

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating campaign settings:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign settings' },
      { status: 500 }
    )
  }
}