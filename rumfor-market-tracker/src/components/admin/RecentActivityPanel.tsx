import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SidePanel } from '@/components/ui/SidePanel'
import { 
  ShieldCheck, 
  ShieldX, 
  UserX, 
  Users, 
  Activity,
  RefreshCw
} from 'lucide-react'

interface Activity {
  id: string
  action: string
  message: string
  timestamp: string
  type: 'success' | 'warning' | 'info' | 'default'
}

interface RecentActivityPanelProps {
  isOpen: boolean
  onClose: () => void
  activities: Activity[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  isOpen,
  onClose,
  activities,
  onRefresh,
  isRefreshing = false
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <ShieldCheck className="h-4 w-4 text-green-500" />
      case 'warning': return <UserX className="h-4 w-4 text-red-500" />
      case 'info': return <ShieldX className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge variant="default">Success</Badge>
      case 'warning': return <Badge variant="warning">Warning</Badge>
      case 'info': return <Badge variant="outline">Info</Badge>
      default: return <Badge variant="muted">Activity</Badge>
    }
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Recent Activity"
      description="Latest user management activities"
      width="lg"
    >
      <div className="space-y-4">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing recent activities across the platform
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-1">
                Activities will appear here as users interact with the platform
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div 
                key={activity.id} 
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                      {activity.action && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Action: {activity.action}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getActivityBadge(activity.type)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {activities.length > 0 && (
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Load More Activities
            </Button>
          </div>
        )}
      </div>
    </SidePanel>
  )
}