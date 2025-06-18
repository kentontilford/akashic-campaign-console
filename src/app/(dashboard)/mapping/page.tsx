'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PageLayout from '@/components/layout/PageLayout'
import MapControls from '@/components/mapping/MapControls'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('@/components/mapping/MapContainer'),
  { 
    ssr: false,
    loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />
  }
)
import MapLegend from '@/components/mapping/MapLegend'
import { MapDataType, ElectionYear } from '@/types/mapping'
import toast from 'react-hot-toast'

export default function MappingPage() {
  const { data: session } = useSession()
  const [dataType, setDataType] = useState<MapDataType>('election')
  const [fromYear, setFromYear] = useState<ElectionYear>(2020)
  const [toYear, setToYear] = useState<ElectionYear>(2024)
  const [viewMode, setViewMode] = useState<'national' | 'state'>('national')
  const [selectedState, setSelectedState] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [mapData, setMapData] = useState<any>(null)

  // Load initial map data
  useEffect(() => {
    loadMapData()
  }, [dataType, fromYear, toYear, viewMode, selectedState])

  const loadMapData = async () => {
    setIsLoading(true)
    try {
      if (dataType === 'election') {
        const response = await fetch(
          `/api/mapping/swing-analysis?fromYear=${fromYear}&toYear=${toYear}${
            viewMode === 'state' ? `&state=${selectedState}` : ''
          }`
        )
        if (!response.ok) throw new Error('Failed to load election data')
        const data = await response.json()
        setMapData(data)
      } else {
        const response = await fetch(
          `/api/mapping/demographics${
            viewMode === 'state' ? `?state=${selectedState}` : ''
          }`
        )
        if (!response.ok) throw new Error('Failed to load demographic data')
        const data = await response.json()
        setMapData(data)
      }
    } catch (error) {
      toast.error('Failed to load map data')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <PageLayout
      title="Election Mapping"
      description="Visualize election results and demographic data at the county level"
    >
      <div className="space-y-6">
        {/* Controls Panel */}
        <MapControls
          dataType={dataType}
          setDataType={setDataType}
          fromYear={fromYear}
          setFromYear={setFromYear}
          toYear={toYear}
          setToYear={setToYear}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
        />

        {/* Map Visualization */}
        <div className="bg-white rounded-lg shadow">
          <div className="relative" style={{ height: '600px' }}>
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-akashic-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading map data...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                data={mapData}
                dataType={dataType}
                fromYear={fromYear}
                toYear={toYear}
                viewMode={viewMode}
                selectedState={selectedState}
              />
            )}
          </div>
        </div>

        {/* Legend */}
        {!isLoading && mapData && (
          <MapLegend
            dataType={dataType}
            data={mapData}
            fromYear={fromYear}
            toYear={toYear}
          />
        )}
      </div>
    </PageLayout>
  )
}