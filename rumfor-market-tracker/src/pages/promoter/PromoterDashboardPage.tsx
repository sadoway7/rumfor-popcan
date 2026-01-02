import { Link } from 'react-router-dom'
import { 
  FileText, 
  Users, 
  BarChart3, 
  Calendar,
  Clock,
  TrendingUp,
  Plus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/features/auth/authStore'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useApplications } from '@/features/applications/hooks/useApplications'

export function PromoterDashboardPage() {
  const { user } = useAuthStore()
  const { markets, isLoading: marketsLoading } = useMarkets()
  const { applications, isLoading: applicationsLoading } = useApplications()

  // Get markets created by current promoter
  const myMarkets = markets.filter(market => market.promoterId === user?.id)
  
  // Get applications for my markets
  const myMarketApplications = applications.filter(app => 
    myMarkets.some(market => market.id === app.marketId)
  )

  // Calculate stats
  const stats = {
    totalMarkets: myMarkets.length,
    activeMarkets: myMarkets.filter(market => market.status === 'active').length,
    totalApplications: myMarketApplications.length,
    pendingApplications: myMarketApplications.filter(app => app.status === 'under-review').length,
    approvedApplications: myMarketApplications.filter(app => app.status === 'approved').length,
    totalVendors: new Set(myMarketApplications.map(app => app.vendorId)).size
  }

  // Get recent activity
  const recentApplications = myMarketApplications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (marketsLoading || applicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            Manage your markets and review vendor applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/promoter/markets">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Market
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Markets</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalMarkets}</p>
              <p className="text-xs text-muted-foreground">
                {stats.activeMarkets} active
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalApplications}</p>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApplications} pending
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendors</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalVendors}</p>
              <p className="text-xs text-muted-foreground">
                approved
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">{stats.approvedApplications}</p>
              <p className="text-xs text-muted-foreground">
                this month
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/promoter/applications" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Review Applications</span>
              {stats.pendingApplications > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.pendingApplications}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/promoter/markets" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Manage Markets</span>
            </Button>
          </Link>
          <Link to="/promoter/vendors" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10">
              <Users className="w-6 h-6" />
              <span className="text-sm">View Vendors</span>
            </Button>
          </Link>
          <Link to="/promoter/analytics" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Analytics</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
            <Link to="/promoter/applications">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No applications yet</p>
            ) : (
              recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{application.vendor.firstName} {application.vendor.lastName}</p>
                    <p className="text-sm text-muted-foreground">{application.market.name}</p>
                  </div>
                  <Badge 
                    variant={
                      application.status === 'approved' ? 'success' :
                      application.status === 'rejected' ? 'destructive' : 
                      application.status === 'under-review' ? 'warning' : 'outline'
                    }
                  >
                    {application.status === 'under-review' ? 'Under Review' : application.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* My Markets */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">My Markets</h2>
            <Link to="/promoter/markets">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {myMarkets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No markets created yet</p>
                <Link to="/promoter/markets">
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Market
                  </Button>
                </Link>
              </div>
            ) : (
              myMarkets.slice(0, 4).map((market) => {
                const marketApps = myMarketApplications.filter(app => app.marketId === market.id)
                const pendingCount = marketApps.filter(app => app.status === 'under-review').length
                
                return (
                  <div key={market.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{market.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {market.location.city}, {market.location.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={market.status === 'active' ? 'success' : 'outline'}>
                        {market.status}
                      </Badge>
                      {pendingCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {pendingCount} pending
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      {/* Pending Actions */}
      {stats.pendingApplications > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800">Action Required</h3>
              <p className="text-orange-700">
                You have {stats.pendingApplications} vendor applications waiting for review.
              </p>
            </div>
            <Link to="/promoter/applications">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Review Applications
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}