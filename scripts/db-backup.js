#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const BACKUP_DIR = path.join(__dirname, '..', 'backups')
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

// Parse database URL
const dbUrlRegex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
const match = DATABASE_URL.match(dbUrlRegex)

if (!match) {
  console.error('❌ Invalid DATABASE_URL format')
  process.exit(1)
}

const [, username, password, host, port, database] = match

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
const backupFile = path.join(BACKUP_DIR, `backup-${database}-${timestamp}.sql`)

console.log('🔄 Starting database backup...')
console.log(`📁 Database: ${database}`)
console.log(`📍 Host: ${host}:${port}`)
console.log(`📄 Backup file: ${backupFile}`)

try {
  // Set PGPASSWORD environment variable for pg_dump
  process.env.PGPASSWORD = password

  // Run pg_dump
  const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${backupFile}" --verbose`
  
  console.log('\n⚙️  Running pg_dump...')
  execSync(command, { stdio: 'inherit' })
  
  // Compress the backup
  console.log('\n📦 Compressing backup...')
  execSync(`gzip "${backupFile}"`)
  
  const compressedFile = `${backupFile}.gz`
  const stats = fs.statSync(compressedFile)
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2)
  
  console.log(`\n✅ Backup completed successfully!`)
  console.log(`📄 File: ${compressedFile}`)
  console.log(`📏 Size: ${fileSizeMB} MB`)
  
  // Clean up old backups (keep last 7 days)
  console.log('\n🧹 Cleaning up old backups...')
  const files = fs.readdirSync(BACKUP_DIR)
  const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.gz'))
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  
  let deletedCount = 0
  backupFiles.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file)
    const fileStat = fs.statSync(filePath)
    
    if (fileStat.mtime.getTime() < sevenDaysAgo) {
      fs.unlinkSync(filePath)
      deletedCount++
    }
  })
  
  if (deletedCount > 0) {
    console.log(`🗑️  Deleted ${deletedCount} old backup(s)`)
  }
  
} catch (error) {
  console.error('\n❌ Backup failed:', error.message)
  process.exit(1)
} finally {
  // Clean up PGPASSWORD
  delete process.env.PGPASSWORD
}