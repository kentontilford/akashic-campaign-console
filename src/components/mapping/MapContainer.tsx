'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapDataType, ElectionYear, CountyElectionData, CountyDemographicData } from '@/types/mapping'
import CountyTooltip from './CountyTooltip'

interface MapContainerProps {
  data: any
  dataType: MapDataType
  fromYear: ElectionYear
  toYear: ElectionYear
  viewMode: 'national' | 'state'
  selectedState: string
}

// Fix Leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

export default function MapContainer({
  data,
  dataType,
  fromYear,
  toYear,
  viewMode,
  selectedState
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [tooltipContent, setTooltipContent] = useState<any>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const getSwingColor = useCallback((swing: number) => {
    // Positive swing = Democratic gain (blue), Negative = Republican gain (red)
    const maxSwing = 20 // Maximum expected swing percentage
    const normalizedSwing = Math.max(-1, Math.min(1, swing / maxSwing))
    
    if (normalizedSwing > 0) {
      // Democratic gain - shades of blue
      const intensity = Math.abs(normalizedSwing)
      return `rgba(37, 99, 235, ${0.3 + intensity * 0.7})`
    } else if (normalizedSwing < 0) {
      // Republican gain - shades of red
      const intensity = Math.abs(normalizedSwing)
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`
    }
    return '#e5e7eb' // Gray for no change
  }, [])

  const getDemographicColor = useCallback((value: number, metric: string) => {
    // Simple gradient for demographic data
    if (metric === 'income') {
      const min = 30000
      const max = 100000
      const normalized = (value - min) / (max - min)
      const intensity = Math.max(0, Math.min(1, normalized))
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`
    }
    return '#e5e7eb'
  }, [])

  const getCountyStyle = useCallback((countyData: any, dataType: MapDataType) => {
    const baseStyle = {
      fillOpacity: 0.7,
      weight: 1,
      color: '#666',
    }

    if (!countyData) {
      return { ...baseStyle, fillColor: '#ccc' }
    }

    if (dataType === 'election') {
      // Color based on swing
      const swing = countyData.swing || 0
      const color = getSwingColor(swing)
      return { ...baseStyle, fillColor: color }
    } else {
      // Color based on demographic metric (e.g., median income)
      const value = countyData.medianHouseholdIncome || 0
      const color = getDemographicColor(value, 'income')
      return { ...baseStyle, fillColor: color }
    }
  }, [getSwingColor, getDemographicColor])

  useEffect(() => {
    if (!mapContainerRef.current || !data) return

    // Initialize map if not already created
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [39.8283, -98.5795], // Center of USA
        zoom: viewMode === 'national' ? 4 : 6,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 10,
        minZoom: 3,
      }).addTo(mapRef.current)
    }

    // Clear existing layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        mapRef.current?.removeLayer(layer)
      }
    })

    // Add county boundaries and data
    if (data.counties && data.geoJson) {
      const geoJsonLayer = L.geoJSON(data.geoJson, {
        style: (feature) => {
          const countyData = data.counties.find(
            (c: any) => c.fipsCode === feature?.properties?.GEOID
          )
          return getCountyStyle(countyData, dataType)
        },
        onEachFeature: (feature, layer) => {
          const countyData = data.counties.find(
            (c: any) => c.fipsCode === feature?.properties?.GEOID
          )
          
          if (countyData) {
            // Add hover interactions
            layer.on({
              mouseover: (e) => {
                const layer = e.target
                layer.setStyle({
                  weight: 3,
                  color: '#333',
                  fillOpacity: 0.8
                })
                setTooltipContent(countyData)
                setTooltipPosition({ x: e.originalEvent.pageX, y: e.originalEvent.pageY })
              },
              mouseout: (e) => {
                geoJsonLayer.resetStyle(e.target)
                setTooltipContent(null)
              },
              click: () => {
                router.push(`/mapping/county/${countyData.fipsCode}`)
              }
            })
          }
        }
      }).addTo(mapRef.current)

      // Fit bounds based on view mode
      if (viewMode === 'state' && selectedState) {
        const stateBounds = getStateBounds(data.geoJson, selectedState)
        if (stateBounds) {
          mapRef.current.fitBounds(stateBounds, { padding: [50, 50] })
        }
      }
    }

    return () => {
      // Cleanup
    }
  }, [data, dataType, fromYear, toYear, viewMode, selectedState, router, getCountyStyle])

  const getStateBounds = (geoJson: any, stateAbbr: string): L.LatLngBounds | null => {
    // Calculate bounds for the selected state
    const stateFeatures = geoJson.features.filter(
      (f: any) => f.properties.STATE === stateAbbr
    )
    
    if (stateFeatures.length === 0) return null
    
    const bounds = L.geoJSON({ 
      type: 'FeatureCollection', 
      features: stateFeatures 
    } as any).getBounds()
    
    return bounds
  }

  return (
    <>
      <div id="election-map-container" ref={mapContainerRef} className="w-full h-full rounded-lg" />
      
      {tooltipContent && (
        <CountyTooltip
          data={tooltipContent}
          dataType={dataType}
          fromYear={fromYear}
          toYear={toYear}
          position={tooltipPosition}
        />
      )}
    </>
  )
}