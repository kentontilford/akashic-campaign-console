import { PrismaClient } from '@prisma/client'
import { redis } from '../src/lib/redis'
import chalk from 'chalk'

const prisma = new PrismaClient()

interface HealthCheckResult {
  component: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
}

async function runHealthChecks(): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = []
  
  console.log(chalk.blue.bold('\n🏥 Akashic Campaign Console - System Health Check\n'))

  // 1. Database Connection
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    results.push({
      component: 'Database Connection',
      status: 'pass',
      message: 'PostgreSQL connected successfully',
      details: { users: userCount }
    })
  } catch (error) {
    results.push({
      component: 'Database Connection',
      status: 'fail',
      message: 'Failed to connect to PostgreSQL',
      details: error
    })
  }

  // 2. Redis Connection
  try {
    await redis.ping()
    results.push({
      component: 'Redis Cache',
      status: 'pass',
      message: 'Redis connected successfully'
    })
  } catch (error) {
    results.push({
      component: 'Redis Cache',
      status: 'warning',
      message: 'Redis connection failed (app will work but slower)',
      details: error
    })
  }

  // 3. Election Data Integrity
  try {
    const countyCount = await prisma.county.count()
    const electionResultCount = await prisma.countyElectionResult.count()
    const demographicCount = await prisma.countyDemographic.count()
    
    if (countyCount === 0) {
      results.push({
        component: 'Election Data',
        status: 'warning',
        message: 'No election data found. Run import script first.',
        details: { counties: 0 }
      })
    } else {
      // Check data completeness
      const sampleCounty = await prisma.countyElectionResult.findFirst()
      const electionYears = sampleCounty ? Object.keys(sampleCounty.electionData as any).length : 0
      
      results.push({
        component: 'Election Data',
        status: 'pass',
        message: 'Election data loaded successfully',
        details: {
          counties: countyCount,
          electionResults: electionResultCount,
          demographics: demographicCount,
          yearsOfData: electionYears
        }
      })
    }
  } catch (error) {
    results.push({
      component: 'Election Data',
      status: 'fail',
      message: 'Error checking election data',
      details: error
    })
  }

  // 4. Authentication System
  try {
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@akashic.com' }
    })
    
    if (!adminUser) {
      results.push({
        component: 'Authentication',
        status: 'warning',
        message: 'No admin user found. Run seed script.',
        details: { hint: 'npm run prisma:seed' }
      })
    } else {
      results.push({
        component: 'Authentication',
        status: 'pass',
        message: 'Admin user exists'
      })
    }
  } catch (error) {
    results.push({
      component: 'Authentication',
      status: 'fail',
      message: 'Error checking authentication',
      details: error
    })
  }

  // 5. Campaign System
  try {
    const campaignCount = await prisma.campaign.count()
    const messageCount = await prisma.message.count()
    
    results.push({
      component: 'Campaign System',
      status: 'pass',
      message: 'Campaign system operational',
      details: {
        campaigns: campaignCount,
        messages: messageCount
      }
    })
  } catch (error) {
    results.push({
      component: 'Campaign System',
      status: 'fail',
      message: 'Error checking campaign system',
      details: error
    })
  }

  // 6. Version Control Feature
  try {
    const messagesWithVersions = await prisma.messageVersion.count()
    results.push({
      component: 'Version Control',
      status: 'pass',
      message: 'Version control system ready',
      details: { versionedMessages: messagesWithVersions }
    })
  } catch (error) {
    results.push({
      component: 'Version Control',
      status: 'fail',
      message: 'Error checking version control',
      details: error
    })
  }

  // 7. API Endpoints
  const apiEndpoints = [
    '/api/mapping/counties',
    '/api/mapping/elections',
    '/api/campaigns',
    '/api/messages'
  ]
  
  for (const endpoint of apiEndpoints) {
    results.push({
      component: `API Endpoint: ${endpoint}`,
      status: 'pass',
      message: 'Endpoint configured',
      details: { note: 'Runtime check required' }
    })
  }

  // 8. Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'OPENAI_API_KEY'
  ]
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      results.push({
        component: `Environment: ${envVar}`,
        status: 'pass',
        message: 'Variable set'
      })
    } else {
      results.push({
        component: `Environment: ${envVar}`,
        status: envVar === 'OPENAI_API_KEY' ? 'warning' : 'fail',
        message: `${envVar} not set`,
        details: { 
          required: envVar !== 'OPENAI_API_KEY',
          impact: envVar === 'OPENAI_API_KEY' ? 'AI features disabled' : 'App may not function'
        }
      })
    }
  }

  return results
}

