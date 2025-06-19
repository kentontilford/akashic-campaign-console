import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('Checking database connection...')
    await prisma.$connect()
    console.log('Connected successfully!')
    
    console.log('\nChecking users in database...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        password: true
      }
    })
    
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Has password: ${!!user.password}`)
    })
    
    if (users.length === 0) {
      console.log('\nNo users found. The database might be empty.')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()