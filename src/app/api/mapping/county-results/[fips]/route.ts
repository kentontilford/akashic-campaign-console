import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { fips: string } }
) {
  try {
    const { fips } = params

    const county = await prisma.county.findUnique({
      where: { fipsCode: fips },
      include: {
        electionResults: true,
        demographics: {
          orderBy: { dataYear: 'desc' },
          take: 5
        }
      }
    })

    if (!county) {
      return NextResponse.json({ error: 'County not found' }, { status: 404 })
    }

    // Parse election data
    const electionData = county.electionResults?.electionData as any || {}
    
    // Format historical results
    const historicalResults = []
    for (let year = 1960; year <= 2024; year += 4) {
      const data = electionData[year.toString()]
      if (data) {
        historicalResults.push({
          year,
          democratic: data.D,
          republican: data.R,
          other: data.O,
          total: data.T,
          democraticPct: (data.D / data.T) * 100,
          republicanPct: (data.R / data.T) * 100,
          margin: ((data.D - data.R) / data.T) * 100
        })
      }
    }

    // Calculate notable patterns
    const swings = []
    for (let i = 1; i < historicalResults.length; i++) {
      const prev = historicalResults[i - 1]
      const curr = historicalResults[i]
      const swing = curr.margin - prev.margin
      swings.push({
        fromYear: prev.year,
        toYear: curr.year,
        swing
      })
    }

    const largestSwing = swings.reduce((max, s) => 
      Math.abs(s.swing) > Math.abs(max.swing) ? s : max, 
      swings[0]
    )

    return NextResponse.json({
      county: {
        fipsCode: county.fipsCode,
        countyName: county.countyName,
        stateName: county.stateName,
        stateAbbr: county.stateAbbr,
        americanNationRegion: county.americanNationRegion,
        centroidLat: county.centroidLat ? parseFloat(county.centroidLat.toString()) : null,
        centroidLng: county.centroidLng ? parseFloat(county.centroidLng.toString()) : null
      },
      historicalResults,
      demographics: county.demographics.map(d => ({
        ...d,
        medianAge: d.medianAge ? parseFloat(d.medianAge.toString()) : null,
        povertyRate: d.povertyRate ? parseFloat(d.povertyRate.toString()) : null,
        unemploymentRate: d.unemploymentRate ? parseFloat(d.unemploymentRate.toString()) : null,
        collegeDegreeRate: d.collegeDegreeRate ? parseFloat(d.collegeDegreeRate.toString()) : null,
        whitePercentage: d.whitePercentage ? parseFloat(d.whitePercentage.toString()) : null,
        blackPercentage: d.blackPercentage ? parseFloat(d.blackPercentage.toString()) : null,
        hispanicPercentage: d.hispanicPercentage ? parseFloat(d.hispanicPercentage.toString()) : null,
        asianPercentage: d.asianPercentage ? parseFloat(d.asianPercentage.toString()) : null,
        otherRacePercentage: d.otherRacePercentage ? parseFloat(d.otherRacePercentage.toString()) : null,
        populationDensity: d.populationDensity ? parseFloat(d.populationDensity.toString()) : null,
        urbanPercentage: d.urbanPercentage ? parseFloat(d.urbanPercentage.toString()) : null,
        englishOnlyPercentage: d.englishOnlyPercentage ? parseFloat(d.englishOnlyPercentage.toString()) : null,
        spanishHomePercentage: d.spanishHomePercentage ? parseFloat(d.spanishHomePercentage.toString()) : null,
        otherLanguagePercentage: d.otherLanguagePercentage ? parseFloat(d.otherLanguagePercentage.toString()) : null,
        voterTurnoutRate: d.voterTurnoutRate ? parseFloat(d.voterTurnoutRate.toString()) : null
      })),
      patterns: {
        largestSwing,
        averageMargin: historicalResults.reduce((sum, r) => sum + r.margin, 0) / historicalResults.length,
        democraticWins: historicalResults.filter(r => r.margin > 0).length,
        republicanWins: historicalResults.filter(r => r.margin < 0).length
      }
    })
  } catch (error) {
    console.error('County results error:', error)
    return NextResponse.json(
      { error: 'Failed to load county results' },
      { status: 500 }
    )
  }
}