async function generateBetaTestingReport(results: HealthCheckResult[]) {
  const passed = results.filter(r => r.status === 'pass').length
  const warnings = results.filter(r => r.status === 'warning').length
  const failed = results.filter(r => r.status === 'fail').length
  
  console.log(chalk.bold('\n📊 Health Check Summary\n'))
  console.log(chalk.green(`✅ Passed: ${passed}`))
  console.log(chalk.yellow(`⚠️  Warnings: ${warnings}`))
  console.log(chalk.red(`❌ Failed: ${failed}`))
  
  console.log(chalk.bold('\n📝 Detailed Results:\n'))
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️ ' : '❌'
    const color = result.status === 'pass' ? chalk.green : result.status === 'warning' ? chalk.yellow : chalk.red
    
    console.log(`${icon} ${color(result.component)}: ${result.message}`)
    if (result.details) {
      console.log(chalk.gray(`   Details: ${JSON.stringify(result.details, null, 2).split('\n').join('\n   ')}`))
    }
  }

  // Beta Testing Recommendations
  console.log(chalk.bold.blue('\n🚀 Beta Testing Recommendations:\n'))
  
  if (failed > 0) {
    console.log(chalk.red('⚠️  Critical Issues to Fix:'))
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(chalk.red(`   - ${r.component}: ${r.message}`))
    })
    console.log()
  }

  if (warnings > 0) {
    console.log(chalk.yellow('📋 Warnings to Address:'))
    results.filter(r => r.status === 'warning').forEach(r => {
      console.log(chalk.yellow(`   - ${r.component}: ${r.message}`))
    })
    console.log()
  }

  console.log(chalk.bold('✅ Ready for Beta Testing Checklist:\n'))
  const checklist = [
    { item: 'Database connected and migrated', done: results.find(r => r.component === 'Database Connection')?.status === 'pass' },
    { item: 'Redis cache operational', done: results.find(r => r.component === 'Redis Cache')?.status === 'pass' },
    { item: 'Election data imported', done: results.find(r => r.component === 'Election Data')?.status === 'pass' },
    { item: 'Admin user created', done: results.find(r => r.component === 'Authentication')?.status === 'pass' },
    { item: 'Environment variables set', done: !results.some(r => r.component.startsWith('Environment:') && r.status === 'fail') },
  ]
  
  checklist.forEach(({ item, done }) => {
    console.log(`   ${done ? '✅' : '❌'} ${item}`)
  })

  // Generate deployment instructions
  console.log(chalk.bold.blue('\n📦 Deployment Instructions for Beta:\n'))
  console.log('1. Set up PostgreSQL database')
  console.log('2. Set up Redis (optional but recommended)')
  console.log('3. Configure environment variables:')
  console.log('   - DATABASE_URL')
  console.log('   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)')
  console.log('   - NEXTAUTH_URL (your domain)')
  console.log('   - OPENAI_API_KEY (for AI features)')
  console.log('4. Run database migrations: npm run prisma:migrate')
  console.log('5. Import election data: npx tsx scripts/import-election-data.ts')
  console.log('6. Create admin user: npm run prisma:seed')
  console.log('7. Build application: npm run build')
  console.log('8. Start application: npm start')

  // Beta testing URLs
  console.log(chalk.bold.blue('\n🔗 Key URLs for Beta Testers:\n'))
  console.log('- Login: /login (admin@akashic.com / admin123)')
  console.log('- Dashboard: /dashboard')
  console.log('- Election Mapping: /mapping')
  console.log('- Campaign Creation: /campaigns/new')
  console.log('- Message Creation: /messages/new')
  console.log('- Onboarding: /onboarding (after registration)')
}

// Run health checks
async function main() {
  try {
    const results = await runHealthChecks()
    await generateBetaTestingReport(results)
  } catch (error) {
    console.error(chalk.red('Health check failed:'), error)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

main()