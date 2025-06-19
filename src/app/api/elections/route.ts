import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const state = searchParams.get('state')
    const county = searchParams.get('county')

    // Build where clause
    const where: any = {}
    if (state) where.stateAbbr = state
    if (county) where.countyName = { contains: county, mode: 'insensitive' }

    // Get election results
    const results = await prisma.countyElectionResult.findMany({
      where,
      include: {
        county: {
          select: {
            fipsCode: true,
            countyName: true,
            stateName: true,
            stateAbbr: true,
            americanNationRegion: true,
            centroidLat: true,
            centroidLng: true
          }
        }
      }
    })

    // If a specific year is requested, calculate statistics
    if (year) {
      const yearData = results.map(r => {
        const electionData = r.electionData as any
        const yearResult = electionData[year] || { D: 0, R: 0, O: 0, T: 0 }
        
        return {
          ...r,
          yearResult,
          demPercent: yearResult.T > 0 ? (yearResult.D / yearResult.T) * 100 : 0,
          repPercent: yearResult.T > 0 ? (yearResult.R / yearResult.T) * 100 : 0,
          margin: yearResult.T > 0 ? ((yearResult.D - yearResult.R) / yearResult.T) * 100 : 0
        }
      })

      // Calculate national/state totals
      const totals = yearData.reduce((acc, county) => {
        acc.D += county.yearResult.D
        acc.R += county.yearResult.R
        acc.O += county.yearResult.O
        acc.T += county.yearResult.T
        return acc
      }, { D: 0, R: 0, O: 0, T: 0 })

      return NextResponse.json({
        year,
        counties: yearData,
        totals,
        summary: {
          totalCounties: yearData.length,
          demVotes: totals.D,
          repVotes: totals.R,
          otherVotes: totals.O,
          totalVotes: totals.T,
          demPercent: totals.T > 0 ? (totals.D / totals.T) * 100 : 0,
          repPercent: totals.T > 0 ? (totals.R / totals.T) * 100 : 0,
          winner: totals.D > totals.R ? 'Democrat' : 'Republican',
          margin: totals.T > 0 ? Math.abs((totals.D - totals.R) / totals.T) * 100 : 0
        }
      })
    }

    // Return all results
    return NextResponse.json({ results })

  } catch (error: any) {
    console.error('[ELECTIONS_API]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get available election years
export async function OPTIONS() {
  try {
    // Get a sample county to extract available years
    const sample = await prisma.countyElectionResult.findFirst()
    
    if (!sample) {
      return NextResponse.json({ years: [] })
    }

    const electionData = sample.electionData as any
    const years = Object.keys(electionData)
      .filter(key => /^\d{4}$/.test(key))
      .sort((a, b) => parseInt(b) - parseInt(a))

    return NextResponse.json({ years })

  } catch (error: any) {
    console.error('[ELECTIONS_OPTIONS]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}