import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { 
  passwordSchema, 
  hashPassword, 
  isCommonPassword,
  getPasswordStrength 
} from '@/lib/password-validation'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: passwordSchema
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check if password is too common
    if (isCommonPassword(validatedData.password)) {
      return NextResponse.json(
        { error: 'Password is too common. Please choose a more secure password.' },
        { status: 400 }
      )
    }

    // Check password strength
    const passwordStrength = getPasswordStrength(validatedData.password)
    if (passwordStrength < 50) {
      return NextResponse.json(
        { error: 'Password is too weak. Please choose a stronger password.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        emailVerified: new Date() // For now, auto-verify emails
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    // Log registration activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        campaignId: 'system', // System-level activity
        type: 'USER_REGISTERED',
        description: 'created a new account',
        metadata: {
          email: user.email,
          role: user.role
        }
      }
    }).catch(() => {
      // Don't fail registration if activity logging fails
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Account created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}