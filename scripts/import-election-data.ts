import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import { finished } from 'stream/promises'

const prisma = new PrismaClient()

// State name to abbreviation mapping
const stateAbbreviations: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC'
}

function getStateAbbr(stateName: string): string {
  return stateAbbreviations[stateName] || ''
}

interface ElectionDataRow {
  county_fips: string
  county_name: string
  state_abbr: string
  state_name: string
  year: string
  democratic_votes: string
  republican_votes: string
  other_votes: string
  total_votes: string
}

interface CountyBoundary {
  fips: string
  geometry: any
}

async function importElectionData() {
  console.log('🗳️ Starting election data import...')

  // Configuration
  const DATA_DIR = process.env.ELECTION_DATA_DIR || './data/elections'
  const ELECTION_CSV = path.join(DATA_DIR, 'county_election_results.csv')
  const BOUNDARIES_JSON = path.join(DATA_DIR, 'county_boundaries.geojson')
  const DEMOGRAPHICS_CSV = path.join(DATA_DIR, 'county_demographics.csv')

  // Check if files exist
  if (!fs.existsSync(ELECTION_CSV)) {
    console.error(`❌ Election data file not found: ${ELECTION_CSV}`)
    console.log(`
Please ensure your data files are organized as follows:
${DATA_DIR}/
  ├── county_election_results.csv
  ├── county_boundaries.geojson (optional)
  └── county_demographics.csv (optional)

CSV Format for county_election_results.csv:
county_fips,county_name,state_abbr,state_name,year,democratic_votes,republican_votes,other_votes,total_votes
17031,Cook County,IL,Illinois,2020,1725891,738227,45987,2510105
17031,Cook County,IL,Illinois,2024,1650234,801456,52310,2504000
...

You can also use a wide format CSV with columns:
county_fips,county_name,state_abbr,state_name,1892_D,1892_R,1892_O,1892_T,1896_D,1896_R,...,2024_D,2024_R,2024_O,2024_T
`)
    return
  }

  try {
    // Step 1: Load and process election data
    console.log('📊 Loading election data...')
    const electionData = await loadElectionCSV(ELECTION_CSV)
    
    // Step 2: Process by county
    const countyMap = new Map<string, any>()
    
    for (const row of electionData) {
      if (!row.county_fips) continue
      const fips = row.county_fips.padStart(5, '0')
      
      if (!countyMap.has(fips)) {
        countyMap.set(fips, {
          fips,
          countyName: row.county_name,
          stateAbbr: row.state_abbr,
          stateName: row.state_name,
          elections: {}
        })
      }
      
      const county = countyMap.get(fips)
      county.elections[row.year] = {
        D: parseInt(row.democratic_votes) || 0,
        R: parseInt(row.republican_votes) || 0,
        O: parseInt(row.other_votes) || 0,
        T: parseInt(row.total_votes) || 0
      }
    }

    // Step 3: Load boundaries if available
    let boundaries: Map<string, any> | null = null
    if (fs.existsSync(BOUNDARIES_JSON)) {
      console.log('🗺️ Loading county boundaries...')
      boundaries = await loadCountyBoundaries(BOUNDARIES_JSON)
    }

    // Step 4: Import to database
    console.log('💾 Importing to database...')
    let imported = 0
    let errors = 0

    for (const [fips, countyData] of countyMap) {
      try {
        // Create or update county
        await prisma.county.upsert({
          where: { fipsCode: fips },
          create: {
            fipsCode: fips,
            countyName: countyData.countyName,
            stateName: countyData.stateName,
            stateAbbr: countyData.stateAbbr,
            geometry: boundaries?.get(fips)?.geometry || null,
            centroidLat: boundaries?.get(fips)?.centroidLat || null,
            centroidLng: boundaries?.get(fips)?.centroidLng || null
          },
          update: {
            geometry: boundaries?.get(fips)?.geometry || undefined
          }
        })

        // Create or update election results
        await prisma.countyElectionResult.upsert({
          where: { countyFips: fips },
          create: {
            countyFips: fips,
            countyName: countyData.countyName,
            stateAbbr: countyData.stateAbbr,
            stateName: countyData.stateName,
            electionData: countyData.elections
          },
          update: {
            electionData: countyData.elections
          }
        })

        imported++
        if (imported % 100 === 0) {
          console.log(`  Processed ${imported} counties...`)
        }
      } catch (error) {
        console.error(`  Error importing ${fips}: ${error}`)
        errors++
      }
    }

    // Step 5: Import demographics if available
    if (fs.existsSync(DEMOGRAPHICS_CSV)) {
      console.log('📈 Loading demographic data...')
      await importDemographics(DEMOGRAPHICS_CSV)
    }

    console.log(`
✅ Import completed!
   - Counties imported: ${imported}
   - Errors: ${errors}
   - Total elections: ${Object.keys(countyMap.values().next().value.elections).length} years
`)

  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function loadElectionCSV(filePath: string): Promise<ElectionDataRow[]> {
  const results: ElectionDataRow[] = []
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  // Detect if it's wide format or long format
  const firstLine = fileContent.split('\n')[0]
  const isWideFormat = firstLine.includes('_D') || firstLine.includes('_R')
  
  
  if (isWideFormat) {
    // Handle wide format
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })
    
    for await (const record of parser) {
      let fips = record.fips || record.county_fips || record.FIPS || record.fips_code || ''
      if (fips.includes('US')) {
        fips = fips.split('US')[1]
      }
      const geo = record.geo || ''
      const [countyName, stateName] = geo.includes(',') ? geo.split(',').map((s: string) => s.trim()) : [geo, '']
      const stateAbbr = getStateAbbr(stateName) || record.state_abbr || record.State || record.STATE || ''
      
      // Extract all year columns
      for (const key of Object.keys(record)) {
        const yearMatch = key.match(/^(\d{4})_([DROT])$/)
        if (yearMatch) {
          const year = yearMatch[1]
          const party = yearMatch[2]
          
          if (!results.find(r => r.county_fips === fips && r.year === year)) {
            results.push({
              county_fips: fips,
              county_name: countyName,
              state_abbr: stateAbbr,
              state_name: stateName,
              year,
              democratic_votes: '0',
              republican_votes: '0',
              other_votes: '0',
              total_votes: '0'
            })
          }
          
          const row = results.find(r => r.county_fips === fips && r.year === year)!
          if (party === 'D') row.democratic_votes = record[key]
          if (party === 'R') row.republican_votes = record[key]
          if (party === 'O') row.other_votes = record[key]
          if (party === 'T') row.total_votes = record[key]
        }
      }
    }
  } else {
    // Handle long format
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })
    
    for await (const record of parser) {
      let fips = record.fips || record.county_fips || record.FIPS || record.fips_code || ''
      if (fips.includes('US')) {
        fips = fips.split('US')[1]
      }
      const geo = record.geo || ''
      const [countyName, stateName] = geo.includes(',') ? geo.split(',').map((s: string) => s.trim()) : [record.county_name || record.County || record.NAME || geo, record.state_name || record.StateName || '']
      const stateAbbr = getStateAbbr(stateName) || record.state_abbr || record.State || record.STATE || ''
      
      results.push({
        county_fips: fips,
        county_name: countyName,
        state_abbr: stateAbbr,
        state_name: stateName,
        year: record.year || record.Year || record.YEAR,
        democratic_votes: record.democratic_votes || record.dem_votes || record.D || '0',
        republican_votes: record.republican_votes || record.rep_votes || record.R || '0',
        other_votes: record.other_votes || record.other || record.O || '0',
        total_votes: record.total_votes || record.total || record.T || '0'
      })
    }
  }
  
  return results
}

