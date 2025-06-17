import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample counties for testing
const SAMPLE_COUNTIES = [
  { fips: '17031', name: 'Cook County', state: 'Illinois', abbr: 'IL', lat: 41.8781, lng: -87.6298 },
  { fips: '06037', name: 'Los Angeles County', state: 'California', abbr: 'CA', lat: 34.0522, lng: -118.2437 },
  { fips: '48201', name: 'Harris County', state: 'Texas', abbr: 'TX', lat: 29.7604, lng: -95.3698 },
  { fips: '36061', name: 'New York County', state: 'New York', abbr: 'NY', lat: 40.7128, lng: -74.0060 },
  { fips: '12086', name: 'Miami-Dade County', state: 'Florida', abbr: 'FL', lat: 25.7617, lng: -80.1918 },
]

// Generate realistic-looking election data
function generateElectionData() {
  const data: any = {}
  
  // Generate data for years 1960-2024
  for (let year = 1960; year <= 2024; year += 4) {
    const totalVotes = Math.floor(Math.random() * 500000) + 100000
    const demPct = 0.35 + Math.random() * 0.3 // 35-65%
    const repPct = 0.9 - demPct // Ensure they add up to ~90%
    
    data[year] = {
      D: Math.floor(totalVotes * demPct),
      R: Math.floor(totalVotes * repPct),
      O: Math.floor(totalVotes * 0.1), // ~10% other
      T: totalVotes
    }
  }
  
  return data
}

// Generate demographic data
function generateDemographics(fips: string) {
  return {
    countyFips: fips,
    dataYear: 2020,
    population: Math.floor(Math.random() * 2000000) + 50000,
    medianAge: 35 + Math.random() * 10,
    medianHouseholdIncome: Math.floor(Math.random() * 40000) + 40000,
    povertyRate: 5 + Math.random() * 20,
    unemploymentRate: 3 + Math.random() * 10,
    collegeDegreeRate: 15 + Math.random() * 35,
    whitePercentage: 30 + Math.random() * 50,
    blackPercentage: Math.random() * 40,
    hispanicPercentage: Math.random() * 40,
    asianPercentage: Math.random() * 20,
    otherRacePercentage: Math.random() * 10,
    populationDensity: Math.random() * 5000,
    urbanPercentage: 20 + Math.random() * 70,
    englishOnlyPercentage: 50 + Math.random() * 40,
    spanishHomePercentage: Math.random() * 30,
    otherLanguagePercentage: Math.random() * 20,
    voterTurnoutRate: 50 + Math.random() * 30
  }
}

async function seedElectionData() {
  console.log('🗳️ Seeding election mapping data...')

  for (const county of SAMPLE_COUNTIES) {
    // Create county
    await prisma.county.upsert({
      where: { fipsCode: county.fips },
      update: {},
      create: {
        fipsCode: county.fips,
        countyName: county.name,
        stateName: county.state,
        stateAbbr: county.abbr,
        centroidLat: county.lat,
        centroidLng: county.lng,
        americanNationRegion: 'Midlands' // Placeholder
      }
    })

    // Create election results
    await prisma.countyElectionResult.upsert({
      where: { countyFips: county.fips },
      update: {},
      create: {
        countyFips: county.fips,
        countyName: county.name,
        stateAbbr: county.abbr,
        stateName: county.state,
        electionData: generateElectionData()
      }
    })

    // Create demographics
    await prisma.countyDemographic.upsert({
      where: {
        countyFips_dataYear: {
          countyFips: county.fips,
          dataYear: 2020
        }
      },
      update: {},
      create: generateDemographics(county.fips)
    })
  }

  console.log('✅ Election mapping data seeded successfully')
}

seedElectionData()
  .catch((e) => {
    console.error('Error seeding election data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })