export interface CandidateProfile {
  // Personal Information
  personal: {
    fullName: string
    preferredName: string
    dateOfBirth: string
    placeOfBirth: string
    currentResidence: string
    maritalStatus: string
    children: number
    religion?: string
    languages: string[]
    photo?: string
  }

  // Political Background
  political: {
    party: string
    yearsInPolitics: number
    previousOffices: {
      title: string
      organization: string
      startYear: number
      endYear: number
      achievements: string[]
    }[]
    politicalPhilosophy: string
    keyEndorsements: {
      name: string
      title: string
      organization: string
      quote?: string
    }[]
  }

  // Professional Background
  professional: {
    currentOccupation: string
    education: {
      degree: string
      institution: string
      graduationYear: number
      honors?: string
    }[]
    workExperience: {
      title: string
      company: string
      startYear: number
      endYear?: number
      description: string
    }[]
    militaryService?: {
      branch: string
      rank: string
      years: string
      honors: string[]
    }
    professionalAchievements: string[]
  }

  // Campaign Details
  campaign: {
    office: string
    jurisdiction: string
    district?: string
    electionDate: string
    primaryDate?: string
    campaignWebsite?: string
    campaignTheme: string
    campaignSlogan: string
    headquarters: {
      address: string
      phone: string
      email: string
    }
  }

  // Policy Positions
  policyPositions: {
    topPriorities: {
      issue: string
      position: string
      keyPoints: string[]
    }[]
    economicPolicy: {
      taxation: string
      spending: string
      jobCreation: string
      businessRegulation: string
    }
    socialPolicy: {
      healthcare: string
      education: string
      socialSecurity: string
      immigration: string
      gunControl: string
      abortion: string
      lgbtqRights: string
    }
    environmentalPolicy: {
      climateChange: string
      energyPolicy: string
      conservation: string
    }
    foreignPolicy: {
      defense: string
      trade: string
      alliances: string
    }
  }

  // Community Involvement
  community: {
    organizations: {
      name: string
      role: string
      yearsActive: string
    }[]
    volunteerWork: string[]
    awards: {
      name: string
      organization: string
      year: number
      description: string
    }[]
    localConnections: string[]
  }

  // Communication Preferences
  communication: {
    speakingStyle: string // formal, conversational, inspirational, direct
    keyMessages: string[]
    toneAttributes: string[] // compassionate, strong, experienced, innovative
    avoidTopics: string[]
    preferredPlatforms: string[]
  }

  // Opposition Research
  opposition: {
    opponents: {
      name: string
      party: string
      strengths: string[]
      weaknesses: string[]
      keyDifferences: string[]
    }[]
    vulnerabilities: string[]
    responseStrategies: string[]
  }

  // Fundraising
  fundraising: {
    goalAmount: number
    currentAmount: number
    majorDonors: {
      category: string // individual, PAC, organization
      count: number
    }[]
    fundraisingEvents: {
      type: string
      targetAmount: number
      date: string
    }[]
  }

  // Demographics & Analytics
  demographics: {
    districtPopulation: number
    registeredVoters: number
    historicalTurnout: number
    keyDemographics: {
      group: string
      percentage: number
      leanings: string // supportive, opposed, swing
    }[]
    previousElectionResults: {
      year: number
      winner: string
      margin: number
    }[]
  }
}