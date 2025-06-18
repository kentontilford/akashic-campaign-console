import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const state = searchParams.get('state') || null

    const whereClause = state ? { stateAbbr: state } : {}
    
    const counties = await prisma.county.findMany({
      where: whereClause,
      select: {
        fipsCode: true,
        countyName: true,
        stateName: true,
        stateAbbr: true,
        americanNationRegion: true,
        centroidLat: true,
        centroidLng: true
      },
      orderBy: [
        { stateAbbr: 'asc' },
        { countyName: 'asc' }
      ]
    })

    const formattedCounties = counties.map(county => ({
      ...county,
      centroidLat: county.centroidLat ? parseFloat(county.centroidLat.toString()) : null,
      centroidLng: county.centroidLng ? parseFloat(county.centroidLng.toString()) : null
    }))

    return NextResponse.json({ counties: formattedCounties })
  } catch (error) {
    console.error('Counties error:', error)
    return NextResponse.json(
      { error: 'Failed to load counties' },
      { status: 500 }
    )
  }
}