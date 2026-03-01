import React, { useState } from 'react'
import { SidePanel } from '@/components/ui/SidePanel'
import { Button } from '@/components/ui/Button'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Download, FileSpreadsheet, FileText, Database, Calendar } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface ExportDataPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const ExportDataPanel: React.FC<ExportDataPanelProps> = ({ isOpen, onClose }) => {
  const [exportType, setExportType] = useState('users')
  const [format, setFormat] = useState('csv')
  const [dateRange, setDateRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  const { addToast } = useToast()

  const exportTypeOptions: SelectOption[] = [
    { value: 'users', label: 'Users' },
    { value: 'markets', label: 'Markets' },
    { value: 'applications', label: 'Applications' },
    { value: 'reports', label: 'Reports' },
    { value: 'analytics', label: 'Analytics' }
  ]

  const exportDescriptions: Record<string, string> = {
    users: 'All user accounts and profiles',
    markets: 'Market listings and details',
    applications: 'Vendor applications',
    reports: 'Content moderation reports',
    analytics: 'Platform usage statistics'
  }

  const formatOptions: SelectOption[] = [
    { value: 'csv', label: 'CSV (Spreadsheet)' },
    { value: 'json', label: 'JSON (Data)' },
    { value: 'pdf', label: 'PDF (Report)' },
    { value: 'xlsx', label: 'Excel (.xlsx)' }
  ]

  const dateRangeOptions: SelectOption[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last Year' }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'csv':
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5" />
      case 'json':
        return <Database className="h-5 w-5" />
      case 'pdf':
        return <FileText className="h-5 w-5" />
      default:
        return <Download className="h-5 w-5" />
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // TODO: Implement actual export API call
      console.log('Exporting:', { type: exportType, format, dateRange })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate download
      const filename = `${exportType}_export_${new Date().toISOString().split('T')[0]}.${format}`
      console.log('Downloading:', filename)
      
      addToast({
        variant: 'success',
        title: 'Export Complete',
        description: `Your ${exportType} data has been exported as ${filename}`
      })
      
      onClose()
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getSelectedType = () => {
    return exportTypeOptions.find(opt => opt.value === exportType)
  }

  const getSelectedFormat = () => {
    return formatOptions.find(opt => opt.value === format)
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Export Data"
      description="Download platform data in various formats"
      width="lg"
    >
      <div className="space-y-6">
        <Card className="p-4">
          <h4 className="font-medium mb-4">What to Export</h4>
          <Select
            value={exportType}
            onValueChange={setExportType}
            options={exportTypeOptions}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {exportDescriptions[exportType]}
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Export Format</h4>
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((option) => (
              <Button
                key={option.value}
                variant={format === option.value ? 'primary' : 'outline'}
                onClick={() => setFormat(option.value)}
                className="h-16 flex flex-col items-center justify-center gap-2"
              >
                {getIcon(option.value)}
                <span className="text-sm">{option.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Date Range</h4>
          <Select
            value={dateRange}
            onValueChange={setDateRange}
            options={dateRangeOptions}
            className="w-full"
          />
          {dateRange !== 'all' && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Only data from the selected time period will be included
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-3">Export Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Data Type:</span>
              <Badge variant="outline">{getSelectedType()?.label}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Format:</span>
              <Badge variant="outline">{getSelectedFormat()?.label}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date Range:</span>
              <Badge variant="outline">
                {dateRangeOptions.find(opt => opt.value === dateRange)?.label}
              </Badge>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </SidePanel>
  )
}