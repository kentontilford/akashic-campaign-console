import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Hardcoded test to bypass database
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Check if it's our test user
    if (email !== 'admin@akashic.com') {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    // The hash for "Admin123!"
    const validHash = '$2a$10$Xy8wyu6ps81ubRigNvqgLeqFp0ktI.aBvAN5k07p4IpGolwX3m9da'
    
    // Verify password
    const isValid = await bcrypt.compare(password, validHash)
    
    return NextResponse.json({
      email,
      passwordProvided: !!password,
      passwordValid: isValid,
      expectedPassword: 'Admin123!',
      hashUsed: validHash
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      message: error.message
    }, { status: 500 })
  }
}