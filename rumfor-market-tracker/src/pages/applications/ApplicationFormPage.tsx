import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ApplicationForm } from '@/components/ApplicationForm'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { Market } from '@/types'

export const ApplicationFormPage: React.FC = () => {
  const { marketId } = useParams<{ marketId: string }>()
  const navigate = useNavigate()
  const { markets, isLoading: marketsLoading } = useMarkets()
  const { myApplications, loadMyApplications } = useVendorApplications()
  
  const [market, setMarket] = useState<Market | null>(null)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [draftApplication, setDraftApplication] = useState<any>(null)

  useEffect(() => {
    if (markets.length > 0 && marketId) {
      const foundMarket = markets.find(m => m.id === marketId)
      setMarket(foundMarket || null)

      const existing = myApplications.find(app => app.marketId === marketId)
      setExistingApplication(existing || null)
      setDraftApplication(existing?.status === 'draft' ? existing : null)
    }
  }, [markets, marketId, myApplications])

  const handleSuccess = (application: any) => {
    // Refresh the applications list so the existingApplication check works next time
    loadMyApplications()
    navigate(`/applications/${application.id}`)
  }

  const handleCancel = () => {
    navigate(`/markets/${marketId}`)
  }

  if (marketsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading market details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The market you're trying to apply to doesn't exist.
          </p>
          <Link to="/markets">
            <Button>Browse Markets</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (existingApplication && !draftApplication) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Application Already Exists</h1>
            <p className="text-muted-foreground mb-6">
              You already have an application for <strong>{market.name}</strong>.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to={`/applications/${existingApplication.id}`}>
                <Button>View Existing Application</Button>
              </Link>
              <Link to={`/markets/${marketId}`}>
                <Button variant="outline">Back to Market</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Step 2 of 3 · Application Details
            </div>
            <div>
              <h1 className="text-3xl font-bold">Apply to {market.name}</h1>
              <p className="text-muted-foreground mt-1">
                Complete the application form below to apply for this market
              </p>
            </div>
          </div>
          <Link to={`/markets/${marketId}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Back to Market</Button>
          </Link>
        </div>

        {draftApplication && (
          <Card className="p-4 border-amber-200 bg-amber-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-amber-900">Draft application detected</p>
                <p className="text-sm text-amber-700">
                  Continue your saved draft for {market.name} and submit when ready.
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/applications/${draftApplication.id}`}>
                  <Button className="bg-amber-600 hover:bg-amber-700">Continue Draft</Button>
                </Link>
                <Button variant="outline" onClick={() => setDraftApplication(null)}>
                  Start New
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Market Preview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Market Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{market.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className="font-medium capitalize">{market.category.replace('-', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="font-medium">
                {market.location.city}, {market.location.state}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vendor Limit</label>
              <p className="font-medium">
                No limit specified
              </p>
            </div>
          </div>
        </Card>

        {/* Application Form */}
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <ApplicationForm
            market={market}
            existingApplication={draftApplication || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}
