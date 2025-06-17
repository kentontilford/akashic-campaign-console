import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const state = searchParams.get('state') || null
    const year = parseInt(searchParams.get('year') || '2020')

    // Check cache
    const cacheKey = `demographics:${year}${state ? `:${state}` : ''}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    // Query demographic data
    const whereClause: any = { dataYear: year }
    if (state) {
      const counties = await prisma.county.findMany({
        where: { stateAbbr: state },
        select: { fipsCode: true }
      })
      whereClause.countyFips = { in: counties.map(c => c.fipsCode) }
    }

    const demographics = await prisma.countyDemographic.findMany({
      where: whereClause,
      include: {
        county: true
      }
    })

    // Format response
    const counties = demographics.map(demo => ({
      fipsCode: demo.countyFips,
      countyName: demo.county.countyName,
      stateAbbr: demo.county.stateAbbr,
      stateName: demo.county.stateName,
      population: demo.population,
      medianAge: demo.medianAge ? parseFloat(demo.medianAge.toString()) : null,
      medianHouseholdIncome: demo.medianHouseholdIncome,
      povertyRate: demo.povertyRate ? parseFloat(demo.povertyRate.toString()) : null,
      unemploymentRate: demo.unemploymentRate ? parseFloat(demo.unemploymentRate.toString()) : null,
      collegeDegreeRate: demo.collegeDegreeRate ? parseFloat(demo.collegeDegreeRate.toString()) : null,
      whitePercentage: demo.whitePercentage ? parseFloat(demo.whitePercentage.toString()) : null,
      blackPercentage: demo.blackPercentage ? parseFloat(demo.blackPercentage.toString()) : null,
      hispanicPercentage: demo.hispanicPercentage ? parseFloat(demo.hispanicPercentage.toString()) : null,
      asianPercentage: demo.asianPercentage ? parseFloat(demo.asianPercentage.toString()) : null,
      populationDensity: demo.populationDensity ? parseFloat(demo.populationDensity.toString()) : null,
      urbanPercentage: demo.urbanPercentage ? parseFloat(demo.urbanPercentage.toString()) : null
    }))

    // Calculate summary statistics
    const totalPopulation = counties.reduce((sum, c) => sum + (c.population || 0), 0)
    const incomes = counties.map(c => c.medianHouseholdIncome).filter(Boolean) as number[]
    const averageIncome = incomes.reduce((sum, i) => sum + i, 0) / incomes.length
    const medianIncome = incomes.sort((a, b) => a - b)[Math.floor(incomes.length / 2)]

    // Load GeoJSON data
    const geoJson = await loadCountyGeoJSON(state)

    const response = {
      counties,
      geoJson,
      summary: {
        totalCounties: counties.length,
        totalPopulation,
        averageIncome: Math.round(averageIncome),
        medianIncome
      }
    }

    // Cache for 15 minutes
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 900)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Demographics error:', error)
    return NextResponse.json(
      { error: 'Failed to load demographic data' },
      { status: 500 }
    )
  }
}

async function loadCountyGeoJSON(state: string | null) {
  // In production, this would load actual county boundary GeoJSON
  // For now, return a placeholder structure
  return {
    type: 'FeatureCollection',
    features: []
  }
}