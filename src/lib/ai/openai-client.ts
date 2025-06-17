import OpenAI from 'openai'
import { VersionProfile, VersionControlEngine } from '@/lib/version-control'
import { Platform } from '@prisma/client'

export interface MessageGenerationParams {
  prompt: string
  versionProfile: VersionProfile
  platform: Platform
  campaignContext: {
    candidateName: string
    office: string
    profile?: any
  }
}

export interface GeneratedMessage {
  content: string
  title?: string
  metadata: {
    model: string
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class AkashicAI {
  private openai: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured. Please add it to your .env file.')
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async generateMessage(params: MessageGenerationParams): Promise<GeneratedMessage> {
    const { prompt, versionProfile, platform, campaignContext } = params
    
    const systemPrompt = VersionControlEngine.buildSystemPrompt(versionProfile, campaignContext)
    const userPrompt = this.buildUserPrompt(prompt, platform)
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: this.getMaxTokensForPlatform(platform)
    })

    const content = response.choices[0]?.message?.content || ''
    
    return {
      content,
      title: this.extractTitle(content, platform),
      metadata: {
        model: response.model,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    }
  }

  private buildUserPrompt(prompt: string, platform: Platform): string {
    const platformInstructions = this.getPlatformInstructions(platform)
    
    return `${prompt}

Platform: ${platform}
${platformInstructions}

Please generate content that follows these platform requirements while maintaining the audience profile guidelines.`
  }

  private getPlatformInstructions(platform: Platform): string {
    const instructions: Record<Platform, string> = {
      [Platform.EMAIL]: `Email Requirements:
- Include a compelling subject line (first line)
- Personal greeting
- Clear call-to-action
- Professional sign-off
- Keep under 500 words for optimal engagement`,
      
      [Platform.TWITTER]: `Twitter Requirements:
- Maximum 280 characters
- Include relevant hashtags
- Engaging and shareable
- Consider thread potential for complex topics`,
      
      [Platform.FACEBOOK]: `Facebook Requirements:
- Engaging opening line
- 1-3 paragraphs optimal
- Conversational tone
- Include call for engagement (likes, shares, comments)`,
      
      [Platform.INSTAGRAM]: `Instagram Requirements:
- Caption should be visual-first
- Use line breaks for readability
- Include relevant hashtags at end
- Call-to-action for profile link`,
      
      [Platform.PRESS_RELEASE]: `Press Release Requirements:
- FOR IMMEDIATE RELEASE header
- Compelling headline
- Location and date dateline
- Inverted pyramid structure
- Boilerplate paragraph at end
- Contact information`,
      
      [Platform.WEBSITE]: `Website Content Requirements:
- SEO-friendly headline
- Clear structure with subheadings
- Scannable paragraphs
- Include relevant keywords naturally`,
      
      [Platform.SMS]: `SMS Requirements:
- Maximum 160 characters
- Direct and urgent tone
- Clear call-to-action
- Include opt-out instructions`
    }
    
    return instructions[platform] || 'Generate appropriate content for this platform.'
  }

  private getMaxTokensForPlatform(platform: Platform): number {
    const limits: Partial<Record<Platform, number>> = {
      [Platform.TWITTER]: 100,
      [Platform.SMS]: 80,
      [Platform.EMAIL]: 800,
      [Platform.PRESS_RELEASE]: 1000,
      [Platform.WEBSITE]: 1200
    }
    
    return limits[platform] || 600
  }

  private extractTitle(content: string, platform: Platform): string | undefined {
    if (platform === Platform.EMAIL) {
      // First line is typically the subject line
      const firstLine = content.split('\n')[0]
      return firstLine.replace(/^Subject:\s*/i, '').trim()
    }
    
    if (platform === Platform.PRESS_RELEASE) {
      // Look for headline after FOR IMMEDIATE RELEASE
      const lines = content.split('\n')
      const headlineIndex = lines.findIndex(line => 
        line.includes('FOR IMMEDIATE RELEASE')
      )
      if (headlineIndex >= 0 && lines[headlineIndex + 1]) {
        return lines[headlineIndex + 1].trim()
      }
    }
    
    // For other platforms, use first 50 characters
    return content.substring(0, 50) + (content.length > 50 ? '...' : '')
  }

  async improveMessage(
    content: string, 
    improvements: string[], 
    versionProfile: VersionProfile,
    campaignContext: any
  ): Promise<GeneratedMessage> {
    const systemPrompt = VersionControlEngine.buildSystemPrompt(versionProfile, campaignContext)
    
    const userPrompt = `Please improve the following message based on these suggestions:

Original Message:
${content}

Suggested Improvements:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

Please provide an improved version that addresses these suggestions while maintaining the audience profile guidelines.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    return {
      content: response.choices[0]?.message?.content || '',
      metadata: {
        model: response.model,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    }
  }
}