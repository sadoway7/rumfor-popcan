import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { ApplicationStatus as StatusType } from '@/types'
import { cn } from '@/utils/cn'

interface ApplicationStatusProps {
  status: StatusType
  showProgress?: boolean
  className?: string
}

const statusConfig: Record<StatusType, {
  label: string
  variant: 'default' | 'destructive' | 'outline' | 'success' | 'warning' | 'muted'
  className: string
  description: string
}> = {
  'draft': {
    label: 'Draft',
    variant: 'muted',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    description: 'Application started but not yet submitted'
  },
  'submitted': {
    label: 'Submitted',
    variant: 'default',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Application submitted and awaiting review'
  },
  'under-review': {
    label: 'Under Review',
    variant: 'warning',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    description: 'Promoter is reviewing your application'
  },
  'approved': {
    label: 'Approved',
    variant: 'success',
    className: 'bg-green-50 text-green-700 border-green-200',
    description: 'Application approved! You can proceed with the market.'
  },
  'rejected': {
    label: 'Rejected',
    variant: 'destructive',
    className: 'bg-red-50 text-red-700 border-red-200',
    description: 'Application was not accepted for this market'
  },
  'withdrawn': {
    label: 'Withdrawn',
    variant: 'muted',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    description: 'Application was withdrawn by the vendor'
  }
}

const getStatusProgress = (status: StatusType): { current: number; total: number } => {
  switch (status) {
    case 'draft':
      return { current: 1, total: 5 }
    case 'submitted':
      return { current: 2, total: 5 }
    case 'under-review':
      return { current: 3, total: 5 }
    case 'approved':
      return { current: 5, total: 5 }
    case 'rejected':
      return { current: 4, total: 5 }
    case 'withdrawn':
      return { current: 0, total: 5 }
    default:
      return { current: 0, total: 5 }
  }
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  status,
  showProgress = false,
  className
}) => {
  const config = statusConfig[status]
  const progress = getStatusProgress(status)
  const progressPercentage = (progress.current / progress.total) * 100

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Badge 
          variant={config.variant}
          className={cn('text-xs font-medium', config.className)}
        >
          {config.label}
        </Badge>
        
        {showProgress && status !== 'draft' && status !== 'withdrawn' && (
          <div className="flex items-center gap-2 min-w-0">
            <Progress 
              value={progressPercentage} 
              className="w-16 h-1"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {progress.current}/{progress.total}
            </span>
          </div>
        )}
      </div>
      
      {showProgress && (
        <div className="text-xs text-muted-foreground">
          {config.description}
        </div>
      )}
    </div>
  )
}

// Status History Component
interface StatusHistoryProps {
  status: StatusType
  submittedAt?: string
  reviewedAt?: string
  className?: string
}

export const StatusHistory: React.FC<StatusHistoryProps> = ({
  status,
  submittedAt,
  reviewedAt,
  className
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getHistorySteps = () => {
    const steps: Array<{
      status: string
      label: string
      date: string | null
      completed: boolean
    }> = [
      {
        status: 'draft',
        label: 'Application Created',
        date: null, // We don't track when draft was created in current data
        completed: true
      }
    ]

    if (submittedAt) {
      steps.push({
        status: 'submitted',
        label: 'Application Submitted',
        date: submittedAt,
        completed: true
      })
    }

    if (reviewedAt && (status === 'approved' || status === 'rejected')) {
      steps.push({
        status: 'under-review',
        label: 'Under Review',
        date: reviewedAt,
        completed: true
      })

      steps.push({
        status: status,
        label: status === 'approved' ? 'Application Approved' : 'Application Rejected',
        date: reviewedAt,
        completed: true
      })
    } else if (status === 'under-review') {
      const reviewDate = reviewedAt || submittedAt
      if (reviewDate) {
        steps.push({
          status: 'under-review',
          label: 'Under Review',
          date: reviewDate,
          completed: true
        })
      }
    }

    return steps
  }

  const historySteps = getHistorySteps()

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium">Application History</h4>
      
      <div className="space-y-2">
        {historySteps.map((step) => (
          <div key={step.status} className="flex items-center gap-3">
            <div className={cn(
              'w-2 h-2 rounded-full',
              step.completed ? 'bg-success' : 'bg-muted'
            )} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-sm',
                  step.completed ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
                
                {step.date && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(step.date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Status Badge for compact displays
export const StatusBadge: React.FC<{
  status: StatusType
  className?: string
}> = ({ status, className }) => {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant}
      className={cn('text-xs font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}