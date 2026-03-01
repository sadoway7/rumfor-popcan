import { AdminUserTable } from '@/components/AdminUserTable'
import { Button } from '@/components/ui/Button'
import { RecentActivityDrawer } from '@/components/admin/RecentActivityDrawer'
import { BulkInvitePanel } from '@/components/admin/BulkInvitePanel'
import { RoleManagementPanel } from '@/components/admin/RoleManagementPanel'
import { EmailVerificationPanel } from '@/components/admin/EmailVerificationPanel'
import { ExportDataPanel } from '@/components/admin/ExportDataPanel'
import { AddUserPanel } from '@/components/admin/AddUserPanel'
import { useAdmin, useAdminUsers } from '@/features/admin/hooks/useAdmin'
import { UserPlus, Shield, RefreshCw, Download } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AdminUsersPage() {
  const { stats, recentActivities, fetchRecentActivities } = useAdmin()
  const { refreshUsers } = useAdminUsers()
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false)
  const [isBulkInviteOpen, setIsBulkInviteOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isRoleManagementOpen, setIsRoleManagementOpen] = useState(false)
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false)
  const [isExportDataOpen, setIsExportDataOpen] = useState(false)
  const [isRefreshingActivities, setIsRefreshingActivities] = useState(false)

  // Fetch users on mount
  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const userStats = {
    total: stats?.totalUsers || 0,
    active: stats?.activeUsers || 0,
    pending: stats?.pendingApplications || 0,
    verified: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.8) : 0,
    suspended: stats?.totalUsers ? stats.totalUsers - (stats?.activeUsers || 0) : 0
  }

  const recentActivity = recentActivities?.map(activity => ({
    id: activity.id || activity._id,
    action: activity.type,
    message: activity.message || activity.description,
    timestamp: new Date(activity.timestamp).toLocaleString(),
    type: (activity.icon === 'Users' ? 'success' : activity.icon === 'Store' ? 'info' : 'warning') as 'success' | 'warning' | 'info' | 'default'
  })) || []

  return (
    <div className="space-y-4">
      {/* Quick Actions - Compact */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setIsBulkInviteOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" />
          <span className="text-xs">Invite</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsRoleManagementOpen(true)}>
          <Shield className="h-4 w-4 mr-1" />
          <span className="text-xs">Roles</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsEmailVerificationOpen(true)}>
          <RefreshCw className="h-4 w-4 mr-1" />
          <span className="text-xs">Verify</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsExportDataOpen(true)}>
          <Download className="h-4 w-4 mr-1" />
          <span className="text-xs">Export</span>
        </Button>
      </div>

      {/* User Table with Stats */}
      <AdminUserTable stats={userStats} />

      {/* Side Panels */}
      <RecentActivityDrawer
        isOpen={isActivityPanelOpen}
        onClose={() => setIsActivityPanelOpen(false)}
        activities={recentActivity}
        onRefresh={async () => {
          setIsRefreshingActivities(true)
          await fetchRecentActivities()
          setIsRefreshingActivities(false)
        }}
        isRefreshing={isRefreshingActivities}
      />
      
      <BulkInvitePanel
        isOpen={isBulkInviteOpen}
        onClose={() => setIsBulkInviteOpen(false)}
      />
      
      <AddUserPanel
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
      
      <RoleManagementPanel
        isOpen={isRoleManagementOpen}
        onClose={() => setIsRoleManagementOpen(false)}
      />
      
      <EmailVerificationPanel
        isOpen={isEmailVerificationOpen}
        onClose={() => setIsEmailVerificationOpen(false)}
      />
      
      <ExportDataPanel
        isOpen={isExportDataOpen}
        onClose={() => setIsExportDataOpen(false)}
      />
    </div>
  )
}