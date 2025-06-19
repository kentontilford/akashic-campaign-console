'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { MysticalCard } from '@/components/ui'

interface CampaignHealthScoreProps {
  score: number
  breakdown?: {
    messageEffectiveness: number
    voterEngagement: number
    campaignMomentum: number
    historicalAlignment: number
  }
}

export function CampaignHealthScore({ score, breakdown }: CampaignHealthScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const scoreColor = getScoreColor(score)
  const circumference = 2 * Math.PI * 120 // radius = 120
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <MysticalCard className="p-8">
      <h2 className="text-2xl font-bold text-black mb-8 text-center">Campaign Health Score</h2>
      
      <div className="relative w-80 h-80 mx-auto">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="120"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
          />
          {/* Animated score circle */}
          <circle
            cx="160"
            cy="160"
            r="120"
            fill="none"
            stroke={scoreColor}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-black mb-2">{score}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">Health Score</div>
          </div>
        </div>

        {/* Mystical glow effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-64 h-64 rounded-full opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${scoreColor}40 0%, transparent 70%)`
            }}
          />
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-4">
            Score Breakdown
          </h3>
          
          <ScoreBreakdownItem
            label="Message Effectiveness"
            value={breakdown.messageEffectiveness}
            description="How well your messages resonate"
          />
          <ScoreBreakdownItem
            label="Voter Engagement"
            value={breakdown.voterEngagement}
            description="Active voter interaction rate"
          />
          <ScoreBreakdownItem
            label="Campaign Momentum"
            value={breakdown.campaignMomentum}
            description="Growth and activity trends"
          />
          <ScoreBreakdownItem
            label="Historical Alignment"
            value={breakdown.historicalAlignment}
            description="Match with successful patterns"
          />
        </div>
      )}
    </MysticalCard>
  )
}

function ScoreBreakdownItem({ 
  label, 
  value, 
  description 
}: { 
  label: string
  value: number
  description: string
}) {
  const getValueColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="group cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={cn('text-sm font-bold', getValueColor(value))}>
          {value}%
        </span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-gray-400 to-black rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
        {description}
      </p>
    </div>
  )
}