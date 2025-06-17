import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AkashicAI } from '@/lib/ai/openai-client'
import { VersionControlEngine } from '@/lib/version-control'
import { z } from 'zod'

const generateMessageSchema = z.object({
  prompt: z.string().min(1),
  campaignId: z.string().min(1),
  versionProfile: z.string().min(1),
  platform: z.string().min(1)
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = generateMessageSchema.parse(body)

    // Verify user has access to the campaign
    const campaignMember = await prisma.campaignMember.findFirst({
      where: {
        campaignId: validatedData.campaignId,
        userId: session.user.id
      },
      include: {
        campaign: true
      }
    })

    if (!campaignMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the version profile
    const versionProfile = VersionControlEngine.getDefaultProfiles().find(
      profile => profile.id === validatedData.versionProfile
    )

    if (!versionProfile) {
      return NextResponse.json({ error: 'Invalid version profile' }, { status: 400 })
    }

    // Initialize AI client
    let ai: AkashicAI
    try {
      ai = new AkashicAI()
    } catch (error) {
      console.error('AI initialization error:', error)
      return NextResponse.json(
        { 
          error: 'AI service not configured', 
          details: 'Please ensure OPENAI_API_KEY is set in your environment variables' 
        },
        { status: 503 }
      )
    }

    // Generate content
    let generatedMessage
    try {
      generatedMessage = await ai.generateMessage({
        prompt: validatedData.prompt,
        versionProfile,
        platform: validatedData.platform as any,
        campaignContext: {
          candidateName: campaignMember.campaign.candidateName,
          office: campaignMember.campaign.office,
          profile: campaignMember.campaign.profile
        }
      })
    } catch (error: any) {
      console.error('AI generation error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to generate content', 
          details: error.message || 'An error occurred while generating content'
        },
        { status: 500 }
      )
    }

    // Log AI usage
    await prisma.activity.create({
      data: {
        campaignId: validatedData.campaignId,
        userId: session.user.id,
        type: 'AI_CONTENT_GENERATED',
        description: 'generated content using AI',
        metadata: {
          prompt: validatedData.prompt,
          versionProfile: validatedData.versionProfile,
          platform: validatedData.platform,
          tokensUsed: generatedMessage.metadata.totalTokens
        }
      }
    })

    return NextResponse.json({
      content: generatedMessage.content,
      title: generatedMessage.title,
      metadata: generatedMessage.metadata
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}