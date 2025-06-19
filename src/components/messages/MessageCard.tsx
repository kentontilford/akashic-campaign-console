import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CalendarIcon, UserGroupIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface MessageCardProps {
  title: string
  preview: string
  status: 'draft' | 'pending' | 'approved' | 'published'
  audience: string
  scheduledFor?: Date
  onClick?: () => void
}

const statusConfig = {
  draft: { variant: 'secondary' as const, label: 'Draft' },
  pending: { variant: 'warning' as const, label: 'Pending' },
  approved: { variant: 'success' as const, label: 'Approved' },
  published: { variant: 'default' as const, label: 'Published' },
}

export function MessageCard({
  title,
  preview,
  status,
  audience,
  scheduledFor,
  onClick,
}: MessageCardProps) {
  const { variant, label } = statusConfig[status]
  
  return (
    <Card variant="interactive" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          <Badge variant={variant} className="ml-2">
            {label}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {preview}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            <span>{audience}</span>
          </div>
          {scheduledFor && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(scheduledFor).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="ml-auto">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}