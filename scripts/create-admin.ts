import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    const hashedPassword = await bcrypt.hash('Admin123!', 10)
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@akashic.com' },
      update: {},
      create: {
        email: 'admin@akashic.com',
        name: 'Admin User',
        password: hashedPassword,
        emailVerified: new Date(),
      }
    })
    
    console.log('Admin user created successfully:', user.email)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()