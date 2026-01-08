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

  useEffect(() => {
    if (markets.length > 0 && marketId) {
      const foundMarket = markets.find(m => m.id === marketId)
      setMarket(foundMarket || null)

      // Check if user already has an application for this market
      const existing = myApplications.find(app => app.marketId === marketId)
      setExistingApplication(existing || null)
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

  if (existingApplication) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Apply to {market.name}</h1>
            <p className="text-muted-foreground mt-1">
              Complete the application form below to apply for this market
            </p>
          </div>
          <Link to={`/markets/${marketId}`}>
            <Button variant="outline">Back to Market</Button>
          </Link>
        </div>

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
              <p className="font-medium">{market.category}</p>
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
        <ApplicationForm
          market={market}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}