import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card variant="glow" className={cn('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {trend === 'up' ? (
                <ChevronUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="p-3 bg-brand-50 rounded-lg text-brand-600">
              {icon}
            </div>
          </div>
        )}
      </div>
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-100/20" />
    </Card>
  )
}