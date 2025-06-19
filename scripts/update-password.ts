import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updatePassword() {
  try {
    console.log('Generating new password hash...')
    const password = 'Admin123!'
    const newHash = await bcrypt.hash(password, 10)
    
    console.log('Updating admin user password...')
    const user = await prisma.user.update({
      where: { email: 'admin@akashic.com' },
      data: { 
        password: newHash,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('Updated user:', {
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    })
    
    // Verify the update worked
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'admin@akashic.com' }
    })
    
    if (updatedUser?.password) {
      const isValid = await bcrypt.compare(password, updatedUser.password)
      console.log('Password validation:', isValid ? 'SUCCESS' : 'FAILED')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePassword()