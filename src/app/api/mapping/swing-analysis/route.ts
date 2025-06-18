import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { ElectionYear } from '@/types/mapping'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const fromYear = parseInt(searchParams.get('fromYear') || '2020') as ElectionYear
    const toYear = parseInt(searchParams.get('toYear') || '2024') as ElectionYear
    const state = searchParams.get('state') || null

    // Validate years
    if (!validateElectionYear(fromYear) || !validateElectionYear(toYear)) {
      return NextResponse.json({ error: 'Invalid election years' }, { status: 400 })
    }

    // Check cache
    const cacheKey = `swing:${fromYear}:${toYear}${state ? `:${state}` : ''}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    // Query election results
    const whereClause = state ? { stateAbbr: state } : {}
    const results = await prisma.countyElectionResult.findMany({
      where: whereClause,
      include: {
        county: true
      }
    })

    // Calculate swing for each county
    const counties = results.map(result => {
      const electionData = result.electionData as any
      const fromData = electionData[fromYear.toString()]
      const toData = electionData[toYear.toString()]

      if (!fromData || !toData) return null

      const fromDemMargin = (fromData.D / fromData.T) - (fromData.R / fromData.T)
      const toDemMargin = (toData.D / toData.T) - (toData.R / toData.T)
      const swing = (toDemMargin - fromDemMargin) * 100

      return {
        fipsCode: result.countyFips,
        countyName: result.countyName,
        stateAbbr: result.stateAbbr,
        stateName: result.stateName,
        fromYear: fromData,
        toYear: toData,
        swing,
        marginChange: swing
      }
    }).filter(Boolean)

    // Calculate summary statistics
    const democraticGains = counties.filter(c => c!.swing > 0).length
    const republicanGains = counties.filter(c => c!.swing < 0).length
    const averageSwing = counties.reduce((sum, c) => sum + c!.swing, 0) / counties.length

    // Load GeoJSON data (simplified for now - in production, this would come from a CDN or file system)
    const geoJson = await loadCountyGeoJSON(state)

    const response = {
      counties,
      geoJson,
      summary: {
        totalCounties: counties.length,
        democraticGains,
        republicanGains,
        averageSwing
      }
    }

    // Cache for 15 minutes
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 900)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Swing analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate swing analysis' },
      { status: 500 }
    )
  }
}

function validateElectionYear(year: number): boolean {
  const validYears = [
    1892, 1896, 1900, 1904, 1908, 1912, 1916, 1920,
    1924, 1928, 1932, 1936, 1940, 1944, 1948, 1952,
    1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984,
    1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016,
    2020, 2024
  ]
  return validYears.includes(year)
}

async function loadCountyGeoJSON(state: string | null) {
  // In production, this would load actual county boundary GeoJSON
  // For now, return a placeholder structure
  return {
    type: 'FeatureCollection',
    features: []
  }
}