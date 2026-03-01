import React, { useState } from 'react'
import { SidePanel } from '@/components/ui/SidePanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface UserEmailStatus {
  id: string
  name: string
  email: string
  isVerified: boolean
  verificationSentAt?: string
  lastLoginAt?: string
}

interface EmailVerificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const EmailVerificationPanel: React.FC<EmailVerificationPanelProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<UserEmailStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified'>('unverified')
  const { addToast } = useToast()

  // Mock data - in real implementation, this would come from API
  React.useEffect(() => {
    const mockUsers: UserEmailStatus[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', isVerified: true, lastLoginAt: '2024-02-28' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', isVerified: false, verificationSentAt: '2024-02-27' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', isVerified: false },
      { id: '4', name: 'Alice Brown', email: 'alice@example.com', isVerified: true, lastLoginAt: '2024-02-26' },
    ]
    setUsers(mockUsers)
  }, [])

  const handleResendVerification = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    setIsLoading(true)
    try {
      // TODO: Implement actual API call
      console.log('Resending verification to:', user.email)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, verificationSentAt: new Date().toISOString() }
          : u
      ))
      
      addToast({
        variant: 'success',
        title: 'Verification Sent',
        description: `Verification email sent to ${user.email}`
      })
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send verification email'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkResend = async () => {
    const unverifiedUsers = users.filter(u => !u.isVerified)
    if (unverifiedUsers.length === 0) {
      addToast({
        variant: 'warning',
        title: 'No Users',
        description: 'No unverified users found'
      })
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement actual bulk API call
      console.log('Sending bulk verification to:', unverifiedUsers.map(u => u.email))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(users.map(u => 
        !u.isVerified 
          ? { ...u, verificationSentAt: new Date().toISOString() }
          : u
      ))
      
      addToast({
        variant: 'success',
        title: 'Bulk Verification Sent',
        description: `Verification emails sent to ${unverifiedUsers.length} users`
      })
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send bulk verification emails'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (isVerified: boolean) => {
    if (isVerified) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) return <Badge variant="default">Verified</Badge>
    return <Badge variant="destructive">Unverified</Badge>
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchEmail.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchEmail.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'verified' && user.isVerified) ||
                         (filterStatus === 'unverified' && !user.isVerified)
    return matchesSearch && matchesFilter
  })

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'All Users' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' }
  ]

  const columns = [
    {
      key: 'name',
      title: 'User',
      render: (_: any, record: UserEmailStatus) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(record.isVerified)}
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-muted-foreground">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: UserEmailStatus) => getStatusBadge(record.isVerified)
    },
    {
      key: 'verificationSentAt',
      title: 'Last Verification Sent',
      render: (_: any, record: UserEmailStatus) => (
        <span className="text-sm text-muted-foreground">
          {record.verificationSentAt 
            ? new Date(record.verificationSentAt).toLocaleDateString()
            : 'Never'
          }
        </span>
      )
    },
    {
      key: 'lastLoginAt',
      title: 'Last Login',
      render: (_: any, record: UserEmailStatus) => (
        <span className="text-sm text-muted-foreground">
          {record.lastLoginAt 
            ? new Date(record.lastLoginAt).toLocaleDateString()
            : 'Never'
          }
        </span>
      )
    },
    {
      key: 'actions',
      title: '',
      render: (_: any, record: UserEmailStatus) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleResendVerification(record.id)}
          disabled={record.isVerified || isLoading}
        >
          <Mail className="h-4 w-4 mr-2" />
          Resend
        </Button>
      )
    }
  ]

  const unverifiedCount = users.filter(u => !u.isVerified).length

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Email Verification"
      description="Manage user email verification status"
      width="xl"
    >
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">{unverifiedCount} users need email verification</span>
            </div>
            <Button
              variant="outline"
              onClick={handleBulkResend}
              disabled={isLoading || unverifiedCount === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Send All
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Filter Users</h4>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by name or email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={filterStatus}
              onValueChange={(value: any) => setFilterStatus(value)}
              options={statusOptions}
              className="w-48"
            />
          </div>
        </Card>

        <Card className="p-0">
          <Table
            columns={columns}
            data={filteredUsers}
            loading={isLoading}
            emptyText="No users found"
          />
        </Card>
      </div>
    </SidePanel>
  )
}