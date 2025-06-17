'use client'

import { useEffect, useRef } from 'react'

interface CountyElectionChartProps {
  electionData: any
}

export default function CountyElectionChart({ electionData }: CountyElectionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !electionData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Extract years and calculate percentages
    const years: number[] = []
    const demPercentages: number[] = []
    const repPercentages: number[] = []

    for (let year = 1960; year <= 2024; year += 4) {
      const data = electionData[year.toString()]
      if (data && data.T > 0) {
        years.push(year)
        demPercentages.push((data.D / data.T) * 100)
        repPercentages.push((data.R / data.T) * 100)
      }
    }

    if (years.length === 0) return

    // Calculate scales
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2
    const xScale = chartWidth / (years.length - 1)
    const yScale = chartHeight / 100

    // Draw axes
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6'
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i * chartHeight / 10)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Draw 50% line
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding, padding + chartHeight / 2)
    ctx.lineTo(canvas.width - padding, padding + chartHeight / 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw Democratic line
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    years.forEach((year, i) => {
      const x = padding + i * xScale
      const y = canvas.height - padding - (demPercentages[i] * yScale)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw Republican line
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    years.forEach((year, i) => {
      const x = padding + i * xScale
      const y = canvas.height - padding - (repPercentages[i] * yScale)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw data points
    years.forEach((year, i) => {
      const x = padding + i * xScale
      
      // Democratic point
      ctx.fillStyle = '#2563eb'
      ctx.beginPath()
      ctx.arc(x, canvas.height - padding - (demPercentages[i] * yScale), 3, 0, Math.PI * 2)
      ctx.fill()
      
      // Republican point
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(x, canvas.height - padding - (repPercentages[i] * yScale), 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = '#374151'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    
    // Year labels (every other year to avoid crowding)
    years.forEach((year, i) => {
      if (i % 2 === 0) {
        const x = padding + i * xScale
        ctx.fillText(year.toString(), x, canvas.height - padding + 20)
      }
    })

    // Y-axis labels
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const percent = i * 20
      const y = canvas.height - padding - (percent * yScale)
      ctx.fillText(`${percent}%`, padding - 10, y + 4)
    }

    // Legend
    ctx.textAlign = 'left'
    ctx.fillStyle = '#2563eb'
    ctx.fillRect(canvas.width - 150, 20, 12, 12)
    ctx.fillStyle = '#374151'
    ctx.fillText('Democratic', canvas.width - 130, 30)
    
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(canvas.width - 150, 40, 12, 12)
    ctx.fillStyle = '#374151'
    ctx.fillText('Republican', canvas.width - 130, 50)

  }, [electionData])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-[300px]"
      style={{ maxWidth: '100%' }}
    />
  )
}