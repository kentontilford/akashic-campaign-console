import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Password requirements
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

// Password validation schema
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be less than ${PASSWORD_MAX_LENGTH} characters`)
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    'Password must contain at least one special character'
  )

// Check if password meets requirements
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  try {
    passwordSchema.parse(password)
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => e.message),
      }
    }
    return { isValid: false, errors: ['Invalid password'] }
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate password strength score (0-100)
export function getPasswordStrength(password: string): number {
  let strength = 0

  // Length score (max 25 points)
  strength += Math.min(password.length * 2, 25)

  // Character variety (max 25 points)
  if (/[a-z]/.test(password)) strength += 5
  if (/[A-Z]/.test(password)) strength += 5
  if (/[0-9]/.test(password)) strength += 5
  if (/[^A-Za-z0-9]/.test(password)) strength += 10

  // Pattern complexity (max 25 points)
  const patterns = [
    /(.)\1{2,}/, // Repeated characters
    /^[0-9]+$/, // Only numbers
    /^[a-zA-Z]+$/, // Only letters
    /(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
  ]

  let hasWeakPattern = false
  for (const pattern of patterns) {
    if (pattern.test(password)) {
      hasWeakPattern = true
      break
    }
  }

  if (!hasWeakPattern) strength += 25

  // Uniqueness (max 25 points)
  const uniqueChars = new Set(password.split('')).size
  strength += Math.min((uniqueChars / password.length) * 25, 25)

  return Math.min(Math.round(strength), 100)
}

// Get password strength label
export function getPasswordStrengthLabel(score: number): {
  label: string
  color: string
} {
  if (score < 25) return { label: 'Weak', color: 'red' }
  if (score < 50) return { label: 'Fair', color: 'orange' }
  if (score < 75) return { label: 'Good', color: 'yellow' }
  return { label: 'Strong', color: 'green' }
}

// Common passwords to check against
const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'password123',
  'admin123',
  'qwerty123',
  'letmein',
  'welcome123',
  'monkey123',
  'dragon123',
]

// Check if password is too common
export function isCommonPassword(password: string): boolean {
  const lowerPassword = password.toLowerCase()
  return COMMON_PASSWORDS.some(common => 
    lowerPassword === common || lowerPassword.includes(common)
  )
}