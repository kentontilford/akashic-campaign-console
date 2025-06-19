import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = 'admin@akashic.com'
    const password = 'Admin123!'
    
    console.log(`Testing login for: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('User not found!')
      return
    }
    
    console.log('User found:', {
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    })
    
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password)
      console.log('Password check:', isValid ? 'VALID' : 'INVALID')
      
      if (!isValid) {
        // Let's create a new hash and update
        console.log('\nCreating new password hash...')
        const newHash = await bcrypt.hash(password, 10)
        
        await prisma.user.update({
          where: { email },
          data: { 
            password: newHash,
            role: 'ADMIN' // Also fix the role
          }
        })
        
        console.log('Updated user with new password and ADMIN role')
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()