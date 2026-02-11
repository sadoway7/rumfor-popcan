import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Users,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  MessageSquare,
  Eye,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Grid3X3,
  List,
  ExternalLink
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Avatar } from '@/components/ui/Avatar'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { useAuthStore } from '@/features/auth/authStore'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { adminApi } from '@/features/admin/adminApi'
import { User } from '@/types'
import { cn } from '@/utils/cn'

export function PromoterVendorsPage() {
  const { user } = useAuthStore()
  const { markets } = useMarkets()
  const { applications } = useApplications()
  const { addToast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [marketFilter, setMarketFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [vendorModal, setVendorModal] = useState<{
    type: 'view' | 'message' | 'blacklist'
    vendor: VendorWithStats | null
  } | null>(null)
  const [messageText, setMessageText] = useState('')
  const [blacklistReason, setBlacklistReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Filter markets created by current promoter
  const myMarkets = useMemo(() => {
    return markets.filter(market => market.promoterId === user?.id)
  }, [markets, user?.id])

  const myMarketIds = useMemo(() => {
    return myMarkets.map(market => market.id)
  }, [myMarkets])

  // Get vendors who have applied to promoter's markets
  const vendorsWithStats = useMemo(() => {
    const vendorMap = new Map<string, VendorWithStats>()
    
    // Get applications for promoter's markets
    const relevantApplications = applications.filter(app => myMarketIds.includes(app.marketId))
    
    relevantApplications.forEach(application => {
      const vendorId = application.vendorId
      const vendor = application.vendor
      
      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, {
          ...vendor,
          totalApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          pendingApplications: 0,
          averageRating: 0,
          totalMarkets: 0,
          lastActive: '',
          businessName: application.submittedData.businessName || '',
          businessDescription: application.submittedData.businessDescription || '',
          experience: application.submittedData.experience || '',
          specialties: application.submittedData.specialties || [],
          contact: {
            phone: application.submittedData.phone || '',
            website: application.submittedData.website || '',
            socialMedia: application.submittedData.socialMedia || {}
          },
          markets: [],
          recentApplications: [],
          isBlacklisted: false,
          blacklistReason: '',
          notes: []
        })
      }
      
      const vendorData = vendorMap.get(vendorId)!
      
      // Update application statistics
      vendorData.totalApplications++
      switch (application.status) {
        case 'approved':
          vendorData.approvedApplications++
          break
        case 'rejected':
          vendorData.rejectedApplications++
          break
        case 'submitted':
        case 'under-review':
          vendorData.pendingApplications++
          break
      }
      
      // Add market info
      if (!vendorData.markets.some(m => m.id === application.marketId)) {
        vendorData.markets.push({
          id: application.marketId,
          name: application.market.name,
          status: application.status,
          appliedAt: application.createdAt
        })
      }
      
      // Add to recent applications
      vendorData.recentApplications.push({
        id: application.id,
        marketId: application.marketId,
        marketName: application.market.name,
        status: application.status,
        appliedAt: application.createdAt,
        submittedData: application.submittedData
      })
      
      // Update business info if available
      if (application.submittedData.businessName && !vendorData.businessName) {
        vendorData.businessName = application.submittedData.businessName
      }
      if (application.submittedData.businessDescription && !vendorData.businessDescription) {
        vendorData.businessDescription = application.submittedData.businessDescription
      }
      
      // Update last active
      if (!vendorData.lastActive || new Date(application.createdAt) > new Date(vendorData.lastActive)) {
        vendorData.lastActive = application.createdAt
      }
    })
    
    return Array.from(vendorMap.values()).sort((a, b) => {
      // Sort by most recent activity
      return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime()
    })
  }, [applications, myMarketIds])

  // Apply filters
  const filteredVendors = useMemo(() => {
    return vendorsWithStats.filter(vendor => {
      const matchesSearch = !searchTerm || 
        vendor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesMarket = !marketFilter || 
        vendor.markets.some(m => m.id === marketFilter)
      
      const matchesStatus = !statusFilter || 
        (statusFilter === 'approved' && vendor.approvedApplications > 0) ||
        (statusFilter === 'pending' && vendor.pendingApplications > 0) ||
        (statusFilter === 'active' && vendor.isActive) ||
        (statusFilter === 'verified' && vendor.isEmailVerified)
      
      return matchesSearch && matchesMarket && matchesStatus
    })
  }, [vendorsWithStats, searchTerm, marketFilter, statusFilter])

  const getStatusBadge = (vendor: VendorWithStats) => {
    if (vendor.isBlacklisted) {
      return <Badge variant="destructive">Blacklisted</Badge>
    }
    if (vendor.approvedApplications > 0) {
      return <Badge className="bg-success/10 text-success border-success/20">Active Partner</Badge>
    }
    if (vendor.pendingApplications > 0) {
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>
    }
    return <Badge variant="outline">New</Badge>
  }



  const handleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([])
    } else {
      setSelectedVendors(filteredVendors.map(vendor => vendor.id))
    }
  }

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    )
  }

  const handleSendMessage = async () => {
    if (!vendorModal?.vendor || !messageText.trim()) return
    
    setIsLoading(true)
    try {
      await adminApi.sendMessageToVendor(vendorModal.vendor.id, messageText)
      addToast({
        title: 'Message Sent',
        description: `Message sent to ${vendorModal.vendor.firstName} ${vendorModal.vendor.lastName}`,
        variant: 'success'
      })
      setVendorModal(null)
      setMessageText('')
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlacklistVendor = async () => {
    if (!vendorModal?.vendor || !blacklistReason.trim()) return
    
    setIsLoading(true)
    try {
      await adminApi.blacklistVendor(vendorModal.vendor.id, blacklistReason)
      addToast({
        title: 'Vendor Blacklisted',
        description: `${vendorModal.vendor.firstName} ${vendorModal.vendor.lastName} has been blacklisted`,
        variant: 'success'
      })
      setVendorModal(null)
      setBlacklistReason('')
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to blacklist vendor. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = vendorsWithStats.length
    const active = vendorsWithStats.filter(v => v.approvedApplications > 0).length
    const pending = vendorsWithStats.filter(v => v.pendingApplications > 0).length
    const blacklisted = vendorsWithStats.filter(v => v.isBlacklisted).length
    const newThisMonth = vendorsWithStats.filter(v => {
      const vendorDate = new Date(v.createdAt)
      const now = new Date()
      return vendorDate.getMonth() === now.getMonth() && vendorDate.getFullYear() === now.getFullYear()
    }).length

    return { total, active, pending, blacklisted, newThisMonth }
  }, [vendorsWithStats])

  const marketFilterOptions: SelectOption[] = [
    { value: '', label: 'All Markets' },
    ...myMarkets.map(market => ({
      value: market.id,
      label: market.name
    }))
  ]

  const statusFilterOptions: SelectOption[] = [
    { value: '', label: 'All Vendors' },
    { value: 'approved', label: 'Active Partners' },
    { value: 'pending', label: 'Pending Applications' },
    { value: 'active', label: 'Verified Users' },
    { value: 'verified', label: 'Email Verified' }
  ]

  // Table columns
  const columns = [
    {
      key: 'select',
      title: '',
      width: '48px',
      render: (_: any, record: VendorWithStats) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSelectVendor(record.id)}
          className="h-8 w-8 p-0"
        >
          <div className={cn(
            'w-4 h-4 rounded border-2 flex items-center justify-center',
            selectedVendors.includes(record.id) 
              ? 'bg-primary border-primary' 
              : 'border-muted-foreground'
          )}>
            {selectedVendors.includes(record.id) && (
              <CheckCircle className="w-3 h-3 text-primary-foreground" />
            )}
          </div>
        </Button>
      )
    },
    {
      key: 'vendor',
      title: 'Vendor',
      render: (_: any, record: VendorWithStats) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={record.avatar} 
            alt={`${record.firstName} ${record.lastName}`}
            size="md"
          />
          <div>
            <div className="font-medium flex items-center gap-2">
              <Link to={`/vendors/${record.id}`} className="hover:text-amber-500 hover:underline transition-colors">
                {record.firstName} {record.lastName}
              </Link>
              {record.isEmailVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="text-sm text-muted-foreground">
              {record.businessName ? (
                <Link to={`/vendors/${record.id}`} className="hover:text-amber-500 hover:underline transition-colors">
                  {record.businessName}
                </Link>
              ) : (
                'Independent Vendor'
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {record.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: VendorWithStats) => getStatusBadge(record)
    },
    {
      key: 'applications',
      title: 'Applications',
      render: (_: any, record: VendorWithStats) => (
        <div className="text-center">
          <div className="font-medium">{record.totalApplications}</div>
          <div className="text-xs text-muted-foreground">
            {record.approvedApplications} approved
          </div>
        </div>
      )
    },
    {
      key: 'markets',
      title: 'Markets',
      render: (_: any, record: VendorWithStats) => (
        <div className="text-center">
          <div className="font-medium">{record.markets.length}</div>
          <div className="text-xs text-muted-foreground">participated</div>
        </div>
      )
    },
    {
      key: 'lastActive',
      title: 'Last Active',
      render: (_: any, record: VendorWithStats) => (
        <div className="text-sm">
          {record.lastActive ? new Date(record.lastActive).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: VendorWithStats) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVendorModal({ type: 'view', vendor: record })}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVendorModal({ type: 'message', vendor: record })}
            title="Send message"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          {!record.isBlacklisted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVendorModal({ type: 'blacklist', vendor: record })}
              title="Blacklist vendor"
            >
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage vendors who have applied to your markets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Vendors</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Partners</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New This Month</p>
              <p className="text-2xl font-bold text-foreground">{stats.newThisMonth}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blacklisted</p>
              <p className="text-2xl font-bold text-foreground">{stats.blacklisted}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <Select
                placeholder="Filter by market"
                value={marketFilter}
                onValueChange={setMarketFilter}
                options={marketFilterOptions}
              />
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={statusFilterOptions}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedVendors.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVendors([])}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-success hover:bg-success/90"
              >
                Message Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Blacklist Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Vendors Table/Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Vendors ({filteredVendors.length})</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 w-8 p-0"
            >
              <div className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center',
                selectedVendors.length === filteredVendors.length && filteredVendors.length > 0
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground'
              )}>
                {selectedVendors.length === filteredVendors.length && filteredVendors.length > 0 && (
                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
            </Button>
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredVendors}
          loading={false}
          emptyText="No vendors found who have applied to your markets."
        />
      </Card>

      {/* Vendor Modal */}
      {vendorModal && vendorModal.vendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            {vendorModal.type === 'view' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Vendor Details</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setVendorModal(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    <Avatar 
                      src={vendorModal.vendor.avatar}
                      alt={`${vendorModal.vendor.firstName} ${vendorModal.vendor.lastName}`}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">
                          {vendorModal.vendor.firstName} {vendorModal.vendor.lastName}
                        </h4>
                        {vendorModal.vendor.isEmailVerified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {getStatusBadge(vendorModal.vendor)}
                      <p className="text-muted-foreground mt-2">{vendorModal.vendor.email}</p>
                    </div>
                  </div>

                  {/* Business Info */}
                  {vendorModal.vendor.businessName && (
                    <div>
                      <h5 className="font-medium mb-2">Business Information</h5>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p><strong>Business Name:</strong> {vendorModal.vendor.businessName}</p>
                        {vendorModal.vendor.businessDescription && (
                          <p><strong>Description:</strong> {vendorModal.vendor.businessDescription}</p>
                        )}
                        {vendorModal.vendor.experience && (
                          <p><strong>Experience:</strong> {vendorModal.vendor.experience}</p>
                        )}
                        {vendorModal.vendor.specialties.length > 0 && (
                          <div>
                            <strong>Specialties:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vendorModal.vendor.specialties.map((specialty, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div>
                    <h5 className="font-medium mb-2">Contact Information</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {vendorModal.vendor.contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{vendorModal.vendor.contact.phone}</span>
                        </div>
                      )}
                      {vendorModal.vendor.contact.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={vendorModal.vendor.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline flex items-center gap-1"
                          >
                            Website <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h5 className="font-medium mb-2">Application Statistics</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{vendorModal.vendor.totalApplications}</div>
                        <div className="text-sm text-muted-foreground">Total Applications</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{vendorModal.vendor.approvedApplications}</div>
                        <div className="text-sm text-muted-foreground">Approved</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{vendorModal.vendor.pendingApplications}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Markets */}
                  <div>
                    <h5 className="font-medium mb-2">Recent Market Participation</h5>
                    <div className="space-y-2">
                      {vendorModal.vendor.markets.slice(0, 5).map((market, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{market.name}</span>
                          <Badge 
                            variant={
                              market.status === 'approved' ? 'default' :
                              market.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {market.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setVendorModal(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setVendorModal({ type: 'message', vendor: vendorModal.vendor })
                      }}
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              </>
            )}

            {vendorModal.type === 'message' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Send Message</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setVendorModal(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      Send a message to {vendorModal.vendor.firstName} {vendorModal.vendor.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVendorModal(null)
                        setMessageText('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {vendorModal.type === 'blacklist' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Blacklist Vendor</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setVendorModal(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive">
                      Are you sure you want to blacklist {vendorModal.vendor.firstName} {vendorModal.vendor.lastName}?
                      This will prevent them from applying to your markets.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reason for blacklisting (required)
                    </label>
                    <Textarea
                      value={blacklistReason}
                      onChange={(e) => setBlacklistReason(e.target.value)}
                      placeholder="Please provide a reason for blacklisting this vendor..."
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVendorModal(null)
                        setBlacklistReason('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBlacklistVendor}
                      disabled={!blacklistReason.trim() || isLoading}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isLoading ? 'Blacklisting...' : 'Blacklist Vendor'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

// Types for vendor with stats
interface VendorWithStats extends User {
  totalApplications: number
  approvedApplications: number
  rejectedApplications: number
  pendingApplications: number
  averageRating: number
  totalMarkets: number
  lastActive: string
  businessName: string
  businessDescription: string
  experience: string
  specialties: string[]
  contact: {
    phone: string
    website: string
    socialMedia: Record<string, any>
  }
  markets: {
    id: string
    name: string
    status: string
    appliedAt: string
  }[]
  recentApplications: {
    id: string
    marketId: string
    marketName: string
    status: string
    appliedAt: string
    submittedData: Record<string, any>
  }[]
  isBlacklisted: boolean
  blacklistReason: string
  notes: string[]
}