async function loadCountyBoundaries(filePath: string): Promise<Map<string, any>> {
  const boundaries = new Map()
  const geoJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  
  for (const feature of geoJson.features) {
    const fips = feature.properties.GEOID || 
                 feature.properties.FIPS || 
                 feature.properties.fips_code
    
    if (fips) {
      // Calculate centroid
      const coords = feature.geometry.coordinates[0]
      let sumLat = 0, sumLng = 0, count = 0
      
      const processCoords = (coordList: any[]) => {
        for (const coord of coordList) {
          if (Array.isArray(coord[0])) {
            processCoords(coord)
          } else {
            sumLng += coord[0]
            sumLat += coord[1]
            count++
          }
        }
      }
      
      processCoords(coords)
      
      boundaries.set(fips?.padStart(5, '0'), {
        geometry: feature.geometry,
        centroidLat: count > 0 ? sumLat / count : null,
        centroidLng: count > 0 ? sumLng / count : null
      })
    }
  }
  
  return boundaries
}

async function importDemographics(filePath: string) {
  const parser = parse(fs.readFileSync(filePath, 'utf-8'), {
    columns: true,
    skip_empty_lines: true
  })
  
  let count = 0
  for await (const record of parser) {
    let fips = record.fips || record.county_fips || record.FIPS || record.fips_code || ''
    if (fips.includes('US')) {
      fips = fips.split('US')[1]
    }
    if (fips) {
      fips = fips.padStart(5, '0')
    }
    const year = parseInt(record.year || record.Year || '2020')
    
    try {
      await prisma.countyDemographic.upsert({
        where: {
          countyFips_dataYear: { countyFips: fips, dataYear: year }
        },
        create: {
          countyFips: fips,
          dataYear: year,
          population: parseInt(record.population) || null,
          medianAge: parseFloat(record.median_age) || null,
          medianHouseholdIncome: parseInt(record.median_household_income) || null,
          povertyRate: parseFloat(record.poverty_rate) || null,
          unemploymentRate: parseFloat(record.unemployment_rate) || null,
          collegeDegreeRate: parseFloat(record.college_degree_rate) || null,
          whitePercentage: parseFloat(record.white_percentage) || null,
          blackPercentage: parseFloat(record.black_percentage) || null,
          hispanicPercentage: parseFloat(record.hispanic_percentage) || null,
          asianPercentage: parseFloat(record.asian_percentage) || null,
          otherRacePercentage: parseFloat(record.other_race_percentage) || null,
          populationDensity: parseFloat(record.population_density) || null,
          urbanPercentage: parseFloat(record.urban_percentage) || null,
          englishOnlyPercentage: parseFloat(record.english_only_percentage) || null,
          spanishHomePercentage: parseFloat(record.spanish_home_percentage) || null,
          otherLanguagePercentage: parseFloat(record.other_language_percentage) || null,
          voterTurnoutRate: parseFloat(record.voter_turnout_rate) || null
        },
        update: {}
      })
      
      count++
    } catch (error) {
      console.error(`Error importing demographics for ${fips}:`, error)
    }
  }
  
  console.log(`  Imported ${count} demographic records`)
}

// Run the import
importElectionData().catch(console.error)