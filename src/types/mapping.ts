export type ElectionYear = 1892 | 1896 | 1900 | 1904 | 1908 | 1912 | 1916 | 1920 | 
  1924 | 1928 | 1932 | 1936 | 1940 | 1944 | 1948 | 1952 | 1956 | 1960 |
  1964 | 1968 | 1972 | 1976 | 1980 | 1984 | 1988 | 1992 | 1996 | 2000 |
  2004 | 2008 | 2012 | 2016 | 2020 | 2024

export type MapDataType = 'election' | 'demographics'

export interface ElectionResult {
  D: number  // Democratic votes
  R: number  // Republican votes
  O: number  // Other votes
  T: number  // Total votes
}

export interface CountyElectionData {
  fipsCode: string
  countyName: string
  stateAbbr: string
  stateName: string
  fromYear: ElectionResult
  toYear: ElectionResult
  swing: number  // Positive = Democratic gain, Negative = Republican gain
  marginChange: number
}

export interface CountyDemographicData {
  fipsCode: string
  countyName: string
  stateAbbr: string
  stateName: string
  population: number
  medianAge: number
  medianHouseholdIncome: number
  povertyRate: number
  unemploymentRate: number
  collegeDegreeRate: number
  whitePercentage: number
  blackPercentage: number
  hispanicPercentage: number
  asianPercentage: number
  populationDensity: number
  urbanPercentage: number
}

export interface CountyGeoJSON {
  type: 'Feature'
  properties: {
    GEOID: string
    NAME: string
    STATE: string
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface StateOption {
  value: string
  label: string
  abbr: string
}