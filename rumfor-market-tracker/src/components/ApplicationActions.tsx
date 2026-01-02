import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Application } from '@/types'
import { useVendorApplications, usePromoterApplications } from '@/features/applications/hooks/useApplications'
import { cn } from '@/utils/cn'

interface ApplicationActionsProps {
  application: Application
  onStatusChange?: (id: string, status: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ApplicationActions: React.FC<ApplicationActionsProps> = ({
  application,
  onStatusChange,
  size = 'md',
  className
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  
  const { withdrawApplication, isSubmitting: isVendorSubmitting } = useVendorApplications()
  const { updateStatus, isUpdating: isPromoterUpdating } = usePromoterApplications()

  const handleApprove = async () => {
    try {
      const success = await updateStatus(application.id, 'approved')
      if (success) {
        onStatusChange?.(application.id, 'approved')
      }
    } catch (error) {
      console.error('Failed to approve application:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return
    
    try {
      const success = await updateStatus(application.id, 'rejected', rejectionReason)
      if (success) {
        onStatusChange?.(application.id, 'rejected')
        setShowRejectModal(false)
        setRejectionReason('')
      }
    } catch (error) {
      console.error('Failed to reject application:', error)
    }
  }

  const handleWithdraw = async () => {
    try {
      await withdrawApplication(application.id)
      onStatusChange?.(application.id, 'withdrawn')
    } catch (error) {
      console.error('Failed to withdraw application:', error)
    }
  }

  const getActionButtons = () => {
    const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'sm'
    
    switch (application.status) {
      case 'draft':
        return (
          <div className="flex items-center gap-2">
            <Button
              size={buttonSize}
              onClick={() => window.location.href = `/applications/${application.id}/edit`}
            >
              Continue
            </Button>
            <Button
              size={buttonSize}
              variant="outline"
              onClick={handleWithdraw}
              disabled={isVendorSubmitting}
            >
              Withdraw
            </Button>
          </div>
        )

      case 'submitted':
      case 'under-review':
        return (
          <div className="flex items-center gap-2">
            <Button
              size={buttonSize}
              variant="outline"
              onClick={() => window.location.href = `/applications/${application.id}`}
            >
              View Details
            </Button>
            <Button
              size={buttonSize}
              variant="outline"
              onClick={handleWithdraw}
              disabled={isVendorSubmitting}
            >
              Withdraw
            </Button>
          </div>
        )

      case 'approved':
        return (
          <Button
            size={buttonSize}
            onClick={() => window.location.href = `/applications/${application.id}`}
          >
            View Details
          </Button>
        )

      case 'rejected':
      case 'withdrawn':
        return (
          <Button
            size={buttonSize}
            variant="outline"
            onClick={() => window.location.href = `/applications/${application.id}`}
          >
            View Details
          </Button>
        )

      default:
        return null
    }
  }

  const getPromoterActions = () => {
    const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'sm'
    
    if (application.status === 'submitted' || application.status === 'under-review') {
      return (
        <div className="flex items-center gap-2">
          <Button
            size={buttonSize}
            onClick={handleApprove}
            disabled={isPromoterUpdating}
            className="bg-success hover:bg-success/90"
          >
            Approve
          </Button>
          <Button
            size={buttonSize}
            variant="outline"
            onClick={() => setShowRejectModal(true)}
            disabled={true}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Reject
          </Button>
          <Button
            size={buttonSize}
            variant="outline"
            onClick={() => window.location.href = `/applications/${application.id}`}
          >
            Review
          </Button>
        </div>
      )
    }

    return (
      <Button
        size={buttonSize}
        variant="outline"
        onClick={() => window.location.href = `/applications/${application.id}`}
      >
        View Details
      </Button>
    )
  }

  // Determine if current user is the vendor or a promoter/admin
  // For now, assume vendor view, but this would be determined by checking user role vs application.vendorId
  const isVendorView = true
  
  return (
    <>
      <div className={cn('flex items-center', className)}>
        {isVendorView ? getActionButtons() : getPromoterActions()}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason for rejection
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this application..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isPromoterUpdating}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// Bulk Actions Component for Promoters
interface BulkActionsProps {
  selectedApplicationIds: string[]
  onBulkApprove: (ids: string[]) => void
  onBulkReject: (ids: string[]) => void
  onClearSelection: () => void
  isProcessing?: boolean
  className?: string
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedApplicationIds,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  isProcessing = false,
  className
}) => {
  if (selectedApplicationIds.length === 0) {
    return null
  }

  return (
    <div className={cn(
      'flex items-center justify-between p-4 bg-muted/50 rounded-lg border',
      className
    )}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedApplicationIds.length} application{selectedApplicationIds.length !== 1 ? 's' : ''} selected
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={onClearSelection}
          disabled={isProcessing}
        >
          Clear Selection
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onBulkApprove(selectedApplicationIds)}
          disabled={isProcessing}
          className="bg-success hover:bg-success/90"
        >
          Approve Selected
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkReject(selectedApplicationIds)}
          disabled={isProcessing}
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Reject Selected
        </Button>
      </div>
    </div>
  )
}