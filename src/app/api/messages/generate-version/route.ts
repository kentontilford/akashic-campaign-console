import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AkashicAI } from '@/lib/ai/openai-client'
import { VersionControlEngine } from '@/lib/version-control'
import { z } from 'zod'

const generateVersionSchema = z.object({
  messageId: z.string(),
  campaignId: z.string(),
  content: z.string(),
  versionProfile: z.string(),
  platform: z.string()
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = generateVersionSchema.parse(body)

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
    const ai = new AkashicAI()

    // Create a prompt to adapt the content
    const adaptationPrompt = `Please adapt the following message for the ${versionProfile.name} audience profile. 

Original message:
${validatedData.content.replace(/<[^>]*>/g, '')}

Make sure to:
1. Adjust the tone to be ${versionProfile.tone}
2. Emphasize topics that resonate with this audience: ${versionProfile.emphasis.join(', ')}
3. Use language familiar to this audience: ${versionProfile.audienceTraits.language.join(', ')}
4. Avoid topics that might alienate: ${versionProfile.avoid.join(', ')}
5. Keep the core message and call-to-action intact
6. Maintain appropriate length for ${validatedData.platform} platform

Please provide only the adapted message content without any explanation or meta-commentary.`

    // Generate adapted content
    const generatedMessage = await ai.generateMessage({
      prompt: adaptationPrompt,
      versionProfile,
      platform: validatedData.platform as any,
      campaignContext: {
        candidateName: campaignMember.campaign.candidateName,
        office: campaignMember.campaign.office,
        profile: campaignMember.campaign.profile
      }
    })

    // Log AI usage
    await prisma.activity.create({
      data: {
        campaignId: validatedData.campaignId,
        userId: session.user.id,
        type: 'VERSION_GENERATED',
        description: `generated ${versionProfile.name} version for message`,
        metadata: {
          messageId: validatedData.messageId,
          versionProfile: validatedData.versionProfile,
          tokensUsed: generatedMessage.metadata.totalTokens
        }
      }
    })

    return NextResponse.json({
      content: generatedMessage.content,
      versionProfile: versionProfile.id,
      metadata: generatedMessage.metadata
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error generating version:', error)
    return NextResponse.json(
      { error: 'Failed to generate version' },
      { status: 500 }
    )
  }
}