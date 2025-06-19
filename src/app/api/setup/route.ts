import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if this is the first run (no users exist)
    const userCount = await prisma.user.count()
    
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Setup already completed' },
        { status: 400 }
      )
    }
    
    // Get setup key from request
    const { setupKey, email, password } = await request.json()
    
    // Verify setup key (you should set this as an environment variable)
    const validSetupKey = process.env.SETUP_KEY || 'akashic-setup-2024'
    
    if (setupKey !== validSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      )
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(password || 'Admin123!', 10)
    
    const user = await prisma.user.create({
      data: {
        email: email || 'admin@akashic.com',
        name: 'Admin User',
        password: hashedPassword,
        emailVerified: new Date(),
      }
    })
    
    return NextResponse.json({
      message: 'Admin user created successfully',
      email: user.email
    })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      setupRequired: userCount === 0,
      userCount
    })
  } catch (error) {
    return NextResponse.json({
      setupRequired: true,
      error: 'Database connection error'
    })
  }
}