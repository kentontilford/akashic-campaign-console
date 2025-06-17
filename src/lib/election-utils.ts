import { ElectionYear } from '@/types/mapping'

export const VALID_ELECTION_YEARS: ElectionYear[] = [
  1892, 1896, 1900, 1904, 1908, 1912, 1916, 1920,
  1924, 1928, 1932, 1936, 1940, 1944, 1948, 1952,
  1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984,
  1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016,
  2020, 2024
]

export const MODERN_ELECTION_YEARS: ElectionYear[] = VALID_ELECTION_YEARS.filter(year => year >= 1960)

export function validateElectionYear(year: number, state?: string): boolean {
  // Handle missing data exceptions
  if (state === 'MS' && (year === 1904 || year === 1908)) return false
  if (state === 'TX' && year >= 1892 && year <= 1908) return false
  return VALID_ELECTION_YEARS.includes(year as ElectionYear)
}

export function getElectionColumns(year: number) {
  return {
    democratic: `${year}_D`,
    republican: `${year}_R`,
    other: `${year}_O`,
    total: `${year}_T`
  }
}

export function calculateSwing(fromData: any, toData: any): number {
  if (!fromData || !toData || !fromData.T || !toData.T) return 0
  
  const fromDemMargin = (fromData.D / fromData.T) - (fromData.R / fromData.T)
  const toDemMargin = (toData.D / toData.T) - (toData.R / toData.T)
  return (toDemMargin - fromDemMargin) * 100
}

export function getSwingColor(swing: number): string {
  const maxSwing = 20
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
}

export function formatElectionResult(votes: number, total: number): string {
  const percentage = (votes / total * 100).toFixed(1)
  return `${votes.toLocaleString()} (${percentage}%)`
}