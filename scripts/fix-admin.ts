import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAdmin() {
  try {
    console.log('Updating admin user role...')
    
    const updated = await prisma.user.update({
      where: { email: 'admin@akashic.com' },
      data: { 
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('Updated user:', {
      email: updated.email,
      role: updated.role,
      emailVerified: updated.emailVerified
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdmin()