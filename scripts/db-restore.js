#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

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

// Check if backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  console.error('❌ No backup directory found')
  process.exit(1)
}

// List available backups
const files = fs.readdirSync(BACKUP_DIR)
const backupFiles = files
  .filter(f => f.startsWith('backup-') && f.endsWith('.gz'))
  .sort((a, b) => b.localeCompare(a)) // Sort newest first

if (backupFiles.length === 0) {
  console.error('❌ No backup files found')
  process.exit(1)
}

console.log('📦 Available backups:\n')
backupFiles.forEach((file, index) => {
  const filePath = path.join(BACKUP_DIR, file)
  const stats = fs.statSync(filePath)
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2)
  const date = stats.mtime.toLocaleString()
  
  console.log(`${index + 1}. ${file}`)
  console.log(`   Size: ${fileSizeMB} MB | Date: ${date}`)
})

// Prompt user to select a backup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('\nSelect backup to restore (number): ', async (answer) => {
  const selection = parseInt(answer) - 1
  
  if (isNaN(selection) || selection < 0 || selection >= backupFiles.length) {
    console.error('❌ Invalid selection')
    rl.close()
    process.exit(1)
  }
  
  const selectedBackup = backupFiles[selection]
  const backupPath = path.join(BACKUP_DIR, selectedBackup)
  
  console.log(`\n⚠️  WARNING: This will restore database '${database}' from backup`)
  console.log(`📄 Backup file: ${selectedBackup}`)
  
  rl.question('\nType "RESTORE" to confirm: ', async (confirm) => {
    if (confirm !== 'RESTORE') {
      console.log('❌ Restore cancelled')
      rl.close()
      process.exit(0)
    }
    
    try {
      // Set PGPASSWORD environment variable
      process.env.PGPASSWORD = password
      
      // Create a temporary uncompressed file
      const tempFile = backupPath.replace('.gz', '')
      
      console.log('\n📦 Decompressing backup...')
      execSync(`gunzip -c "${backupPath}" > "${tempFile}"`)
      
      // Drop existing connections to the database
      console.log('\n🔌 Disconnecting existing connections...')
      try {
        execSync(`psql -h ${host} -p ${port} -U ${username} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${database}' AND pid <> pg_backend_pid();"`, { stdio: 'ignore' })
      } catch (e) {
        // Ignore errors from disconnecting
      }
      
      // Restore the database
      console.log('\n🔄 Restoring database...')
      execSync(`psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${tempFile}"`, { stdio: 'inherit' })
      
      // Clean up temporary file
      fs.unlinkSync(tempFile)
      
      console.log('\n✅ Database restored successfully!')
      
    } catch (error) {
      console.error('\n❌ Restore failed:', error.message)
      rl.close()
      process.exit(1)
    } finally {
      // Clean up PGPASSWORD
      delete process.env.PGPASSWORD
    }
    
    rl.close()
  })
})