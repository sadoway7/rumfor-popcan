import { useState, useMemo } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldX, 
  UserX, 
  UserCheck, 
  CheckSquare, 
  Square,
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
import { useAdminUsers } from '@/features/admin/hooks/useAdmin'
import { UserRole, UserWithStats } from '@/types'
import { cn } from '@/utils/cn'

interface AdminUserTableProps {
  className?: string
}

export function AdminUserTable({ className }: AdminUserTableProps) {
  const {
    users,
    usersPagination,
    isLoadingUsers,
    selectedUsers,
    userFilters,
    refreshUsers,
    handleRoleChange,
    handleSuspendUser,
    handleVerifyUser,
    handleBulkUpdate,
    handleFilterChange,
    selectUser,
    selectUsers,
    clearUserSelection
  } = useAdminUsers()

  const [searchTerm, setSearchTerm] = useState(userFilters?.search || '')
  const [showFilters, setShowFilters] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [bulkValue, setBulkValue] = useState('')

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    
    const search = searchTerm.toLowerCase()
    return users.filter(user => 
      user.firstName.toLowerCase().includes(search) ||
      user.lastName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }, [users, searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    handleFilterChange({
      ...userFilters,
      search: value || undefined
    })
  }

  const handleRoleFilter = (value: string) => {
    handleFilterChange({
      ...userFilters,
      role: value ? [value as UserRole] : undefined
    })
  }

  const handleStatusFilter = (status: string) => {
    const isActive = status === 'active' ? true : status === 'inactive' ? false : undefined
    handleFilterChange({
      ...userFilters,
      isActive
    })
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      clearUserSelection()
    } else {
      selectUsers(filteredUsers.map(u => u.id))
    }
  }

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return

    let value: any = bulkValue
    if (bulkAction === 'verify') {
      value = bulkValue === 'true'
    }

    handleBulkUpdate(selectedUsers, bulkAction as any, value)
    setBulkAction('')
    setBulkValue('')
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'promoter': return 'default'
      case 'vendor': return 'outline'
      default: return 'muted'
    }
  }

  // Select options
  const roleFilterOptions: SelectOption[] = [
    { value: '', label: 'All Roles' },
    { value: 'visitor', label: 'Visitor' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'admin', label: 'Admin' }
  ]

  const statusFilterOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const bulkActionOptions: SelectOption[] = [
    { value: '', label: 'Select action' },
    { value: 'role', label: 'Change Role' },
    { value: 'suspend', label: 'Suspend/Activate' },
    { value: 'verify', label: 'Verify/Unverify' }
  ]

  const bulkValueOptions: SelectOption[] = bulkAction === 'role' ? [
    { value: 'visitor', label: 'Visitor' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'admin', label: 'Admin' }
  ] : bulkAction === 'suspend' ? [
    { value: 'suspend', label: 'Suspend' },
    { value: 'activate', label: 'Activate' }
  ] : bulkAction === 'verify' ? [
    { value: 'true', label: 'Verify' },
    { value: 'false', label: 'Unverify' }
  ] : []

  const roleChangeOptions: SelectOption[] = [
    { value: 'visitor', label: 'Visitor' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'admin', label: 'Admin' }
  ]

  // Table columns
  const columns = [
    {
      key: 'select',
      title: '',
      width: '48px',
      render: (_: any, record: UserWithStats) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectUser(record.id)}
          className="h-8 w-8 p-0"
        >
          {selectedUsers.includes(record.id) ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
      )
    },
    {
      key: 'user',
      title: 'User',
      render: (_: any, record: UserWithStats) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} alt={record.firstName} />
          <div>
            <div className="font-medium">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {record.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (_: any, record: UserWithStats) => (
        <Badge variant={getRoleBadgeVariant(record.role)}>
          {record.role}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: UserWithStats) => getStatusBadge(record)
    },
    {
      key: 'stats',
      title: 'Stats',
      render: (_: any, record: UserWithStats) => getUserStats(record)
    },
    {
      key: 'lastActive',
      title: 'Last Active',
      render: (_: any, record: UserWithStats) => (
        <span className="text-sm text-muted-foreground">
          {new Date(record.lastActiveAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: UserWithStats) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVerifyUser(record.id, !record.isEmailVerified)}
            title={record.isEmailVerified ? 'Unverify user' : 'Verify user'}
          >
            {record.isEmailVerified ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSuspendUser(record.id, record.isActive)}
            title={record.isActive ? 'Suspend user' : 'Activate user'}
          >
            {record.isActive ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </Button>
          <Select
            value={record.role}
            onValueChange={(value) => handleRoleChange(record.id, value as UserRole)}
            options={roleChangeOptions}
            className="w-24"
          />
        </div>
      )
    }
  ]

  const getStatusBadge = (user: UserWithStats) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Suspended</Badge>
    }
    if (!user.isEmailVerified) {
      return <Badge variant="outline">Unverified</Badge>
    }
    if (user.isVerified) {
      return <Badge variant="default">Verified</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getUserStats = (user: UserWithStats) => {
    return (
      <div className="text-sm text-muted-foreground space-y-1">
        <div>Applications: {user.totalApplications}</div>
        <div>Approved: {user.approvedApplications}</div>
        <div>Reports: {user.reportedContent}</div>
      </div>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">User Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshUsers()}
            disabled={isLoadingUsers}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingUsers && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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
              placeholder="Filter by role"
              value={userFilters?.role?.[0] || ''}
              onValueChange={handleRoleFilter}
              options={roleFilterOptions}
            />
            <Select
              placeholder="Filter by status"
              value={
                userFilters?.isActive === true ? 'active' : 
                userFilters?.isActive === false ? 'inactive' : ''
              }
              onValueChange={handleStatusFilter}
              options={statusFilterOptions}
            />
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
          <span className="text-sm font-medium">
            {selectedUsers.length} user(s) selected
          </span>
          <Select
            placeholder="Bulk action"
            value={bulkAction}
            onValueChange={setBulkAction}
            options={bulkActionOptions}
            className="w-40"
          />
          {bulkAction && (
            <Select
              placeholder="Value"
              value={bulkValue}
              onValueChange={setBulkValue}
              options={bulkValueOptions}
              className="w-40"
            />
          )}
          {bulkAction && bulkValue && (
            <Button onClick={handleBulkAction}>
              Apply
            </Button>
          )}
          <Button variant="outline" onClick={clearUserSelection}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Select All Header */}
      <div className="flex items-center justify-between mb-4 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-8 w-8 p-0"
        >
          {selectedUsers.length === filteredUsers.length ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? 'All selected' : 'Select all'}
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={filteredUsers}
          loading={isLoadingUsers}
          emptyText="No users found"
        />
      </div>

      {/* Pagination */}
      {usersPagination && usersPagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(usersPagination.page - 1) * usersPagination.limit + 1} to{' '}
            {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of{' '}
            {usersPagination.total} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={usersPagination.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {usersPagination.page} of {usersPagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={usersPagination.page >= usersPagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}