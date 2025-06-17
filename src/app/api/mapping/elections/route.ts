import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Return available election years
  const elections = [
    { year: 2024, label: '2024 Presidential Election' },
    { year: 2020, label: '2020 Presidential Election' },
    { year: 2016, label: '2016 Presidential Election' },
    { year: 2012, label: '2012 Presidential Election' },
    { year: 2008, label: '2008 Presidential Election' },
    { year: 2004, label: '2004 Presidential Election' },
    { year: 2000, label: '2000 Presidential Election' },
    { year: 1996, label: '1996 Presidential Election' },
    { year: 1992, label: '1992 Presidential Election' },
    { year: 1988, label: '1988 Presidential Election' },
    { year: 1984, label: '1984 Presidential Election' },
    { year: 1980, label: '1980 Presidential Election' },
    { year: 1976, label: '1976 Presidential Election' },
    { year: 1972, label: '1972 Presidential Election' },
    { year: 1968, label: '1968 Presidential Election' },
    { year: 1964, label: '1964 Presidential Election' },
    { year: 1960, label: '1960 Presidential Election' },
  ]

  return NextResponse.json({ elections })
}