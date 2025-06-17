'use client'

interface CountyDemographicsProps {
  demographics: any
}

export default function CountyDemographics({ demographics }: CountyDemographicsProps) {
  if (!demographics) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Demographics</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500">No demographic data available</p>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => num.toLocaleString()
  const formatPercentage = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A'
    return `${num.toFixed(1)}%`
  }
  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A'
    return `$${num.toLocaleString()}`
  }

  const parseDecimal = (val: any): number | null => {
    if (!val) return null
    return typeof val === 'string' ? parseFloat(val) : val
  }

  return (
    <div className="space-y-6">
      {/* Economic Indicators */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Economic Indicators</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500">Median Household Income</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(demographics.medianHouseholdIncome)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Poverty Rate</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatPercentage(parseDecimal(demographics.povertyRate))}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Unemployment Rate</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatPercentage(parseDecimal(demographics.unemploymentRate))}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">College Degree Rate</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatPercentage(parseDecimal(demographics.collegeDegreeRate))}
            </div>
          </div>
        </div>
      </div>

      {/* Racial Demographics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Racial Composition</h2>
        </div>
        <div className="p-6 space-y-3">
          {[
            { label: 'White', value: parseDecimal(demographics.whitePercentage) },
            { label: 'Black', value: parseDecimal(demographics.blackPercentage) },
            { label: 'Hispanic', value: parseDecimal(demographics.hispanicPercentage) },
            { label: 'Asian', value: parseDecimal(demographics.asianPercentage) },
            { label: 'Other', value: parseDecimal(demographics.otherRacePercentage) }
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Language at Home</h2>
        </div>
        <div className="p-6 space-y-3">
          {[
            { label: 'English Only', value: parseDecimal(demographics.englishOnlyPercentage) },
            { label: 'Spanish', value: parseDecimal(demographics.spanishHomePercentage) },
            { label: 'Other Languages', value: parseDecimal(demographics.otherLanguagePercentage) }
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Other Metrics</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Voter Turnout Rate</span>
            <span className="text-sm font-medium text-gray-900">
              {formatPercentage(parseDecimal(demographics.voterTurnoutRate))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Urban Population</span>
            <span className="text-sm font-medium text-gray-900">
              {formatPercentage(parseDecimal(demographics.urbanPercentage))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Population Density</span>
            <span className="text-sm font-medium text-gray-900">
              {parseDecimal(demographics.populationDensity)?.toFixed(1) || 'N/A'} per sq mi
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}