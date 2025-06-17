'use client'

import { MapDataType, ElectionYear } from '@/types/mapping'
import ExportControls from './ExportControls'

interface MapControlsProps {
  dataType: MapDataType
  setDataType: (type: MapDataType) => void
  fromYear: ElectionYear
  setFromYear: (year: ElectionYear) => void
  toYear: ElectionYear
  setToYear: (year: ElectionYear) => void
  viewMode: 'national' | 'state'
  setViewMode: (mode: 'national' | 'state') => void
  selectedState: string
  setSelectedState: (state: string) => void
}

const ELECTION_YEARS: ElectionYear[] = [
  1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996,
  2000, 2004, 2008, 2012, 2016, 2020, 2024
]

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
]

export default function MapControls({
  dataType,
  setDataType,
  fromYear,
  setFromYear,
  toYear,
  setToYear,
  viewMode,
  setViewMode,
  selectedState,
  setSelectedState
}: MapControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Data Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Type
          </label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setDataType('election')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                dataType === 'election'
                  ? 'bg-akashic-primary text-white border-akashic-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Election Results
            </button>
            <button
              type="button"
              onClick={() => setDataType('demographics')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                dataType === 'demographics'
                  ? 'bg-akashic-primary text-white border-akashic-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Demographics
            </button>
          </div>
        </div>

        {/* Election Comparison */}
        {dataType === 'election' && (
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Election Comparison
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <select
                  value={fromYear}
                  onChange={(e) => setFromYear(Number(e.target.value) as ElectionYear)}
                  className="form-select w-full"
                >
                  {ELECTION_YEARS.filter(year => year < toYear).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex-1">
                <select
                  value={toYear}
                  onChange={(e) => setToYear(Number(e.target.value) as ElectionYear)}
                  className="form-select w-full"
                >
                  {ELECTION_YEARS.filter(year => year > fromYear).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn-primary text-sm whitespace-nowrap"
              >
                View Swing Analysis
              </button>
            </div>
          </div>
        )}

        {/* View Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View
          </label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('national')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'national'
                  ? 'bg-akashic-primary text-white border-akashic-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              National
            </button>
            <button
              type="button"
              onClick={() => setViewMode('state')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'state'
                  ? 'bg-akashic-primary text-white border-akashic-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              State Only
            </button>
          </div>
        </div>

        {/* State Selection */}
        {viewMode === 'state' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="form-select w-full"
            >
              <option value="">Choose a state</option>
              {STATES.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Export Options */}
        <div className="flex items-end">
          <ExportControls
            mapElementId="election-map-container"
            dataType={dataType}
            fromYear={dataType === 'election' ? fromYear : undefined}
            toYear={dataType === 'election' ? toYear : undefined}
          />
        </div>
      </div>
    </div>
  )
}