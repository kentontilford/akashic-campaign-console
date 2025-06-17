import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

interface BetaTester {
  name: string
  email: string
  password: string
  role: UserRole
}

// Configure beta testers here
const BETA_TESTERS: BetaTester[] = [
  {
    name: 'Simon Demo',
    email: 'simon@akashic.com',
    password: 'SimonBeta2024!',
    role: 'CAMPAIGN_MANAGER'
  },
  {
    name: 'Eric Demo',
    email: 'eric@akashic.com',
    password: 'EricBeta2024!',
    role: 'CAMPAIGN_MANAGER'
  },
  {
    name: 'Hossein Demo',
    email: 'hossein@akashic.com',
    password: 'HosseinBeta2024!',
    role: 'CAMPAIGN_MANAGER'
  }
]

async function setupBetaUsers() {
  console.log('🚀 Setting up beta testing accounts...\n')

  for (const tester of BETA_TESTERS) {
    try {
      const hashedPassword = await hash(tester.password, 12)
      
      const user = await prisma.user.upsert({
        where: { email: tester.email },
        update: {
          name: tester.name,
          role: tester.role
        },
        create: {
          email: tester.email,
          name: tester.name,
          password: hashedPassword,
          role: tester.role,
          emailVerified: new Date()
        }
      })

      console.log(`✅ Created/Updated user: ${tester.name} (${tester.email})`)
      
      // Create a demo campaign for each user
      const campaign = await prisma.campaign.upsert({
        where: {
          id: `demo-${user.id}`
        },
        update: {},
        create: {
          id: `demo-${user.id}`,
          name: `${tester.name.split(' ')[0]}'s Demo Campaign`,
          candidateName: `Demo Candidate for ${tester.name}`,
          office: 'U.S. Senate',
          district: 'Statewide',
          party: 'Democratic',
          electionDate: new Date('2024-11-05'),
          description: 'Beta testing campaign for Akashic Intelligence platform',
          profile: {
            personal: {
              fullName: `Demo Candidate ${tester.name}`,
              preferredName: tester.name.split(' ')[0],
              dateOfBirth: '1970-01-01',
              placeOfBirth: 'Demo City, USA',
              currentResidence: 'Demo State, USA',
              maritalStatus: 'married',
              children: 2,
              languages: ['English', 'Spanish']
            },
            campaign: {
              office: 'U.S. Senate',
              jurisdiction: 'State',
              electionDate: '2024-11-05',
              campaignTheme: 'Building a Better Tomorrow',
              campaignSlogan: 'Leadership for the Future',
              headquarters: {
                address: '123 Campaign St, Demo City, DS 12345',
                phone: '555-0123',
                email: `campaign@${tester.email.split('@')[0]}.com`
              }
            },
            communication: {
              speakingStyle: 'conversational',
              keyMessages: [
                'Economic opportunity for all',
                'Healthcare is a human right',
                'Education transforms lives'
              ],
              toneAttributes: ['authentic', 'compassionate', 'experienced'],
              avoidTopics: [],
              preferredPlatforms: ['EMAIL', 'FACEBOOK', 'TWITTER']
            }
          },
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
            }
          },
          members: {
            create: {
              userId: user.id,
              role: tester.role
            }
          }
        }
      })

      console.log(`   📊 Created demo campaign: ${campaign.name}`)

      // Create sample messages
      const sampleMessages = [
        {
          title: 'Campaign Launch Announcement',
          content: '<p>Friends and neighbors,</p><p>I am excited to announce my candidacy for the United States Senate. Together, we can build a better future for our state and our nation.</p><p>Join us in this journey!</p>',
          platform: 'EMAIL' as const
        },
        {
          title: 'Healthcare Policy Position',
          content: '<p>Healthcare is a fundamental right, not a privilege. My plan ensures every American has access to quality, affordable healthcare.</p>',
          platform: 'TWITTER' as const
        }
      ]

      for (const messageData of sampleMessages) {
        await prisma.message.create({
          data: {
            campaignId: campaign.id,
            authorId: user.id,
            title: messageData.title,
            content: messageData.content,
            platform: messageData.platform,
            status: 'DRAFT'
          }
        })
      }

      console.log(`   ✉️  Created ${sampleMessages.length} sample messages\n`)

    } catch (error) {
      console.error(`❌ Error creating user ${tester.email}:`, error)
    }
  }

  console.log('\n📋 Beta Testing Credentials:\n')
  console.log('================================')
  for (const tester of BETA_TESTERS) {
    console.log(`${tester.name}:`)
    console.log(`  Email: ${tester.email}`)
    console.log(`  Password: ${tester.password}`)
    console.log(`  Role: ${tester.role}`)
    console.log('--------------------------------')
  }

  console.log('\n✅ Beta testing setup complete!')
  console.log('\n🔗 Share these URLs with testers:')
  console.log('  - Login: https://your-domain.com/login')
  console.log('  - After login → Dashboard: /dashboard')
  console.log('  - Election Mapping: /mapping')
  console.log('  - Their Campaign: /campaigns/[id]')
}

// Run setup
setupBetaUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())