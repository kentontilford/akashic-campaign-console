'use client'

import { MapDataType, ElectionYear } from '@/types/mapping'

interface CountyTooltipProps {
  data: any
  dataType: MapDataType
  fromYear: ElectionYear
  toYear: ElectionYear
  position: { x: number; y: number }
}

export default function CountyTooltip({
  data,
  dataType,
  fromYear,
  toYear,
  position
}: CountyTooltipProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercentage = (num: number, decimals: number = 1) => {
    return `${num.toFixed(decimals)}%`
  }

  const renderElectionTooltip = () => {
    const demMarginFrom = ((data.fromYear.D / data.fromYear.T) - (data.fromYear.R / data.fromYear.T)) * 100
    const demMarginTo = ((data.toYear.D / data.toYear.T) - (data.toYear.R / data.toYear.T)) * 100
    const swing = data.swing || (demMarginTo - demMarginFrom)

    return (
      <>
        <div className="font-semibold text-gray-900 mb-2">
          {data.countyName}, {data.stateAbbr}
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="border-b pb-2">
            <div className="font-medium text-gray-700">{fromYear} Results</div>
            <div className="text-gray-600">
              Dem: {formatNumber(data.fromYear.D)} ({formatPercentage(data.fromYear.D / data.fromYear.T * 100)})
            </div>
            <div className="text-gray-600">
              Rep: {formatNumber(data.fromYear.R)} ({formatPercentage(data.fromYear.R / data.fromYear.T * 100)})
            </div>
            <div className="text-gray-600">
              Total: {formatNumber(data.fromYear.T)}
            </div>
          </div>

          <div className="border-b pb-2">
            <div className="font-medium text-gray-700">{toYear} Results</div>
            <div className="text-gray-600">
              Dem: {formatNumber(data.toYear.D)} ({formatPercentage(data.toYear.D / data.toYear.T * 100)})
            </div>
            <div className="text-gray-600">
              Rep: {formatNumber(data.toYear.R)} ({formatPercentage(data.toYear.R / data.toYear.T * 100)})
            </div>
            <div className="text-gray-600">
              Total: {formatNumber(data.toYear.T)}
            </div>
          </div>

          <div className="font-medium">
            <span className="text-gray-700">Swing: </span>
            <span className={swing > 0 ? 'text-blue-600' : 'text-red-600'}>
              {swing > 0 ? '+' : ''}{formatPercentage(swing)} {swing > 0 ? 'D' : 'R'}
            </span>
          </div>
        </div>
      </>
    )
  }

  const renderDemographicTooltip = () => {
    return (
      <>
        <div className="font-semibold text-gray-900 mb-2">
          {data.countyName}, {data.stateAbbr}
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div>Population: {formatNumber(data.population || 0)}</div>
          <div>Median Age: {data.medianAge || 'N/A'}</div>
          <div>Median Income: ${formatNumber(data.medianHouseholdIncome || 0)}</div>
          <div>Poverty Rate: {formatPercentage(data.povertyRate || 0)}</div>
          <div>College Degree: {formatPercentage(data.collegeDegreeRate || 0)}</div>
          <div>Urban: {formatPercentage(data.urbanPercentage || 0)}</div>
        </div>
      </>
    )
  }

  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-lg p-4 pointer-events-none"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 10}px`,
        maxWidth: '300px'
      }}
    >
      {dataType === 'election' ? renderElectionTooltip() : renderDemographicTooltip()}
      
      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
        Click to view detailed county profile
      </div>
    </div>
  )
}