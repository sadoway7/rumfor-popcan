import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search,
  Filter,
  ShieldCheck,
  ShieldX,
  UserX,
  UserCheck,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  MoreVertical,
  Mail
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { 
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/components/ui/DataTable'
import { ModernCheckbox } from '@/components/ui/ModernCheckbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { useAdminUsers } from '@/features/admin/hooks/useAdmin'
import { UserRole, UserWithStats } from '@/types'
import { cn } from '@/utils/cn'

interface AdminUserTableProps {
  className?: string
  stats?: {
    total: number
    active: number
    pending: number
    verified: number
    suspended: number
  }
}

function UserActionsDropdown({ 
  record, 
  onEdit, 
  onVerify, 
  onResendVerification,
  onSuspend, 
  onDelete 
}: { 
  record: UserWithStats
  onEdit: () => void
  onVerify: () => void
  onResendVerification: () => Promise<void>
  onSuspend: () => void
  onDelete: () => void
}) {
  const handleResend = async () => {
    await onResendVerification()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onVerify}>
          {record.isEmailVerified ? (
            <>
              <ShieldX className="h-4 w-4 mr-2" />
              Unverify Email
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verify Email
            </>
          )}
        </DropdownMenuItem>
        {!record.isEmailVerified && (
          <DropdownMenuItem onClick={handleResend}>
            <Mail className="h-4 w-4 mr-2" />
            Resend Verification
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onSuspend}>
          {record.isActive ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Suspend User
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate User
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AdminUserTable({ className, stats }: AdminUserTableProps) {
  const navigate = useNavigate()
  const {
    users,
    usersPagination,
    isLoadingUsers,
    selectedUsers,
    userFilters,
    refreshUsers,
    handleRoleChange,
    handleDeleteUser,
    handleSuspendUser,
    handleVerifyUser,
    handleResendVerification,
    handlePageChange,
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
    const isEmailVerified = status === 'unverified' ? false : undefined
    handleFilterChange({
      ...userFilters,
      isActive,
      isEmailVerified
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
    { value: 'inactive', label: 'Inactive' },
    { value: 'unverified', label: 'Unverified' }
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

  const getStatusBadge = (user: UserWithStats) => {
    if (!user.isActive) return <Badge variant="destructive">Suspended</Badge>
    if (!user.isEmailVerified) return <Badge variant="warning">Unverified</Badge>
    if (user.isVerified) return <Badge variant="success">Verified</Badge>
    return <Badge variant="default">Active</Badge>
  }

  return (
    <div className={cn('w-full', className)}>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">User Management</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refreshUsers()} disabled={isLoadingUsers} className="h-8">
                <RefreshCw className={cn('h-3 w-3', isLoadingUsers && 'animate-spin')} />
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="flex items-center gap-3 text-xs border-b pb-3 mb-3">
              <span>Total: <b>{stats.total}</b></span>
              <span>Active: <b className="text-green-600">{stats.active}</b></span>
              <span>Pending: <b className="text-yellow-600">{stats.pending}</b></span>
              <span>Verified: <b className="text-blue-600">{stats.verified}</b></span>
              <span>Suspended: <b className="text-red-600">{stats.suspended}</b></span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("h-8 px-3", showFilters && "bg-primary text-primary-foreground")}
            >
              <Filter className="h-3 w-3" />
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t">
              <Select placeholder="Role" value={userFilters?.role?.[0] || ''} onValueChange={handleRoleFilter} options={roleFilterOptions} className="w-28" />
              <Select placeholder="Status" value={userFilters?.isActive === true ? 'active' : userFilters?.isActive === false ? 'inactive' : ''} onValueChange={handleStatusFilter} options={statusFilterOptions} className="w-28" />
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-b text-sm">
            <ModernCheckbox checked={selectedUsers.length === filteredUsers.length} onCheckedChange={handleSelectAll} />
            <span className="font-medium">{selectedUsers.length} selected</span>
            <Select placeholder="Action" value={bulkAction} onValueChange={setBulkAction} options={bulkActionOptions} className="w-28" />
            {bulkAction && <Select placeholder="Value" value={bulkValue} onValueChange={setBulkValue} options={bulkValueOptions} className="w-28" />}
            {bulkAction && bulkValue && <Button size="sm" onClick={handleBulkAction}>Apply</Button>}
            <Button variant="ghost" size="sm" onClick={clearUserSelection}>Clear</Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-auto">
          <DataTable>
            <DataTableHeader className="sticky top-0 bg-background z-10">
              <DataTableRow>
                <DataTableHead className="h-10"><ModernCheckbox checked={selectedUsers.length === filteredUsers.length} onCheckedChange={handleSelectAll} /></DataTableHead>
                <DataTableHead className="h-10">User</DataTableHead>
                <DataTableHead className="h-10">Role</DataTableHead>
                <DataTableHead className="h-10">Status</DataTableHead>
                <DataTableHead className="h-10">Apps</DataTableHead>
                <DataTableHead className="h-10">Reports</DataTableHead>
                <DataTableHead className="h-10">Last Active</DataTableHead>
                <DataTableHead className="h-10 w-12"></DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {isLoadingUsers ? (
                <DataTableRow>
                  <DataTableCell colSpan={8} className="text-center py-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ) : filteredUsers.length === 0 ? (
                <DataTableRow>
                  <DataTableCell colSpan={8} className="text-center py-6 text-muted-foreground">No users found</DataTableCell>
                </DataTableRow>
              ) : (
                filteredUsers.map((user) => (
                  <DataTableRow key={user.id} className="hover:bg-muted/30">
                    <DataTableCell className="py-2"><ModernCheckbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => selectUser(user.id)} /></DataTableCell>
                    <DataTableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={user.avatar} alt={user.firstName} size="sm" fallback={`${user.firstName} ${user.lastName}`} />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="py-2"><Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge></DataTableCell>
                    <DataTableCell className="py-2">{getStatusBadge(user)}</DataTableCell>
                    <DataTableCell className="py-2"><div className="text-xs">{user.totalApplications} <span className="text-muted-foreground">({user.approvedApplications})</span></div></DataTableCell>
                    <DataTableCell className="py-2"><span className={cn("text-xs", user.reportedContent > 0 && "text-red-600")}>{user.reportedContent}</span></DataTableCell>
                    <DataTableCell className="py-2"><span className="text-xs text-muted-foreground">{new Date(user.lastActiveAt).toLocaleDateString()}</span></DataTableCell>
                    <DataTableCell className="py-2">
                      <UserActionsDropdown
                        record={user}
                        onEdit={() => navigate(`/admin/users/${user.id}`)}
                        onVerify={() => handleVerifyUser(user.id, !user.isEmailVerified)}
                        onResendVerification={async () => {
                          const result = await handleResendVerification(user.id)
                          alert(result.success ? 'Verification email sent to ' + user.email : 'Failed: ' + (result.error || 'Unknown error'))
                        }}
                        onSuspend={() => handleSuspendUser(user.id, !user.isActive)}
                        onDelete={() => handleDeleteUser(user.id)}
                      />
                    </DataTableCell>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </div>

        {/* Pagination */}
        {usersPagination && usersPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs">
            <div className="text-muted-foreground">
              {(usersPagination.page - 1) * usersPagination.limit + 1}-{Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of {usersPagination.total}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled={usersPagination.page <= 1} onClick={() => handlePageChange(usersPagination.page - 1)} className="h-7 px-2">Prev</Button>
              <span className="px-2">{usersPagination.page}/{usersPagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={usersPagination.page >= usersPagination.totalPages} onClick={() => handlePageChange(usersPagination.page + 1)} className="h-7 px-2">Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
