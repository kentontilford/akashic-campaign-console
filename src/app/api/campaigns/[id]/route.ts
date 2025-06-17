import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this campaign
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId: params.id,
        userId: session.user.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            messages: true,
            members: true
          }
        }
      }
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only candidates and campaign managers can delete campaigns
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
        { error: 'Insufficient permissions to delete campaign' },
        { status: 403 }
      )
    }

    // Delete campaign (this will cascade delete all related data)
    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}