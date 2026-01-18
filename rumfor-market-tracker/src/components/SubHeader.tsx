import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { UserRole } from '@/types'

export function SubHeader() {
  const { user } = useAuthStore()
  const { unreadCount } = useNotifications()
  const { trackedMarkets } = useTrackedMarkets()
  const { applications } = useApplications()

  if (!user) return null

  const getRoleSpecificStats = (role: UserRole) => {
    switch (role) {
      case 'vendor':
        return {
          stats: [
            { label: 'Saved Markets', value: trackedMarkets.length },
            { label: 'Following', value: 8 }, // TODO: implement following count
            { label: 'Notifications', value: `${unreadCount} new` },
          ],
          actions: [
            { label: 'Quick Add', href: '/vendor/add-market' },
            { label: 'My Calendar', href: '/vendor/calendar' },
          ]
        }
      case 'promoter':
        return {
          stats: [
            { label: 'My Markets', value: 5 }, // TODO: implement promoter markets count
            { label: 'Applications', value: applications.filter(a => a.status === 'under-review').length },
            { label: 'Notifications', value: `${unreadCount} new` },
          ],
          actions: [
            { label: 'Create Market', href: '/promoter/markets/create' },
            { label: 'My Calendar', href: '/promoter/calendar' },
          ]
        }
      case 'admin':
        return {
          stats: [
            { label: 'Pending Reviews', value: 12 }, // TODO: implement admin stats
            { label: 'Active Users', value: 245 },
            { label: 'Notifications', value: `${unreadCount} new` },
          ],
          actions: [
            { label: 'Admin Panel', href: '/admin/dashboard' },
            { label: 'System Status', href: '/admin/settings' },
          ]
        }
      default:
        return {
          stats: [
            { label: 'Saved Markets', value: trackedMarkets.length },
            { label: 'Following', value: 8 },
            { label: 'Notifications', value: `${unreadCount} new` },
          ],
          actions: [
            { label: 'Explore', href: '/markets' },
            { label: 'My Profile', href: '/profile' },
          ]
        }
    }
  }

  const { stats, actions } = getRoleSpecificStats(user.role)

  return (
    <div className="bg-surface/30 px-4 py-2 flex items-center justify-between text-sm text-foreground border-b border-border/50 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto flex-nowrap">
        {stats.map((stat, index) => (
          <div key={index} className="whitespace-nowrap">
            {stat.label}: <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions.map((action, index) => (
          <Link key={index} to={action.href}>
            <button className="px-3 py-1 rounded hover:bg-surface transition-colors whitespace-nowrap text-xs">
              {action.label}
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}