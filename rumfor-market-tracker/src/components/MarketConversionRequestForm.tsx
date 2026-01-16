import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui'
import { AlertTriangle, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export interface MarketConversionRequestFormProps {
  marketId: string
  marketName: string
  currentCreator: 'vendor' | 'promoter' | 'admin'
  userRole: 'vendor' | 'promoter' | 'admin'
  existingRequest?: {
    id: string
    status: 'pending' | 'approved' | 'rejected'
    requestedAt: string
    reason: string
  }
  onSubmitRequest?: (marketId: string, reason: string) => Promise<void>
  isLoading?: boolean
}

export const MarketConversionRequestForm: React.FC<MarketConversionRequestFormProps> = ({
  marketId,
  marketName,
  currentCreator,
  userRole,
  existingRequest,
  onSubmitRequest,
  isLoading = false
}) => {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canRequestConversion = userRole === 'vendor' && currentCreator === 'vendor'
  const hasPendingRequest = existingRequest?.status === 'pending'
  const hasApprovedRequest = existingRequest?.status === 'approved'

  const handleSubmit = async () => {
    if (!reason.trim() || !onSubmitRequest) return

    setSubmitting(true)
    try {
      await onSubmitRequest(marketId, reason.trim())
      setReason('')
    } catch (error) {
      console.error('Failed to submit conversion request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>
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
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Market Conversion Request
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Request to convert this vendor-created market to a promoter-managed market with formal applications and management.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="font-medium">Market: {marketName}</div>
            <div className="text-sm text-muted-foreground">
              Currently: {currentCreator === 'vendor' ? 'Vendor-created community market' : 'Promoter-managed market'}
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
              <span className="font-medium">Previous Request</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Requested on {new Date(existingRequest.requestedAt).toLocaleDateString()}
            </div>
            <div className="text-sm bg-muted/50 p-2 rounded">
              {existingRequest.reason}
            </div>
          </div>
        )}

        {/* Conversion Request Form */}
        {canRequestConversion && !hasApprovedRequest && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Request Market Conversion</h4>
            <p className="text-sm text-muted-foreground">
              Converting to a promoter-managed market enables formal vendor applications, booth assignments, and event management.
            </p>

            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you want to convert this market to promoter management (e.g., growing demand, need for formal applications, etc.)"
              rows={4}
              disabled={hasPendingRequest || submitting}
              className="min-h-[110px] touch-manipulation resize-none"
            />

            <Button
              onClick={handleSubmit}
              disabled={!reason.trim() || hasPendingRequest || submitting || isLoading}
              className="w-full h-11 touch-manipulation"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Conversion Request
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {hasPendingRequest && (
          <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 animate-pulse">
            Your conversion request is currently under review. You'll be notified once a decision is made.
          </div>
        )}

        {hasApprovedRequest && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 transition-all duration-300 ease-in-out">
            Your conversion request has been approved. This market will be transitioned to promoter management.
          </div>
        )}

        {!canRequestConversion && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            Market conversion requests are only available for vendor-created markets by the market creator.
          </div>
        )}
      </CardContent>
    </Card>
  )
}