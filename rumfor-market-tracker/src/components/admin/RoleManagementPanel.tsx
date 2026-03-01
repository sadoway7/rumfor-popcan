import React, { useState } from 'react'
import { SidePanel } from '@/components/ui/SidePanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Shield, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { UserRole } from '@/types'

interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
}

const defaultRoles: RoleDefinition[] = [
  {
    id: 'visitor',
    name: 'Visitor',
    description: 'Can browse markets and view public content',
    permissions: ['read:markets', 'read:comments'],
    userCount: 0,
    isSystem: true
  },
  {
    id: 'vendor',
    name: 'Vendor',
    description: 'Can create markets, apply to markets, and manage their profile',
    permissions: ['read:markets', 'write:markets', 'apply:markets', 'manage:profile', 'read:comments'],
    userCount: 0,
    isSystem: true
  },
  {
    id: 'promoter',
    name: 'Promoter',
    description: 'Can create and manage markets, review applications',
    permissions: ['read:all', 'write:markets', 'manage:markets', 'review:applications', 'manage:users'],
    userCount: 0,
    isSystem: true
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access including user management and settings',
    permissions: ['*'],
    userCount: 0,
    isSystem: true
  }
]

interface RoleManagementPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState<RoleDefinition[]>(defaultRoles)
  const [isEditing, setIsEditing] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null)
  const { addToast } = useToast()

  const handleEditRole = (role: RoleDefinition) => {
    if (role.isSystem) {
      addToast({
        variant: 'warning',
        title: 'System Role',
        description: 'System roles cannot be edited.'
      })
      return
    }
    setEditingRole(role)
    setIsEditing(true)
  }

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) {
      addToast({
        variant: 'warning',
        title: 'System Role',
        description: 'System roles cannot be deleted.'
      })
      return
    }

    if (role?.userCount && role.userCount > 0) {
      addToast({
        variant: 'destructive',
        title: 'Cannot Delete',
        description: 'Cannot delete a role that has assigned users.'
      })
      return
    }

    setRoles(roles.filter(r => r.id !== roleId))
    addToast({
      variant: 'success',
      title: 'Role Deleted',
      description: 'The role has been deleted successfully.'
    })
  }

  const columns = [
    {
      key: 'name',
      title: 'Role Name',
      render: (_: any, record: RoleDefinition) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-muted-foreground">{record.description}</div>
          </div>
          {record.isSystem && <Badge variant="outline">System</Badge>}
        </div>
      )
    },
    {
      key: 'permissions',
      title: 'Permissions',
      render: (_: any, record: RoleDefinition) => (
        <div className="flex flex-wrap gap-1">
          {record.permissions.slice(0, 3).map((perm) => (
            <Badge key={perm} variant="outline" className="text-xs">
              {perm}
            </Badge>
          ))}
          {record.permissions.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{record.permissions.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'userCount',
      title: 'Users',
      render: (_: any, record: RoleDefinition) => (
        <span className="text-sm">{record.userCount}</span>
      )
    },
    {
      key: 'actions',
      title: '',
      render: (_: any, record: RoleDefinition) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditRole(record)}
            disabled={record.isSystem}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteRole(record.id)}
            disabled={record.isSystem || record.userCount > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Role Management"
      description="Manage user roles and their permissions"
      width="xl"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Define and manage user roles with specific permissions
          </p>
          <Button>
            Add New Role
          </Button>
        </div>

        <Card className="p-0">
          <Table
            columns={columns}
            data={roles}
            loading={false}
            emptyText="No roles found"
          />
        </Card>

        <div className="space-y-4">
          <h4 className="font-medium">Permission Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h5 className="font-medium text-sm mb-2">Market Permissions</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• read:markets - View markets</li>
                <li>• write:markets - Create markets</li>
                <li>• manage:markets - Edit/delete any market</li>
                <li>• apply:markets - Apply to markets</li>
              </ul>
            </Card>
            <Card className="p-4">
              <h5 className="font-medium text-sm mb-2">User Permissions</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• manage:users - Manage other users</li>
                <li>• manage:profile - Edit own profile</li>
                <li>• review:applications - Review vendor applications</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </SidePanel>
  )
}