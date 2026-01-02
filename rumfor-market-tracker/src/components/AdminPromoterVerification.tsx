import { useState } from 'react'
import { 
  Building2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  User,
  MapPin,
  Phone,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Star,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Avatar } from '@/components/ui/Avatar'
import { useAdminPromoterVerification } from '@/features/admin/hooks/useAdmin'
import { PromoterVerification } from '@/types'
import { cn } from '@/utils/cn'

interface AdminPromoterVerificationProps {
  className?: string
}

export function AdminPromoterVerification({ className }: AdminPromoterVerificationProps) {
  const {
    promoterVerifications,
    isLoadingVerifications,
    refreshVerifications,
    handleReviewVerification
  } = useAdminPromoterVerification()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedVerification, setSelectedVerification] = useState<PromoterVerification | null>(null)
  const [reviewModal, setReviewModal] = useState<{ type: 'verify' | 'reject'; verification: PromoterVerification } | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  const filteredVerifications = promoterVerifications.filter(verification => {
    const matchesSearch = !searchTerm || 
      verification.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || verification.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleReview = (verification: PromoterVerification, action: 'verify' | 'reject') => {
    setReviewModal({ type: action, verification })
  }

  const confirmReview = async () => {
    if (!reviewModal) return
    
    const status = reviewModal.type === 'verify' ? 'verified' : 'rejected'
    await handleReviewVerification(
      reviewModal.verification.id,
      status,
      reviewNotes || undefined
    )
    
    setReviewModal(null)
    setReviewNotes('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>
      case 'under-review': return <Badge variant="default">Under Review</Badge>
      case 'verified': return <Badge variant="default">Verified</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="muted">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const statusFilterOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ]

  // Table columns
  const columns = [
    {
      key: 'business',
      title: 'Business & Applicant',
      render: (_: any, record: PromoterVerification) => (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Avatar src={record.user.avatar} size="sm" />
            <div>
              <div className="font-medium">{record.businessName}</div>
              <div className="text-sm text-muted-foreground">
                {record.user.firstName} {record.user.lastName}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {record.user.email}
          </div>
        </div>
      )
    },
    {
      key: 'businessType',
      title: 'Business Info',
      render: (_: any, record: PromoterVerification) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-3 w-3" />
            <span className="text-sm">{record.businessLicense}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span className="text-sm">{record.businessAddress.city}, {record.businessAddress.state}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span className="text-sm">Tax ID: {record.taxId}</span>
          </div>
        </div>
      )
    },
    {
      key: 'socialMedia',
      title: 'Online Presence',
      render: (_: any, record: PromoterVerification) => (
        <div className="flex flex-wrap gap-2">
          {record.website && (
            <a 
              href={record.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
          {record.socialMedia?.facebook && (
            <a 
              href={record.socialMedia.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Facebook className="h-3 w-3" />
              Facebook
            </a>
          )}
          {record.socialMedia?.instagram && (
            <a 
              href={record.socialMedia.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-pink-600 hover:underline"
            >
              <Instagram className="h-3 w-3" />
              Instagram
            </a>
          )}
          {record.socialMedia?.twitter && (
            <a 
              href={record.socialMedia.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
            >
              <Twitter className="h-3 w-3" />
              Twitter
            </a>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: PromoterVerification) => getStatusBadge(record.status)
    },
    {
      key: 'submitted',
      title: 'Submitted',
      render: (_: any, record: PromoterVerification) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(record.submittedAt)}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: PromoterVerification) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedVerification(record)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReview(record, 'verify')}
                title="Verify business"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReview(record, 'reject')}
                title="Reject verification"
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
          {record.status === 'under-review' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReview(record, 'verify')}
              title="Complete verification"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const pendingCount = promoterVerifications.filter(v => v.status === 'pending').length
  const underReviewCount = promoterVerifications.filter(v => v.status === 'under-review').length
  const verifiedCount = promoterVerifications.filter(v => v.status === 'verified').length
  const rejectedCount = promoterVerifications.filter(v => v.status === 'rejected').length

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Promoter Verification</h2>
            <p className="text-sm text-muted-foreground">
              Review and verify business applications for promoter status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshVerifications}
            disabled={isLoadingVerifications}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingVerifications && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold mt-1">{pendingCount}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Under Review</span>
          </div>
          <div className="text-2xl font-bold mt-1">{underReviewCount}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Verified</span>
          </div>
          <div className="text-2xl font-bold mt-1">{verifiedCount}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
          <div className="text-2xl font-bold mt-1">{rejectedCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses or applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={statusFilterOptions}
            className="w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={filteredVerifications}
          loading={isLoadingVerifications}
          emptyText="No promoter verifications found"
        />
      </div>

      {/* Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Verification Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVerification(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Business Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                    <p className="font-medium">{selectedVerification.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Business License</label>
                    <p className="font-medium">{selectedVerification.businessLicense}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{selectedVerification.businessDescription}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                    <p className="font-medium">{selectedVerification.taxId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedVerification.status)}</div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="font-medium">{selectedVerification.businessAddress.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p className="font-medium">{selectedVerification.businessAddress.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p className="font-medium">{selectedVerification.businessAddress.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ZIP Code</label>
                    <p className="font-medium">{selectedVerification.businessAddress.zipCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <p className="font-medium">{selectedVerification.businessAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Applicant Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Applicant
                </h4>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar src={selectedVerification.user.avatar} size="lg" />
                  <div>
                    <p className="font-medium text-lg">
                      {selectedVerification.user.firstName} {selectedVerification.user.lastName}
                    </p>
                    <p className="text-muted-foreground">{selectedVerification.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Online Presence */}
              {(selectedVerification.website || selectedVerification.socialMedia) && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Online Presence
                  </h4>
                  <div className="space-y-2">
                    {selectedVerification.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={selectedVerification.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedVerification.website}
                        </a>
                      </div>
                    )}
                    {selectedVerification.socialMedia?.facebook && (
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4" />
                        <a 
                          href={selectedVerification.socialMedia.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Facebook Page
                        </a>
                      </div>
                    )}
                    {selectedVerification.socialMedia?.instagram && (
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        <a 
                          href={selectedVerification.socialMedia.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:underline"
                        >
                          Instagram
                        </a>
                      </div>
                    )}
                    {selectedVerification.socialMedia?.twitter && (
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        <a 
                          href={selectedVerification.socialMedia.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Twitter
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business References */}
              {selectedVerification.references.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Business References
                  </h4>
                  <div className="space-y-3">
                    {selectedVerification.references.map((reference, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <label className="font-medium">Name</label>
                            <p>{reference.name}</p>
                          </div>
                          <div>
                            <label className="font-medium">Company</label>
                            <p>{reference.company}</p>
                          </div>
                          <div>
                            <label className="font-medium">Email</label>
                            <p>{reference.email}</p>
                          </div>
                          <div>
                            <label className="font-medium">Phone</label>
                            <p>{reference.phone}</p>
                          </div>
                          <div>
                            <label className="font-medium">Relationship</label>
                            <p>{reference.relationship}</p>
                          </div>
                          <div>
                            <label className="font-medium">Years Known</label>
                            <p>{reference.yearsKnown}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedVerification.notes && (
                <div>
                  <h4 className="font-semibold mb-3">Admin Notes</h4>
                  <p className="text-sm p-3 bg-muted rounded-lg">{selectedVerification.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Submitted: {formatDate(selectedVerification.submittedAt)}</div>
                {selectedVerification.reviewedAt && (
                  <div>Reviewed: {formatDate(selectedVerification.reviewedAt)}</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                {selectedVerification.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        setReviewModal({ type: 'verify', verification: selectedVerification })
                        setSelectedVerification(null)
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Business
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setReviewModal({ type: 'reject', verification: selectedVerification })
                        setSelectedVerification(null)
                      }}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Verification
                    </Button>
                  </>
                )}
                {selectedVerification.status === 'under-review' && (
                  <Button
                    onClick={() => {
                      setReviewModal({ type: 'verify', verification: selectedVerification })
                      setSelectedVerification(null)
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Verification
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {reviewModal.type === 'verify' ? 'Verify Business' : 'Reject Verification'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReviewModal(null)
                    setReviewNotes('')
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmReview}
                  variant={reviewModal.type === 'verify' ? 'primary' : 'destructive'}
                >
                  Confirm {reviewModal.type === 'verify' ? 'Verification' : 'Rejection'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}