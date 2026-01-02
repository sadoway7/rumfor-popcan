import { AdminModerationQueue } from '@/components/AdminModerationQueue'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Flag } from 'lucide-react'
import { useState } from 'react'

export function AdminModerationPage() {
  const { stats } = useAdmin()
  const [activeView, setActiveView] = useState<'queue' | 'analytics'>('queue')

  const moderationStats = {
    totalPending: stats?.contentModerationQueue || 0,
    highPriority: stats?.reportedContent || 0,
    resolvedToday: 12,
    averageResponseTime: '2.4 hours',
    accuracy: '94.2%'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate reported content across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'queue' ? 'primary' : 'outline'}
            onClick={() => setActiveView('queue')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Moderation Queue
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'primary' : 'outline'}
            onClick={() => setActiveView('analytics')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Moderation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Items</p>
              <p className="text-3xl font-bold">{moderationStats.totalPending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Priority</p>
              <p className="text-3xl font-bold">{moderationStats.highPriority}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
              <p className="text-3xl font-bold">{moderationStats.resolvedToday}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
              <p className="text-3xl font-bold text-lg">{moderationStats.averageResponseTime}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
              <p className="text-3xl font-bold">{moderationStats.accuracy}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Flag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Auto-Moderation Rules</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Flag className="h-5 w-5" />
            <span>Flagged Content</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>Bulk Approve</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>High Priority Queue</span>
          </Button>
        </div>
      </Card>

      {/* Content Based on Active View */}
      {activeView === 'queue' ? (
        <AdminModerationQueue />
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Moderation Analytics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Content Types Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Comments</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Photos</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Listings</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Reports</span>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Resolution Rate</h4>
                  <div className="text-2xl font-bold text-green-600">87.3%</div>
                  <p className="text-sm text-muted-foreground">Items resolved within SLA</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Moderator Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items Reviewed Today</span>
                      <span className="font-medium">28</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Review Time</span>
                      <span className="font-medium">3.2 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy Rate</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Trending Issues</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Spam Comments</span>
                      <Badge variant="warning">+15%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Inappropriate Photos</span>
                      <Badge variant="outline">+8%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Fake Market Listings</span>
                      <Badge variant="destructive">+12%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}