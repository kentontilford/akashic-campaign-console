'use client'

import { MapDataType, ElectionYear } from '@/types/mapping'

interface MapLegendProps {
  dataType: MapDataType
  data: any
  fromYear: ElectionYear
  toYear: ElectionYear
}

export default function MapLegend({ dataType, data, fromYear, toYear }: MapLegendProps) {
  const renderElectionLegend = () => {
    const swingSteps = [
      { value: -20, label: '20%+ R', color: 'rgba(239, 68, 68, 1)' },
      { value: -15, label: '15% R', color: 'rgba(239, 68, 68, 0.85)' },
      { value: -10, label: '10% R', color: 'rgba(239, 68, 68, 0.7)' },
      { value: -5, label: '5% R', color: 'rgba(239, 68, 68, 0.55)' },
      { value: 0, label: 'No change', color: '#e5e7eb' },
      { value: 5, label: '5% D', color: 'rgba(37, 99, 235, 0.55)' },
      { value: 10, label: '10% D', color: 'rgba(37, 99, 235, 0.7)' },
      { value: 15, label: '15% D', color: 'rgba(37, 99, 235, 0.85)' },
      { value: 20, label: '20%+ D', color: 'rgba(37, 99, 235, 1)' },
    ]

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Election Swing {fromYear} → {toYear}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-red-600 font-medium">← Republican Gain</div>
          <div className="text-xs text-blue-600 font-medium">Democratic Gain →</div>
        </div>
        
        <div className="flex mt-2">
          {swingSteps.map((step, index) => (
            <div
              key={step.value}
              className="flex-1"
              style={{ backgroundColor: step.color, height: '20px' }}
              title={step.label}
            />
          ))}
        </div>
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">20%+</span>
          <span className="text-xs text-gray-500">10%</span>
          <span className="text-xs text-gray-500">0%</span>
          <span className="text-xs text-gray-500">10%</span>
          <span className="text-xs text-gray-500">20%+</span>
        </div>

        {data && data.summary && (
          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            <div>Total Counties: {data.summary.totalCounties}</div>
            <div>Democratic Gains: {data.summary.democraticGains} counties</div>
            <div>Republican Gains: {data.summary.republicanGains} counties</div>
            <div>Average Swing: {data.summary.averageSwing?.toFixed(1)}% {data.summary.averageSwing > 0 ? 'D' : 'R'}</div>
          </div>
        )}
      </div>
    )
  }

  const renderDemographicLegend = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Median Household Income
        </h3>
        
        <div className="flex items-center">
          <div className="flex-1">
            <div className="h-4 bg-gradient-to-r from-green-200 via-green-400 to-green-600 rounded"></div>
          </div>
        </div>
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">$30,000</span>
          <span className="text-xs text-gray-500">$65,000</span>
          <span className="text-xs text-gray-500">$100,000+</span>
        </div>

        {data && data.summary && (
          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            <div>Total Counties: {data.summary.totalCounties}</div>
            <div>Average Income: ${data.summary.averageIncome?.toLocaleString()}</div>
            <div>Median Income: ${data.summary.medianIncome?.toLocaleString()}</div>
          </div>
        )}
      </div>
    )
  }

  return dataType === 'election' ? renderElectionLegend() : renderDemographicLegend()
}