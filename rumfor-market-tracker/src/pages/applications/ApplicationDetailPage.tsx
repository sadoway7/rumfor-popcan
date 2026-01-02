import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ApplicationStatus, StatusHistory } from '@/components/ApplicationStatus'
import { ApplicationActions } from '@/components/ApplicationActions'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
// import { useMarkets } from '@/features/markets/hooks/useMarkets'

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { myApplications, isLoading } = useVendorApplications()
  // const { markets } = useMarkets() // Uncomment if needed

  // Find the application
  const application = myApplications.find(app => app.id === id)
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading application...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The application you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link to="/applications">
            <Button>Back to My Applications</Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{application.market.name}</h1>
          <p className="text-muted-foreground mt-1">
            Application submitted on {formatDate(application.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ApplicationStatus status={application.status} showProgress={true} />
          <Button variant="outline" onClick={() => navigate('/applications')}>
            Back to Applications
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Market Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Market Name</label>
                <p className="font-medium">{application.market.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="font-medium">{application.market.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="font-medium">
                  {application.market.location.city}, {application.market.location.state}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Application Deadline</label>
                <p className="font-medium">
                  No deadline specified
                </p>
              </div>
            </div>
          </Card>

          {/* Application Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Application Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                <p className="font-medium">{application.submittedData?.businessName || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Description</label>
                <p className="mt-1">{application.submittedData?.businessDescription || 'Not provided'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                  <p className="font-medium">{application.submittedData?.contactEmail || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                  <p className="font-medium">{application.submittedData?.contactPhone || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Experience Level</label>
                <p className="font-medium">{application.submittedData?.experience || 'Not provided'}</p>
              </div>
              
              {application.submittedData?.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <p className="font-medium">
                    <a 
                      href={application.submittedData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {application.submittedData.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Certifications */}
          {application.submittedData?.certifications && application.submittedData.certifications.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {application.submittedData.certifications.map((cert: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Custom Fields */}
          {application.customFields && Object.keys(application.customFields).length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <div className="space-y-3">
                {Object.entries(application.customFields).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-muted-foreground">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <p className="font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Review Notes */}
          {application.notes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Review Notes</h2>
              <p className="bg-muted p-4 rounded-lg">{application.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Application Status</h3>
            <ApplicationStatus status={application.status} showProgress={true} />
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{formatDate(application.createdAt)}</span>
              </div>
              {application.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewed:</span>
                  <span className="font-medium">{formatDate(application.reviewedAt)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <ApplicationActions 
              application={application}
              size="sm"
            />
          </Card>

          {/* Application History */}
          <Card className="p-6">
            <StatusHistory 
              status={application.status}
              submittedAt={application.createdAt}
              reviewedAt={application.reviewedAt}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}