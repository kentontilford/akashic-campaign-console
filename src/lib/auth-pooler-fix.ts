import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Create a special Prisma instance just for auth that doesn't use prepared statements
const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})

export async function verifyUserCredentials(email: string, password: string) {
  try {
    // Use raw SQL to avoid prepared statement issues with pooler
    const users = await authPrisma.$queryRaw<any[]>`
      SELECT id, email, password, name, role, "emailVerified" 
      FROM "User" 
      WHERE email = ${email}
      LIMIT 1
    `
    
    if (!users || users.length === 0) {
      return null
    }
    
    const user = users[0]
    
    if (!user.password) {
      return null
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}