import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui'
import { Input } from '@/components/ui'
import { Send, CheckCircle, XCircle, Loader2, Award } from 'lucide-react'

export interface VendorConversionRequestProps {
  userId: string
  userRole: 'vendor' | 'promoter' | 'admin'
  existingRequest?: {
    id: string
    status: 'pending' | 'approved' | 'rejected'
    requestedAt: string
    reason: string
    experience?: string
    marketsManaged?: number
  }
  onSubmitRequest?: (data: { reason: string; experience: string; marketsManaged: number }) => Promise<void>
  isLoading?: boolean
}

export const VendorConversionRequest: React.FC<VendorConversionRequestProps> = ({
  userId,
  userRole,
  existingRequest,
  onSubmitRequest,
  isLoading = false
}) => {
  const [reason, setReason] = useState('')
  const [experience, setExperience] = useState('')
  const [marketsManaged, setMarketsManaged] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const canRequestPromotion = userRole === 'vendor'
  const hasPendingRequest = existingRequest?.status === 'pending'
  const hasApprovedRequest = existingRequest?.status === 'approved'

  const handleSubmit = async () => {
    if (!reason.trim() || !experience.trim() || !onSubmitRequest) return

    setSubmitting(true)
    try {
      await onSubmitRequest({
        reason: reason.trim(),
        experience: experience.trim(),
        marketsManaged
      })
      setReason('')
      setExperience('')
      setMarketsManaged(0)
    } catch (error) {
      console.error('Failed to submit promotion request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Under Review</Badge>
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-purple-600" />
          Promoter Role Application
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Apply to become a promoter and gain the ability to create and manage formal markets with vendor applications.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="font-medium">Current Role: Vendor</div>
            <div className="text-sm text-muted-foreground">
              {userRole === 'vendor' ? 'Basic market creation and attendance tracking' : 'Advanced market management capabilities'}
            </div>
          </div>
          {existingRequest && getStatusBadge(existingRequest.status)}
        </div>

        {/* Existing Request Info */}
        {existingRequest && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {existingRequest.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />}
              {existingRequest.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {existingRequest.status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
              <span className="font-medium">Previous Application</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Applied on {new Date(existingRequest.requestedAt).toLocaleDateString()}
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Reason:</strong> {existingRequest.reason}
              </div>
              {existingRequest.experience && (
                <div className="text-sm">
                  <strong>Experience:</strong> {existingRequest.experience}
                </div>
              )}
              {existingRequest.marketsManaged && (
                <div className="text-sm">
                  <strong>Markets Managed:</strong> {existingRequest.marketsManaged}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promotion Request Form */}
        {canRequestPromotion && !hasApprovedRequest && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Apply for Promoter Role</h4>
            <p className="text-sm text-muted-foreground">
              Promoter role allows creating formal markets with vendor applications, booth management, and event coordination.
            </p>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Why do you want to become a promoter? *
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your motivation and goals as a market promoter..."
                rows={3}
                disabled={hasPendingRequest || submitting}
                className="min-h-[88px] touch-manipulation resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Your Market Experience *
              </label>
              <Textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Describe your experience organizing markets, managing vendors, or event coordination..."
                rows={3}
                disabled={hasPendingRequest || submitting}
                className="min-h-[88px] touch-manipulation resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Markets You've Organized (approximate)
              </label>
              <Input
                type="number"
                value={marketsManaged}
                onChange={(e) => setMarketsManaged(parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                disabled={hasPendingRequest || submitting}
                className="h-11 touch-manipulation"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!reason.trim() || !experience.trim() || hasPendingRequest || submitting || isLoading}
              className="w-full h-11 touch-manipulation"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Apply for Promoter Role
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {hasPendingRequest && (
          <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            Your promoter application is under review. You'll be notified once a decision is made.
          </div>
        )}

        {hasApprovedRequest && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            Congratulations! Your promoter application has been approved. You'll be upgraded to promoter role soon.
          </div>
        )}

        {!canRequestPromotion && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            You already have promoter privileges or this feature is not available for your current role.
          </div>
        )}
      </CardContent>
    </Card>
  )
}