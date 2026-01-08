import { useState, useCallback } from 'react'
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Download, 
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clock,
  Activity,
  Users,
  Lock,
  Unlock,
  Zap
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useAdminSystemSettings, useAdminBulkOperations } from '@/features/admin/hooks/useAdmin'
import { SystemSettings } from '@/types'
import { cn } from '@/utils/cn'

interface AdminToolsProps {
  className?: string
}

export function AdminTools({ className }: AdminToolsProps) {
  const { systemSettings, isLoadingSettings, refreshSettings, handleUpdateSetting } = useAdminSystemSettings()
  const { bulkOperations, getOperationProgress, getOperationStatus, addBulkOperation } = useAdminBulkOperations()
  const [activeTab, setActiveTab] = useState<'settings' | 'bulk' | 'system' | 'maintenance'>('settings')
  const [bulkOperationType, setBulkOperationType] = useState('')
  const [bulkTargetIds, setBulkTargetIds] = useState('')
  const [bulkParameters, setBulkParameters] = useState('')
  const [isExecutingBulk, setIsExecutingBulk] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false)
  const { addToast } = useToast()

  const handleSettingUpdate = useCallback(async (key: string, value: string) => {
    await handleUpdateSetting(key, value)
  }, [handleUpdateSetting])

  const executeBulkOperation = useCallback(async () => {
    if (!bulkOperationType || !bulkTargetIds) return
    
    setIsExecutingBulk(true)
    try {
      const targetIds = bulkTargetIds.split(',').map(id => id.trim()).filter(Boolean)
      let operation: 'role' | 'suspend' | 'verify' | 'approve' | 'reject' = 'role'
      let value: any = {}
      
      if (bulkParameters) {
        try {
          const params = JSON.parse(bulkParameters)
          if (params.role) {
            operation = 'role'
            value = params.role
          } else if (params.suspend) {
            operation = 'suspend'
            value = params.suspend
          } else if (params.approve) {
            operation = 'approve'
            value = params.approve
          } else if (params.reject) {
            operation = 'reject'
            value = params.reject
          }
        } catch {
          // Invalid JSON, use defaults
        }
      }
      
      // Create bulk operation based on type
      const newOperation = {
        id: `bulk-${Date.now()}`,
        type: bulkOperationType as any,
        targetIds,
        parameters: { operation, value, reason: bulkParameters },
        status: 'processing' as const,
        progress: 0,
        total: targetIds.length,
        createdBy: 'current-admin',
        createdAt: new Date().toISOString()
      }
      
      addBulkOperation(newOperation)
      
      // Simulate progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 20
        if (progress >= 100) {
          clearInterval(interval)
          addToast({ 
            variant: 'success', 
            title: 'Bulk Operation Complete', 
            description: `Successfully processed ${targetIds.length} items.` 
          })
        }
      }, 500)
      
      // Reset form
      setBulkOperationType('')
      setBulkTargetIds('')
      setBulkParameters('')
      
      addToast({ 
        variant: 'success', 
        title: 'Operation Started', 
        description: `Bulk operation "${bulkOperationType}" has been queued.` 
      })
    } catch (error) {
      addToast({ 
        variant: 'destructive', 
        title: 'Operation Failed', 
        description: 'Failed to execute bulk operation. Please try again.' 
      })
    } finally {
      setIsExecutingBulk(false)
    }
  }, [bulkOperationType, bulkTargetIds, bulkParameters, addBulkOperation, addToast])

  const toggleMaintenanceMode = useCallback(async () => {
    setIsTogglingMaintenance(true)
    try {
      const newValue = !maintenanceMode
      await handleUpdateSetting('maintenance_mode', newValue.toString())
      setMaintenanceMode(newValue)
      addToast({ 
        variant: 'success', 
        title: newValue ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled', 
        description: newValue 
          ? 'The application is now in maintenance mode.'
          : 'The application is now running normally.'
      })
    } catch (error) {
      addToast({ 
        variant: 'destructive', 
        title: 'Failed to Toggle Maintenance Mode', 
        description: 'Please try again.' 
      })
    } finally {
      setIsTogglingMaintenance(false)
    }
  }, [maintenanceMode, handleUpdateSetting, addToast])

  const systemHealth = {
    status: 'healthy',
    uptime: '99.9%',
    lastBackup: '2 hours ago',
    activeConnections: 147,
    diskUsage: '68%',
    memoryUsage: '45%'
  }

  const maintenanceTasks = [
    {
      id: '1',
      name: 'Database Optimization',
      description: 'Optimize database indexes and clean up old records',
      status: 'completed',
      lastRun: '2 hours ago',
      nextRun: '24 hours'
    },
    {
      id: '2',
      name: 'Cache Cleanup',
      description: 'Clear expired cache and rebuild indexes',
      status: 'completed',
      lastRun: '1 hour ago',
      nextRun: '6 hours'
    },
    {
      id: '3',
      name: 'Log Rotation',
      description: 'Archive and rotate system logs',
      status: 'pending',
      lastRun: '12 hours ago',
      nextRun: '12 hours'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge variant="default">Healthy</Badge>
      case 'warning': return <Badge variant="warning">Warning</Badge>
      case 'error': return <Badge variant="destructive">Error</Badge>
      case 'completed': return <Badge variant="default">Completed</Badge>
      case 'pending': return <Badge variant="outline">Pending</Badge>
      case 'processing': return <Badge variant="warning">Processing</Badge>
      default: return <Badge variant="muted">{status}</Badge>
    }
  }

  const bulkOperationOptions: SelectOption[] = [
    { value: '', label: 'Select operation type' },
    { value: 'user-role', label: 'Bulk User Role Update' },
    { value: 'user-suspend', label: 'Bulk User Suspension' },
    { value: 'content-approve', label: 'Bulk Content Approval' },
    { value: 'content-reject', label: 'Bulk Content Rejection' },
    { value: 'application-bulk-review', label: 'Bulk Application Review' }
  ]

  const settingsByCategory = systemSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = []
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, SystemSettings[]>)

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {Object.entries(settingsByCategory).map(([category, settings]) => (
        <Card key={category} className="p-6">
          <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
            {category === 'general' && <Settings className="h-5 w-5" />}
            {category === 'moderation' && <Shield className="h-5 w-5" />}
            {category === 'notifications' && <Mail className="h-5 w-5" />}
            {category === 'features' && <Zap className="h-5 w-5" />}
            {category} Settings
          </h3>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <div className="ml-4">
                  {setting.type === 'boolean' ? (
                    <Button
                      variant={setting.value === 'true' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleSettingUpdate(setting.key, setting.value === 'true' ? 'false' : 'true')}
                    >
                      {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                    </Button>
                  ) : (
                    <Input
                      value={setting.value}
                      onChange={(e) => handleSettingUpdate(setting.key, e.target.value)}
                      className="w-32"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )

  const renderBulkOperationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create Bulk Operation</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Operation Type</label>
            <Select
              value={bulkOperationType}
              onValueChange={setBulkOperationType}
              options={bulkOperationOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target IDs (comma-separated)</label>
            <Input
              value={bulkTargetIds}
              onChange={(e) => setBulkTargetIds(e.target.value)}
              placeholder="user-1, user-2, user-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Parameters (JSON)</label>
            <textarea
              className="w-full p-2 border rounded-md resize-none"
              rows={3}
              value={bulkParameters}
              onChange={(e) => setBulkParameters(e.target.value)}
              placeholder='{"role": "vendor", "reason": "bulk update"}'
            />
          </div>
          <Button
            onClick={executeBulkOperation}
            disabled={!bulkOperationType || !bulkTargetIds || isExecutingBulk}
            className="w-full"
          >
            {isExecutingBulk ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Executing...</>
            ) : (
              'Execute Bulk Operation'
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Operations</h3>
        <div className="space-y-3">
          {bulkOperations.map((operation) => (
            <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{operation.type.replace(/-/g, ' ')}</span>
                  {getStatusBadge(getOperationStatus(operation))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {operation.targetIds.length} items • {operation.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  {getOperationProgress(operation.id)}%
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getOperationProgress(operation.id)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {bulkOperations.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No bulk operations found</p>
          )}
        </div>
      </Card>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium">Status</span>
            </div>
            <div className="text-2xl font-bold">{getStatusBadge(systemHealth.status)}</div>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Uptime</span>
            </div>
            <div className="text-2xl font-bold">{systemHealth.uptime}</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Active Connections</span>
            </div>
            <div className="text-2xl font-bold">{systemHealth.activeConnections}</div>
            <p className="text-sm text-muted-foreground">Current session</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Disk Usage</span>
            </div>
            <div className="text-2xl font-bold">{systemHealth.diskUsage}</div>
            <p className="text-sm text-muted-foreground">Available storage</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Maintenance Tasks</h3>
        <div className="space-y-3">
          {maintenanceTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{task.name}</span>
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  Last run: {task.lastRun} • Next: {task.nextRun}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Run Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>Import Data</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Backup Database</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            <span>Sync Services</span>
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Maintenance Mode</h3>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {maintenanceMode ? (
                <Lock className="h-5 w-5 text-red-500" />
              ) : (
                <Unlock className="h-5 w-5 text-green-500" />
              )}
              <span className="font-medium">
                {maintenanceMode ? 'Maintenance Mode Active' : 'Maintenance Mode Inactive'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {maintenanceMode 
                ? 'The application is currently in maintenance mode. Only administrators can access the site.'
                : 'The application is running normally. All users have access.'
              }
            </p>
          </div>
          <Button
            variant={maintenanceMode ? 'destructive' : 'primary'}
            onClick={toggleMaintenanceMode}
            disabled={isTogglingMaintenance}
          >
            {isTogglingMaintenance ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : maintenanceMode ? (
              <Lock className="h-4 w-4 mr-2" />
            ) : (
              <Unlock className="h-4 w-4 mr-2" />
            )}
            {maintenanceMode ? 'Disabling...' : 'Enabling...'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Emergency Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-900">Clear All Caches</span>
              </div>
              <p className="text-sm text-red-700">
                Clear all application caches. This may cause temporary performance degradation.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Caches
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-900">Restart Services</span>
              </div>
              <p className="text-sm text-red-700">
                Restart all application services. This will briefly interrupt service.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Restart Services
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-900">Purge Logs</span>
              </div>
              <p className="text-sm text-red-700">
                Delete all log files older than 30 days. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Purge Logs
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium">Version</label>
            <p>v1.0.0 (Build 2024.12.01)</p>
          </div>
          <div>
            <label className="font-medium">Environment</label>
            <p>Production</p>
          </div>
          <div>
            <label className="font-medium">Node Version</label>
            <p>18.17.0</p>
          </div>
          <div>
            <label className="font-medium">Database</label>
            <p>PostgreSQL 14.5</p>
          </div>
          <div>
            <label className="font-medium">Last Backup</label>
            <p>{systemHealth.lastBackup}</p>
          </div>
          <div>
            <label className="font-medium">Memory Usage</label>
            <p>{systemHealth.memoryUsage}</p>
          </div>
        </div>
      </Card>
    </div>
  )

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'bulk', label: 'Bulk Operations', icon: Users },
    { id: 'system', label: 'System', icon: Activity },
    { id: 'maintenance', label: 'Maintenance', icon: Shield }
  ] as const

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Admin Tools</h1>
              <p className="text-muted-foreground">
                System management and configuration tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={refreshSettings}
              disabled={isLoadingSettings}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingSettings && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-6">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'bulk' && renderBulkOperationsTab()}
          {activeTab === 'system' && renderSystemTab()}
          {activeTab === 'maintenance' && renderMaintenanceTab()}
        </div>
      </Card>
    </div>
  )
}