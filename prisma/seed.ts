import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { VersionControlEngine } from '../src/lib/version-control'

const prisma = new PrismaClient()

async function main() {
  // Create a demo admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@akashic.com' },
    update: {},
    create: {
      email: 'admin@akashic.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  // Create a demo campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: 'demo-campaign' },
    update: {},
    create: {
      id: 'demo-campaign',
      name: 'Demo Campaign 2024',
      description: 'A demonstration campaign for Akashic Intelligence',
      candidateName: 'Jane Smith',
      office: 'U.S. Senate',
      district: 'State-wide',
      party: 'Democrat',
      electionDate: new Date('2024-11-05'),
      profile: {
        basic: {
          age: 45,
          background: ['Business owner', 'Community organizer', 'Former city council'],
          strengths: ['Economic development', 'Healthcare', 'Education'],
          vulnerabilities: ['First-time federal candidate', 'Limited name recognition'],
        },
        policy: {
          economy: { position: 'moderate', details: 'Focus on small business growth' },
          healthcare: { position: 'progressive', details: 'Expand Medicare options' },
          education: { position: 'progressive', details: 'Increase teacher pay, reduce student debt' },
        },
        communication: {
          tone: 'conversational',
          complexity: 'moderate',
          preferredTopics: ['jobs', 'healthcare', 'education'],
          avoidTopics: ['controversial social issues'],
        },
      },
      versionProfiles: {
        union: { enabled: true },
        chamber: { enabled: true },
        youth: { enabled: true },
        senior: { enabled: true },
        rural: { enabled: true },
        urban: { enabled: true }
      },
    },
  })

  // Add admin to campaign
  await prisma.campaignMember.upsert({
    where: {
      userId_campaignId: {
        userId: admin.id,
        campaignId: campaign.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      campaignId: campaign.id,
      role: 'CAMPAIGN_MANAGER',
    },
  })

  console.log('Seed data created successfully')
  console.log('Demo login: admin@akashic.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })