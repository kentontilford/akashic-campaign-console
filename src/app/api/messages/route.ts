import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { MessageStatus, Platform, ApprovalTier } from '@prisma/client'
import { ActivityLogger } from '@/lib/activity-logger'

const createMessageSchema = z.object({
  campaignId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  platform: z.nativeEnum(Platform),
  status: z.nativeEnum(MessageStatus),
  versionProfileId: z.string().optional()
})

// Simple content analysis for approval routing
function analyzeContentForApproval(content: string): {
  tier: ApprovalTier
  analysis: any
} {
  const contentLower = content.toLowerCase()
  
  // High risk keywords that require full review
  const highRiskKeywords = [
    'crisis', 'scandal', 'opponent', 'attack', 'lawsuit', 
    'investigation', 'controversial', 'allegation'
  ]
  
  // Medium risk keywords that need quick review
  const mediumRiskKeywords = [
    'donate', 'contribution', 'fundraising', 'money', 
    'poll', 'survey', 'endorsement', 'debate'
  ]
  
  const hasHighRisk = highRiskKeywords.some(keyword => contentLower.includes(keyword))
  const hasMediumRisk = mediumRiskKeywords.some(keyword => contentLower.includes(keyword))
  
  let tier: ApprovalTier = ApprovalTier.GREEN
  const riskFactors = []
  
  if (hasHighRisk) {
    tier = ApprovalTier.RED
    riskFactors.push('Contains sensitive political content')
  } else if (hasMediumRisk) {
    tier = ApprovalTier.YELLOW
    riskFactors.push('Contains fundraising or political messaging')
  }
  
  // Check for FEC compliance keywords
  if (contentLower.includes('donate') || contentLower.includes('contribution')) {
    riskFactors.push('Requires FEC compliance review')
  }
  
  return {
    tier,
    analysis: {
      riskFactors,
      wordCount: content.split(' ').length,
      hasLinks: content.includes('http'),
      sentiment: 'neutral', // Placeholder for sentiment analysis
      confidence: 0.85
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')

    const whereClause: any = {
      campaign: {
        members: {
          some: { userId: session.user.id }
        }
      }
    }

    if (campaignId) {
      whereClause.campaignId = campaignId
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        campaign: true,
        author: true,
        versions: true,
        approvals: {
          include: {
            approvedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
    const validatedData = createMessageSchema.parse(body)

    // Verify user has access to the campaign
    const campaignMember = await prisma.campaignMember.findFirst({
      where: {
        campaignId: validatedData.campaignId,
        userId: session.user.id
      }
    })

    if (!campaignMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Analyze content for approval routing
    const { tier, analysis } = analyzeContentForApproval(validatedData.content)

    // Create message
    const message = await prisma.message.create({
      data: {
        campaignId: validatedData.campaignId,
        authorId: session.user.id,
        title: validatedData.title,
        content: validatedData.content,
        platform: validatedData.platform,
        status: validatedData.status,
        approvalTier: tier,
        approvalAnalysis: analysis,
        aiGenerated: false // Will be true when generated via AI
      },
      include: {
        campaign: true,
        author: true
      }
    })

    // Create initial version if versionProfileId provided
    if (validatedData.versionProfileId) {
      await prisma.messageVersion.create({
        data: {
          messageId: message.id,
          versionProfile: validatedData.versionProfileId,
          content: validatedData.content,
          createdById: session.user.id
        }
      })
    }

    // Log activity
    await ActivityLogger.messageCreated(
      validatedData.campaignId,
      session.user.id,
      message.title,
      message.id
    )

    return NextResponse.json(message)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}