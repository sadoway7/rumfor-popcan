import React from 'react'
import { Link } from 'react-router-dom'
import { Application, ApplicationStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface ApplicationCardProps {
  application: Application
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onWithdraw?: (id: string) => void
  onViewDetails?: (id: string) => void
  className?: string
}

const statusColors: Record<ApplicationStatus, string> = {
  'draft': 'bg-muted text-muted-foreground border-muted',
  'submitted': 'bg-info/10 text-info border-info/20',
  'under-review': 'bg-warning/10 text-warning border-warning/20',
  'approved': 'bg-success/10 text-success border-success/20',
  'rejected': 'bg-destructive/10 text-destructive border-destructive/20',
  'withdrawn': 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<ApplicationStatus, string> = {
  'draft': 'Draft',
  'submitted': 'Submitted',
  'under-review': 'Under Review',
  'approved': 'Approved',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  variant = 'default',
  showActions = true,
  onApprove,
  onReject,
  onWithdraw,
  onViewDetails,
  className
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getActionButtons = () => {
    if (!showActions) return null

    switch (application.status) {
      case 'draft':
        return (
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => onViewDetails?.(application.id)}>
              Continue Application
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onWithdraw?.(application.id)}
            >
              Withdraw
            </Button>
          </div>
        )
      
      case 'submitted':
      case 'under-review':
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails?.(application.id)}>
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onWithdraw?.(application.id)}
            >
              Withdraw
            </Button>
          </div>
        )
      
      case 'approved':
        return (
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => onViewDetails?.(application.id)}>
              View Details
            </Button>
          </div>
        )
      
      case 'rejected':
      case 'withdrawn':
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails?.(application.id)}>
              View Details
            </Button>
          </div>
        )
      
      default:
        return null
    }
  }

  const getPromoterActions = () => {
    if (!showActions || !onApprove || !onReject) return null

    if (application.status === 'submitted' || application.status === 'under-review') {
      return (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => onApprove(application.id)}
            className="bg-success hover:bg-success/90"
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onReject(application.id)}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Reject
          </Button>
          <Button size="sm" variant="outline" onClick={() => onViewDetails?.(application.id)}>
            Review
          </Button>
        </div>
      )
    }

    return (
      <Button size="sm" variant="outline" onClick={() => onViewDetails?.(application.id)}>
        View Details
      </Button>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/applications/${application.id}`}
              className="font-semibold hover:text-accent transition-colors"
            >
              {application.market.name}
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {application.market.location.city}, {application.market.location.state}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={cn('text-xs', statusColors[application.status])}
              >
                {statusLabels[application.status]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(application.createdAt)}
              </span>
            </div>
          </div>
          
          {showActions && (
            <div className="ml-4">
              {application.vendorId !== application.vendor.id ? 
                getPromoterActions() : 
                getActionButtons()
              }
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                to={`/applications/${application.id}`}
                className="text-xl font-semibold hover:text-accent transition-colors"
              >
                {application.market.name}
              </Link>
              <Badge 
                variant="outline" 
                className={cn(statusColors[application.status])}
              >
                {statusLabels[application.status]}
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-3">
              {application.market.location.address}, {application.market.location.city}, {application.market.location.state}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <span className="ml-2 font-medium">{formatDate(application.createdAt)}</span>
              </div>
              
              {application.reviewedAt && (
                <div>
                  <span className="text-muted-foreground">Reviewed:</span>
                  <span className="ml-2 font-medium">{formatDate(application.reviewedAt)}</span>
                </div>
              )}
              
              <div>
                <span className="text-muted-foreground">Vendor:</span>
                <span className="ml-2 font-medium">
                  {application.vendor.firstName} {application.vendor.lastName}
                </span>
              </div>
              
              {application.notes && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="mt-1 text-sm">{application.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="ml-6">
              {application.vendorId !== application.vendor.id ? 
                getPromoterActions() : 
                getActionButtons()
              }
            </div>
          )}
        </div>
        
        {/* Application Summary */}
        {application.submittedData.businessDescription && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Business Description</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {application.submittedData.businessDescription}
            </p>
          </div>
        )}
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              to={`/applications/${application.id}`}
              className="text-lg font-semibold hover:text-accent transition-colors"
            >
              {application.market.name}
            </Link>
            <Badge 
              variant="outline" 
              className={cn(statusColors[application.status])}
            >
              {statusLabels[application.status]}
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-2">
            {application.market.location.city}, {application.market.location.state}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Submitted: {formatDate(application.createdAt)}</span>
            {application.reviewedAt && (
              <span>Reviewed: {formatDate(application.reviewedAt)}</span>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="ml-6">
            {application.vendorId !== application.vendor.id ? 
              getPromoterActions() : 
              getActionButtons()
            }
          </div>
        )}
      </div>
      
      {/* Application Preview */}
      {application.submittedData.businessDescription && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Business Description</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {application.submittedData.businessDescription}
          </p>
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="border-t pt-4 mt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Vendor</div>
            <div className="text-sm">
              {application.vendor.firstName} {application.vendor.lastName}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground">Business</div>
            <div className="text-sm">
              {application.submittedData.businessName || 'N/A'}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground">Experience</div>
            <div className="text-sm">
              {application.submittedData.experience || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}