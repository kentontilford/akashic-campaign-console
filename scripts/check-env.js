#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', '.env.example')

console.log('🔍 Checking environment configuration...\n')

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!')
  console.log('📝 Creating .env from .env.example...')
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ .env file created. Please update it with your values.\n')
  } else {
    console.error('❌ .env.example file not found!')
    process.exit(1)
  }
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf-8')
const envLines = envContent.split('\n')

// Parse environment variables
const envVars = {}
envLines.forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    const value = valueParts.join('=').replace(/^["']|["']$/g, '')
    envVars[key] = value
  }
})

// Check required variables
const required = [
  { key: 'DATABASE_URL', description: 'PostgreSQL connection string' },
  { key: 'NEXTAUTH_URL', description: 'NextAuth base URL' },
  { key: 'NEXTAUTH_SECRET', description: 'NextAuth secret (min 32 chars)' },
  { key: 'OPENAI_API_KEY', description: 'OpenAI API key' }
]

let hasErrors = false
const warnings = []

console.log('📋 Required Environment Variables:\n')

required.forEach(({ key, description }) => {
  const value = envVars[key]
  
  if (!value || value === '') {
    console.error(`❌ ${key}: Missing (${description})`)
    hasErrors = true
  } else {
    // Validate specific keys
    if (key === 'NEXTAUTH_SECRET') {
      if (value.length < 32) {
        console.error(`❌ ${key}: Too short (must be at least 32 characters)`)
        hasErrors = true
      } else {
        console.log(`✅ ${key}: Set`)
      }
    } else if (key === 'DATABASE_URL') {
      if (!value.startsWith('postgresql://')) {
        console.error(`❌ ${key}: Invalid format (must start with postgresql://)`)
        hasErrors = true
      } else {
        console.log(`✅ ${key}: Set`)
      }
    } else if (key === 'OPENAI_API_KEY') {
      if (!value.startsWith('sk-')) {
        warnings.push(`${key}: May be invalid (OpenAI keys usually start with 'sk-')`)
      }
      console.log(`✅ ${key}: Set`)
    } else {
      console.log(`✅ ${key}: Set`)
    }
  }
})

// Generate NEXTAUTH_SECRET if missing
if (!envVars.NEXTAUTH_SECRET || envVars.NEXTAUTH_SECRET === '') {
  console.log('\n🔐 Generating NEXTAUTH_SECRET...')
  const secret = crypto.randomBytes(32).toString('base64')
  
  // Update .env file
  let updatedContent = envContent
  const secretRegex = /^NEXTAUTH_SECRET=.*$/m
  
  if (secretRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(secretRegex, `NEXTAUTH_SECRET="${secret}"`)
  } else {
    updatedContent += `\nNEXTAUTH_SECRET="${secret}"`
  }
  
  fs.writeFileSync(envPath, updatedContent)
  console.log('✅ NEXTAUTH_SECRET generated and saved to .env')
  hasErrors = false // Reset since we fixed it
}

// Check optional variables
console.log('\n📋 Optional Environment Variables:\n')

const optional = [
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'EMAIL_FROM',
  'SENDGRID_API_KEY',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET'
]

optional.forEach(key => {
  const value = envVars[key]
  if (!value || value === '') {
    console.log(`⚪ ${key}: Not set (optional)`)
  } else {
    console.log(`✅ ${key}: Set`)
  }
})

// Show warnings
if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:')
  warnings.forEach(warning => {
    console.log(`   - ${warning}`)
  })
}

// Summary
console.log('\n' + '='.repeat(50))
if (hasErrors) {
  console.error('\n❌ Environment configuration has errors!')
  console.log('\nPlease update your .env file with the missing values.')
  console.log('You can use .env.example as a reference.')
  process.exit(1)
} else {
  console.log('\n✅ Environment configuration is valid!')
  console.log('\nYour application is ready to run.')
}