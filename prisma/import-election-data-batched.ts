import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface CountyRow {
  geo: string
  cluster13: string
  region: string
  nation: string
  fips: string
  [key: string]: string
}

const BATCH_SIZE = 50 // Process 50 counties at a time

async function importElectionData() {
  console.log('🗳️ Importing presidential election data...')

  // Check existing data
  const existingCount = await prisma.county.count()
  console.log(`Found ${existingCount} existing counties in database`)

  // Read CSV file
  const csvPath = path.join(__dirname, '../data/elections/county_election_results.csv')
  const csvContent = readFileSync(csvPath, 'utf-8')
  
  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  }) as CountyRow[]

  console.log(`Total counties in CSV: ${records.length}`)

  // Get already processed counties
  const existingFips = new Set(
    (await prisma.county.findMany({ select: { fipsCode: true } }))
      .map(c => c.fipsCode)
  )
  
  // Filter out already processed counties
  const toProcess = records.filter(row => {
    const fips = row.fips.replace('0500000US', '')
    return !existingFips.has(fips)
  })

  console.log(`Counties to process: ${toProcess.length}`)
  
  if (toProcess.length === 0) {
    console.log('✅ All counties already imported!')
    
    // Show summary statistics
    const results = await prisma.countyElectionResult.findMany({
      where: {},
      select: { electionData: true }
    })
    
    let total2020 = { D: 0, R: 0, O: 0, T: 0 }
    let total2024 = { D: 0, R: 0, O: 0, T: 0 }
    
    results.forEach(r => {
      const data = r.electionData as any
      if (data['2020']) {
        total2020.D += data['2020'].D || 0
        total2020.R += data['2020'].R || 0
        total2020.O += data['2020'].O || 0
        total2020.T += data['2020'].T || 0
      }
      if (data['2024']) {
        total2024.D += data['2024'].D || 0
        total2024.R += data['2024'].R || 0
        total2024.O += data['2024'].O || 0
        total2024.T += data['2024'].T || 0
      }
    })
    
    console.log('\n📊 2020 Election Totals:')
    console.log(`   Democrat: ${total2020.D.toLocaleString()} (${(total2020.D/total2020.T*100).toFixed(1)}%)`)
    console.log(`   Republican: ${total2020.R.toLocaleString()} (${(total2020.R/total2020.T*100).toFixed(1)}%)`)
    console.log(`   Other: ${total2020.O.toLocaleString()} (${(total2020.O/total2020.T*100).toFixed(1)}%)`)
    console.log(`   Total: ${total2020.T.toLocaleString()}`)
    
    console.log('\n📊 2024 Election Totals:')
    console.log(`   Democrat: ${total2024.D.toLocaleString()} (${(total2024.D/total2024.T*100).toFixed(1)}%)`)
    console.log(`   Republican: ${total2024.R.toLocaleString()} (${(total2024.R/total2024.T*100).toFixed(1)}%)`)
    console.log(`   Other: ${total2024.O.toLocaleString()} (${(total2024.O/total2024.T*100).toFixed(1)}%)`)
    console.log(`   Total: ${total2024.T.toLocaleString()}`)
    
    return
  }

  let processed = existingCount
  let errors = 0

  // Process in batches
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE)
    const batchPromises = []

    for (const row of batch) {
      batchPromises.push(processCounty(row).catch(error => {
        console.error(`Error processing ${row.geo}:`, error.message)
        errors++
        return null
      }))
    }

    await Promise.all(batchPromises)
    processed += batch.length - errors
    
    const progress = ((i + batch.length) / toProcess.length * 100).toFixed(1)
    console.log(`Progress: ${progress}% (${processed}/${records.length} counties)`)
  }

  console.log(`\n✅ Import complete! Total: ${processed}, Errors: ${errors}`)
  
  // Show final statistics
  await showFinalStats()
}

async function processCounty(row: CountyRow) {
  // Extract county info
  const fips = row.fips.replace('0500000US', '')
  const [countyName, stateName] = row.geo.split(', ')
  
  // Get state abbreviation
  const stateAbbr = getStateAbbr(stateName)
  
  // Parse election data
  const electionData: Record<string, any> = {}
  
  // Extract election results for each year
  for (const key of Object.keys(row)) {
    const match = key.match(/^(\d{4})_([DROT])$/)
    if (match) {
      const [, year, party] = match
      if (!electionData[year]) {
        electionData[year] = { D: 0, R: 0, O: 0, T: 0 }
      }
      electionData[year][party] = parseInt(row[key].replace(/,/g, '')) || 0
    }
  }

  // Use transaction for consistency
  await prisma.$transaction(async (tx) => {
    // Create county
    await tx.county.upsert({
      where: { fipsCode: fips },
      update: {
        countyName,
        stateName,
        stateAbbr,
        americanNationRegion: row.nation
      },
      create: {
        fipsCode: fips,
        countyName,
        stateName,
        stateAbbr,
        americanNationRegion: row.nation
      }
    })

    // Create election results
    await tx.countyElectionResult.upsert({
      where: { countyFips: fips },
      update: {
        electionData
      },
      create: {
        countyFips: fips,
        countyName,
        stateAbbr,
        stateName,
        electionData
      }
    })
  })
}

async function showFinalStats() {
  const results = await prisma.countyElectionResult.findMany({
    select: { electionData: true }
  })
  
  let total2020 = { D: 0, R: 0, O: 0, T: 0 }
  
  results.forEach(r => {
    const data = r.electionData as any
    if (data['2020']) {
      total2020.D += data['2020'].D || 0
      total2020.R += data['2020'].R || 0
      total2020.O += data['2020'].O || 0
      total2020.T += data['2020'].T || 0
    }
  })
  
  console.log('\n📊 Final 2020 Election Totals:')
  console.log(`   Democrat: ${total2020.D.toLocaleString()} (${(total2020.D/total2020.T*100).toFixed(1)}%)`)
  console.log(`   Republican: ${total2020.R.toLocaleString()} (${(total2020.R/total2020.T*100).toFixed(1)}%)`)
  console.log(`   Other: ${total2020.O.toLocaleString()} (${(total2020.O/total2020.T*100).toFixed(1)}%)`)
  console.log(`   Total: ${total2020.T.toLocaleString()}`)
  console.log(`   Biden won by ${((total2020.D - total2020.R)/total2020.T*100).toFixed(1)}%`)
}

function getStateAbbr(stateName: string): string {
  const stateMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
  }
  
  return stateMap[stateName] || 'XX'
}

// Run import
importElectionData()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })