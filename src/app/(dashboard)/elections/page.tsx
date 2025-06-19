'use client'

import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { 
  ChartBarIcon,
  MapIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  FlagIcon
} from '@/lib/icons'
import toast from 'react-hot-toast'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ElectionData {
  year: string
  counties: County[]
  totals: {
    D: number
    R: number
    O: number
    T: number
  }
  summary: {
    totalCounties: number
    demVotes: number
    repVotes: number
    otherVotes: number
    totalVotes: number
    demPercent: number
    repPercent: number
    winner: string
    margin: number
  }
}

interface County {
  countyFips: string
  countyName: string
  stateAbbr: string
  stateName: string
  yearResult: {
    D: number
    R: number
    O: number
    T: number
  }
  demPercent: number
  repPercent: number
  margin: number
}

const COLORS = {
  democrat: '#2563eb',
  republican: '#dc2626',
  other: '#6b7280',
  demLight: '#93bbfc',
  repLight: '#fca5a5'
}

export default function ElectionsPage() {
  const [selectedYear, setSelectedYear] = useState('2020')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [electionData, setElectionData] = useState<ElectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState<string>('')
  const [historicalData, setHistoricalData] = useState<any[]>([])

  useEffect(() => {
    fetchAvailableYears()
  }, [])

  useEffect(() => {
    if (selectedYear) {
      fetchElectionData(selectedYear)
    }
  }, [selectedYear, selectedState])

  const fetchAvailableYears = async () => {
    try {
      const res = await fetch('/api/elections', { method: 'OPTIONS' })
      const data = await res.json()
      setAvailableYears(data.years || [])
      if (data.years?.length > 0 && !selectedYear) {
        setSelectedYear(data.years[0])
      }
    } catch (error) {
      toast.error('Failed to load election years')
    }
  }

  const fetchElectionData = async (year: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ year })
      if (selectedState) params.append('state', selectedState)
      
      const res = await fetch(`/api/elections?${params}`)
      if (!res.ok) throw new Error('Failed to fetch election data')
      
      const data = await res.json()
      setElectionData(data)

      // Calculate historical trend
      if (!selectedState) {
        fetchHistoricalTrend()
      }
    } catch (error) {
      toast.error('Failed to load election data')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoricalTrend = async () => {
    try {
      const trendData = []
      const yearsToFetch = availableYears.slice(0, 10) // Last 10 elections
      
      for (const year of yearsToFetch) {
        const res = await fetch(`/api/elections?year=${year}`)
        const data = await res.json()
        if (data.summary) {
          trendData.push({
            year,
            demPercent: data.summary.demPercent.toFixed(1),
            repPercent: data.summary.repPercent.toFixed(1),
            margin: data.summary.margin.toFixed(1),
            winner: data.summary.winner
          })
        }
      }
      
      setHistoricalData(trendData.reverse())
    } catch (error) {
      console.error('Failed to fetch historical trend', error)
    }
  }

  if (loading || !electionData) {
    return (
      <PageLayout title="Presidential Elections" description="Historical presidential election data and analysis">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading election data...</div>
        </div>
      </PageLayout>
    )
  }

  const { summary, counties } = electionData

  // Prepare data for charts
  const voteShareData = [
    { name: 'Democrat', value: summary.demVotes, percent: summary.demPercent },
    { name: 'Republican', value: summary.repVotes, percent: summary.repPercent },
    { name: 'Other', value: summary.otherVotes, percent: (summary.otherVotes / summary.totalVotes) * 100 }
  ]

  // Top counties by margin
  const topDemCounties = [...counties]
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 10)
    .reverse()

  const topRepCounties = [...counties]
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10)

  // States list for filter
  const states = Array.from(new Set(counties.map(c => c.stateAbbr))).sort()

  return (
    <PageLayout 
      title="Presidential Elections"
      description="Historical presidential election data and analysis"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Election Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-akashic-primary focus:border-akashic-primary sm:text-sm rounded-md"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State Filter
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-akashic-primary focus:border-akashic-primary sm:text-sm rounded-md"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">Total Counties</div>
              <div className="text-2xl font-bold">{summary.totalCounties}</div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Winner</p>
                <p className={`text-2xl font-bold ${
                  summary.winner === 'Democrat' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {summary.winner}
                </p>
                <p className="text-sm text-gray-500">
                  {summary.margin.toFixed(1)}% margin
                </p>
              </div>
              <FlagIcon className={`h-8 w-8 ${
                summary.winner === 'Democrat' ? 'text-blue-600' : 'text-red-600'
              }`} />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Democrat</p>
                <p className="text-2xl font-bold text-blue-900">
                  {summary.demVotes.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">
                  {summary.demPercent.toFixed(1)}%
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Republican</p>
                <p className="text-2xl font-bold text-red-900">
                  {summary.repVotes.toLocaleString()}
                </p>
                <p className="text-sm text-red-600">
                  {summary.repPercent.toFixed(1)}%
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalVotes.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Turnout data
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vote Share Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Vote Share</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={voteShareData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={COLORS.democrat} />
                  <Cell fill={COLORS.republican} />
                  <Cell fill={COLORS.other} />
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Trend */}
          {historicalData.length > 0 && !selectedState && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Historical Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="demPercent" 
                    stroke={COLORS.democrat} 
                    name="Democrat %" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="repPercent" 
                    stroke={COLORS.republican} 
                    name="Republican %" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Counties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Democratic Counties */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 text-blue-600">
              Top Democratic Counties
            </h3>
            <div className="space-y-2">
              {topDemCounties.map((county, idx) => (
                <div key={county.countyFips} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {idx + 1}.
                    </span>
                    <div className="ml-2">
                      <p className="text-sm font-medium">
                        {county.countyName}, {county.stateAbbr}
                      </p>
                      <p className="text-xs text-gray-500">
                        {county.yearResult.D.toLocaleString()} votes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {county.demPercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      +{county.margin.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Republican Counties */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 text-red-600">
              Top Republican Counties
            </h3>
            <div className="space-y-2">
              {topRepCounties.map((county, idx) => (
                <div key={county.countyFips} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {idx + 1}.
                    </span>
                    <div className="ml-2">
                      <p className="text-sm font-medium">
                        {county.countyName}, {county.stateAbbr}
                      </p>
                      <p className="text-xs text-gray-500">
                        {county.yearResult.R.toLocaleString()} votes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      {county.repPercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      +{Math.abs(county.margin).toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State Comparison Table */}
        {!selectedState && counties.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">State Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Counties
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dem Votes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rep Votes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Votes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getStatesSummary(counties).map((state) => (
                    <tr key={state.stateAbbr} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {state.stateName} ({state.stateAbbr})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {state.counties}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                        {state.demVotes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                        {state.repVotes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {state.totalVotes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`font-medium ${
                          state.margin > 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {state.margin > 0 ? 'D' : 'R'} +{Math.abs(state.margin).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

function getStatesSummary(counties: County[]) {
  const statesMap = new Map<string, any>()
  
  counties.forEach(county => {
    if (!statesMap.has(county.stateAbbr)) {
      statesMap.set(county.stateAbbr, {
        stateAbbr: county.stateAbbr,
        stateName: county.stateName,
        counties: 0,
        demVotes: 0,
        repVotes: 0,
        totalVotes: 0
      })
    }
    
    const state = statesMap.get(county.stateAbbr)
    state.counties++
    state.demVotes += county.yearResult.D
    state.repVotes += county.yearResult.R
    state.totalVotes += county.yearResult.T
  })
  
  return Array.from(statesMap.values())
    .map(state => ({
      ...state,
      margin: ((state.demVotes - state.repVotes) / state.totalVotes) * 100
    }))
    .sort((a, b) => a.stateName.localeCompare(b.stateName))
}