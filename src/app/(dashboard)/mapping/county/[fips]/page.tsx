import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import PageLayout from '@/components/layout/PageLayout'
import CountyElectionChart from '@/components/mapping/CountyElectionChart'
import CountyDemographics from '@/components/mapping/CountyDemographics'
import { prisma } from '@/lib/db'

interface CountyPageProps {
  params: {
    fips: string
  }
}

export default async function CountyPage({ params }: CountyPageProps) {
  const { fips } = params

  // Fetch county data
  const county = await prisma.county.findUnique({
    where: { fipsCode: fips },
    include: {
      electionResults: true,
      demographics: {
        where: { dataYear: 2020 },
        take: 1
      }
    }
  })

  if (!county) {
    notFound()
  }

  // Parse election data
  const electionData = county.electionResults?.electionData as any || {}
  const demographics = county.demographics[0]

  // Get recent elections for prominent display
  const recentElections = [2020, 2024]
  const recentResults = recentElections.map(year => ({
    year,
    data: electionData[year.toString()]
  })).filter(r => r.data)

  return (
    <PageLayout
      title={`${county.countyName}, ${county.stateName}`}
      description="County Election Profile"
    >
      <div className="mb-6">
        <Link
          href="/mapping"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Election Mapping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* County Overview */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {county.countyName}, {county.stateAbbr}
                </p>
                {county.americanNationRegion && (
                  <p className="text-sm text-gray-600 mt-1">
                    American Nation: {county.americanNationRegion}
                  </p>
                )}
              </div>
              
              {demographics && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Population</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {demographics.population?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Density: {demographics.populationDensity ? parseFloat(demographics.populationDensity.toString()).toFixed(1) : 'N/A'} per sq mi
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Demographics</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {demographics.urbanPercentage ? parseFloat(demographics.urbanPercentage.toString()).toFixed(0) : 0}% Urban
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Median Age: {demographics.medianAge ? parseFloat(demographics.medianAge.toString()) : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Election Results */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Recent Election Results</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {recentResults.map(({ year, data }) => {
                  const demPct = ((data.D / data.T) * 100).toFixed(1)
                  const repPct = ((data.R / data.T) * 100).toFixed(1)
                  const margin = Math.abs(data.D - data.R)
                  const winner = data.D > data.R ? 'D' : 'R'
                  const marginPct = ((margin / data.T) * 100).toFixed(1)

                  return (
                    <div key={year} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-gray-900 mb-3">{year} Presidential Election</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className={`p-3 rounded ${data.D > data.R ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                          <div className="text-sm text-gray-600">Democratic</div>
                          <div className="text-xl font-semibold text-gray-900">{demPct}%</div>
                          <div className="text-sm text-gray-500">{data.D.toLocaleString()} votes</div>
                        </div>
                        
                        <div className={`p-3 rounded ${data.R > data.D ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                          <div className="text-sm text-gray-600">Republican</div>
                          <div className="text-xl font-semibold text-gray-900">{repPct}%</div>
                          <div className="text-sm text-gray-500">{data.R.toLocaleString()} votes</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className={winner === 'D' ? 'text-blue-600' : 'text-red-600'}>
                          {winner === 'D' ? 'Democratic' : 'Republican'} +{marginPct}%
                        </span>
                        <span className="text-gray-500 ml-2">
                          • Total votes: {data.T.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Historical Trends Chart */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Historical Voting Trends (1960-2024)</h2>
            </div>
            <div className="p-6">
              <CountyElectionChart electionData={electionData} />
            </div>
          </div>
        </div>

        {/* Demographics Panel */}
        <div className="lg:col-span-1">
          <CountyDemographics demographics={demographics} />
        </div>
      </div>
    </PageLayout>
  )
}