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
  [key: string]: string // For election year columns
}

async function importElectionData() {
  console.log('🗳️ Importing presidential election data...')

  // Read CSV file
  const csvPath = path.join(__dirname, '../data/elections/county_election_results.csv')
  const csvContent = readFileSync(csvPath, 'utf-8')
  
  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  }) as CountyRow[]

  console.log(`Found ${records.length} counties to import`)

  let processed = 0
  let errors = 0

  for (const row of records) {
    try {
      // Extract county info
      const fips = row.fips.replace('0500000US', '') // Remove prefix
      const [countyName, stateName] = row.geo.split(', ')
      
      // Get state abbreviation (simple mapping for common states)
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

      // Create county
      await prisma.county.upsert({
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
      await prisma.countyElectionResult.upsert({
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

      processed++
      if (processed % 100 === 0) {
        console.log(`Processed ${processed}/${records.length} counties...`)
      }
    } catch (error) {
      console.error(`Error processing county ${row.geo}:`, error)
      errors++
    }
  }

  console.log(`✅ Import complete! Processed: ${processed}, Errors: ${errors}`)
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