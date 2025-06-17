export interface VersionProfile {
  id: string
  name: string
  description: string
  tone: string
  emphasis: string[]
  avoid: string[]
  audienceTraits: {
    values: string[]
    concerns: string[]
    language: string[]
  }
  messagingAdjustments: {
    formality: number    // 1-10 scale
    technicality: number // 1-10 scale
    emotion: number      // 1-10 scale
  }
}

export class VersionControlEngine {
  static getDefaultProfiles(): VersionProfile[] {
    return [
      {
        id: 'union',
        name: 'Union',
        description: 'Labor-focused messaging for union members and supporters',
        tone: 'solidarity',
        emphasis: ['workers rights', 'fair wages', 'benefits', 'job security', 'collective bargaining'],
        avoid: ['anti-union', 'right-to-work', 'deregulation', 'corporate tax cuts'],
        audienceTraits: {
          values: ['fairness', 'solidarity', 'hard work', 'family security'],
          concerns: ['job loss', 'wage stagnation', 'healthcare costs', 'retirement security'],
          language: ['brothers and sisters', 'working families', 'fair share', 'dignity of work']
        },
        messagingAdjustments: {
          formality: 5,
          technicality: 4,
          emotion: 7
        }
      },
      {
        id: 'chamber',
        name: 'Chamber',
        description: 'Business-focused messaging for chamber of commerce members',
        tone: 'professional',
        emphasis: ['economic growth', 'business development', 'innovation', 'regulatory reform'],
        avoid: ['excessive regulation', 'tax increases', 'anti-business rhetoric'],
        audienceTraits: {
          values: ['entrepreneurship', 'free market', 'innovation', 'efficiency'],
          concerns: ['overregulation', 'tax burden', 'workforce readiness', 'economic stability'],
          language: ['business community', 'economic opportunity', 'competitive advantage', 'growth']
        },
        messagingAdjustments: {
          formality: 8,
          technicality: 7,
          emotion: 3
        }
      },
      {
        id: 'youth',
        name: 'Youth',
        description: 'Energy and change-focused messaging for younger voters',
        tone: 'energetic',
        emphasis: ['future', 'change', 'climate action', 'social justice', 'technology'],
        avoid: ['outdated references', 'patronizing language', 'status quo defense'],
        audienceTraits: {
          values: ['authenticity', 'inclusivity', 'sustainability', 'innovation'],
          concerns: ['climate change', 'student debt', 'housing costs', 'job opportunities'],
          language: ['transform', 'disrupt', 'sustainable', 'inclusive', 'authentic']
        },
        messagingAdjustments: {
          formality: 3,
          technicality: 5,
          emotion: 8
        }
      },
      {
        id: 'senior',
        name: 'Senior',
        description: 'Experience and stability-focused messaging for older voters',
        tone: 'respectful',
        emphasis: ['social security', 'medicare', 'experience', 'stability', 'tradition'],
        avoid: ['ageist language', 'rapid change rhetoric', 'technology jargon'],
        audienceTraits: {
          values: ['respect', 'tradition', 'security', 'family', 'community'],
          concerns: ['healthcare costs', 'retirement security', 'social security', 'safety'],
          language: ['protect', 'preserve', 'strengthen', 'honor', 'secure']
        },
        messagingAdjustments: {
          formality: 7,
          technicality: 3,
          emotion: 5
        }
      },
      {
        id: 'rural',
        name: 'Rural',
        description: 'Traditional values messaging for rural communities',
        tone: 'down-to-earth',
        emphasis: ['agriculture', 'small business', 'community values', 'self-reliance'],
        avoid: ['urban-centric language', 'elitist tone', 'dismissive of traditions'],
        audienceTraits: {
          values: ['community', 'faith', 'hard work', 'self-reliance', 'tradition'],
          concerns: ['rural healthcare', 'farm economy', 'small town vitality', 'broadband access'],
          language: ['neighbor', 'community', 'heartland', 'main street', 'common sense']
        },
        messagingAdjustments: {
          formality: 4,
          technicality: 3,
          emotion: 6
        }
      },
      {
        id: 'urban',
        name: 'Urban',
        description: 'Progressive values messaging for urban voters',
        tone: 'progressive',
        emphasis: ['diversity', 'innovation', 'public transit', 'cultural richness', 'equality'],
        avoid: ['suburban sprawl support', 'car-centric planning', 'homogeneous messaging'],
        audienceTraits: {
          values: ['diversity', 'innovation', 'sustainability', 'cultural vibrancy'],
          concerns: ['housing affordability', 'transit', 'inequality', 'climate change'],
          language: ['inclusive', 'sustainable', 'equitable', 'vibrant', 'progressive']
        },
        messagingAdjustments: {
          formality: 5,
          technicality: 6,
          emotion: 6
        }
      }
    ]
  }

  static buildSystemPrompt(profile: VersionProfile, campaignContext: any): string {
    const candidateProfile = campaignContext.profile || {}
    const personal = candidateProfile.personal || {}
    const political = candidateProfile.political || {}
    const campaign = candidateProfile.campaign || {}
    const communication = candidateProfile.communication || {}
    const policyPositions = candidateProfile.policyPositions || {}

    return `You are an expert political communications assistant with deep understanding of audience psychology and messaging strategy.

CANDIDATE PROFILE:
- Name: ${personal.preferredName || campaignContext.candidateName}
- Background: ${personal.currentResidence || 'Local resident'}, ${political.yearsInPolitics || 0} years in politics
- Campaign Theme: ${campaign.campaignTheme || 'Building a better future'}
- Campaign Slogan: "${campaign.campaignSlogan || 'Leadership for Tomorrow'}"
- Speaking Style: ${communication.speakingStyle || 'conversational'}
- Key Messages: ${(communication.keyMessages || []).join(', ') || 'Community, Progress, Unity'}

AUDIENCE PROFILE: ${profile.name}
Description: ${profile.description}

TONE: ${profile.tone}
- Formality Level: ${profile.messagingAdjustments.formality}/10
- Technical Complexity: ${profile.messagingAdjustments.technicality}/10
- Emotional Appeal: ${profile.messagingAdjustments.emotion}/10
- Incorporate candidate's ${communication.speakingStyle || 'conversational'} speaking style
- Emphasize: ${(communication.toneAttributes || []).join(', ') || 'authentic, caring, experienced'}

KEY TOPICS TO EMPHASIZE:
${profile.emphasis.map(topic => `- ${topic}`).join('\n')}
${policyPositions.topPriorities ? `\nCANDIDATE'S TOP PRIORITIES:\n${policyPositions.topPriorities.map((p: any) => `- ${p.issue}: ${p.position}`).join('\n')}` : ''}

TOPICS TO AVOID:
${profile.avoid.map(topic => `- ${topic}`).join('\n')}
${(communication.avoidTopics || []).length > 0 ? `\nCANDIDATE SPECIFICALLY AVOIDS:\n${communication.avoidTopics.join('\n')}` : ''}

AUDIENCE VALUES:
${profile.audienceTraits.values.map(value => `- ${value}`).join('\n')}

AUDIENCE CONCERNS:
${profile.audienceTraits.concerns.map(concern => `- ${concern}`).join('\n')}

PREFERRED LANGUAGE/PHRASES:
${profile.audienceTraits.language.map(phrase => `- "${phrase}"`).join('\n')}

CAMPAIGN CONTEXT:
- Candidate: ${campaignContext.candidateName}
- Office: ${campaignContext.office}
- Key Positions: ${JSON.stringify(campaignContext.keyPositions || {})}

${personal.languages && personal.languages.length > 1 ? `Note: Candidate speaks ${personal.languages.join(', ')}. Consider multilingual outreach when appropriate.` : ''}

INSTRUCTIONS:
1. Match the specified tone and formality level precisely
2. Emphasize topics that resonate with this audience
3. Avoid topics that might alienate this audience
4. Use language and phrases familiar to this audience
5. Adjust technical complexity based on the audience profile
6. Calibrate emotional appeal appropriately
7. Ensure all content aligns with the candidate's established positions
8. Maintain authenticity while adapting to audience preferences
9. Reflect the candidate's actual background and values as provided in their profile`
  }

  static applyVersionToContent(content: string, sourceProfile: VersionProfile, targetProfile: VersionProfile): string {
    // This is a placeholder for more sophisticated content transformation
    // In a real implementation, this would use AI to transform content
    return content
  }

  static analyzeContentForProfile(content: string, profile: VersionProfile): {
    alignment: number
    suggestions: string[]
  } {
    const alignment = Math.random() * 100 // Placeholder
    const suggestions = [
      `Consider using more ${profile.audienceTraits.language[0]} language`,
      `Emphasize ${profile.emphasis[0]} more strongly`,
      `Avoid mentioning ${profile.avoid[0]}`
    ]
    
    return { alignment, suggestions }
  }
}