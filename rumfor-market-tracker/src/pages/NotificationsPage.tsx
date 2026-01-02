import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Filter, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useNotificationsStore } from '@/features/notifications/notificationsStore'
import { NotificationType } from '@/types'
import { cn } from '@/utils/cn'

const notificationConfig = {
  'application-approved': {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Application Approved'
  },
  'application-rejected': {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Application Rejected'
  },
  'market-updated': {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Market Updated'
  },
  'new-comment': {
    icon: Info,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'New Comment'
  },
  'new-photo': {
    icon: Info,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'New Photo'
  },
  'reminder': {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Reminder'
  },
  'announcement': {
    icon: Info,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'Announcement'
  }
}

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationsStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all')

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType)
    }

    // Apply status filter
    if (filterStatus === 'read') {
      filtered = filtered.filter(notification => notification.read)
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter(notification => !notification.read)
    }

    return filtered
  }, [notifications, searchQuery, filterType, filterStatus])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleDeleteNotification = (id: string) => {
    removeNotification(id)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('all')
    setFilterStatus('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with all your market activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {unreadCount} unread
            </Badge>
          )}
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Read</p>
              <p className="text-2xl font-bold text-foreground">{notifications.length - unreadCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as 'all' | 'read' | 'unread')}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'unread', label: 'Unread Only' },
                { value: 'read', label: 'Read Only' }
              ]}
            />

            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as NotificationType | 'all')}
              options={[
                { value: 'all', label: 'All Types' },
                ...Object.entries(notificationConfig).map(([type, config]) => ({
                  value: type as NotificationType,
                  label: config.label
                }))
              ]}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Notifications ({filteredNotifications.length})
          </h2>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You\'re all caught up! New notifications will appear here.'
              }
            </p>
            {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = notificationConfig[notification.type] || notificationConfig['announcement']
              const Icon = config.icon

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border border-border rounded-lg transition-colors",
                    !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      config.bgColor
                    )}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn(
                              "text-sm font-medium text-foreground",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}