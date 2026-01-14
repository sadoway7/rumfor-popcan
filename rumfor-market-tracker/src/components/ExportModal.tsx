import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Market } from '@/types'
import { format, parseISO } from 'date-fns'
import { Download, FileText, Table, Code, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  markets: Market[]
}

type ExportFormat = 'csv' | 'pdf' | 'json'
type ExportScope = 'all' | 'active' | 'upcoming'

interface ExportOptions {
  format: ExportFormat
  scope: ExportScope
  includeContact: boolean
  includeSchedule: boolean
  includeDescription: boolean
}

const defaultOptions: ExportOptions = {
  format: 'csv',
  scope: 'all',
  includeContact: true,
  includeSchedule: true,
  includeDescription: true
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  markets
}) => {
  const [options, setOptions] = useState<ExportOptions>(defaultOptions)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [exportMessage, setExportMessage] = useState('')

  const formatOptions = [
    { value: 'csv', label: 'CSV (Excel Compatible)', icon: Table },
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'json', label: 'JSON Data', icon: Code }
  ]

  const scopeOptions = [
    { value: 'all', label: 'All Tracked Markets' },
    { value: 'active', label: 'Active Markets Only' },
    { value: 'upcoming', label: 'Upcoming Markets' }
  ]

  const handleOptionChange = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }))
    setExportStatus('idle')
  }

  const getFilteredMarkets = (): Market[] => {
    let filtered = [...markets]

    switch (options.scope) {
      case 'active':
        filtered = filtered.filter(market => market.status === 'active')
        break
      case 'upcoming':
        filtered = filtered.filter(market => {
          const now = new Date()
          return market.schedule?.some(schedule => {
            const startDate = parseISO(schedule.startDate)
            return startDate > now
          })
        })
        break
      default:
        break
    }

    return filtered
  }

  const prepareExportData = (markets: Market[]) => {
    return markets.map(market => {
      const data: any = {
        'Market Name': market.name,
        'Category': market.category,
        'Status': market.status,
        'Location': `${market.location.city}, ${market.location.state}`,
        'Address': market.location.address,
        'Zip Code': market.location.zipCode,
        'Country': market.location.country
      }

      if (options.includeSchedule && market.schedule) {
        data['Schedule'] = market.schedule.map(s => 
          `${s.dayOfWeek}: ${s.startTime}-${s.endTime} (${s.startDate} to ${s.endDate})`
        ).join('; ')
      }

      if (options.includeDescription) {
        data['Description'] = market.description
      }

      if (options.includeContact) {
        if (market.contact.phone) data['Phone'] = market.contact.phone
        if (market.contact.email) data['Email'] = market.contact.email
        if (market.contact.website) data['Website'] = market.contact.website
      }

      data['Tags'] = market.tags.join(', ')
      data['Created Date'] = format(parseISO(market.createdAt), 'yyyy-MM-dd')
      data['Updated Date'] = format(parseISO(market.updatedAt), 'yyyy-MM-dd')

      return data
    })
  }

  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, filename)
  }

  const exportToPDF = (data: any[], filename: string) => {
    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(20)
    pdf.text('Tracked Markets Report', 20, 20)
    
    // Add metadata
    pdf.setFontSize(12)
    pdf.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, 35)
    pdf.text(`Total Markets: ${data.length}`, 20, 45)
    
    if (data.length === 0) {
      pdf.text('No markets to display', 20, 60)
    } else {
      // Prepare table data
      const headers = Object.keys(data[0])
      const rows = data.map(row => headers.map(header => row[header] || ''))
      
      // @ts-expect-error - jsPDF-autotable types
      pdf.autoTable({
        head: [headers],
        body: rows,
        startY: 55,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202] }
      })
    }
    
    pdf.save(filename)
  }

  const exportToJSON = (data: any[], filename: string) => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalMarkets: data.length,
      scope: options.scope,
      markets: data
    }
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    })
    saveAs(blob, filename)
  }

  const generateFilename = (fileFormat: ExportFormat): string => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm')
    const scopeText = options.scope === 'all' ? 'all-markets' : `${options.scope}-markets`
    return `rumfor-markets-${scopeText}-${timestamp}.${fileFormat}`
  }

  const handleExport = async () => {
    if (markets.length === 0) {
      setExportStatus('error')
      setExportMessage('No markets available to export')
      return
    }

    setIsExporting(true)
    setExportStatus('idle')

    try {
      const filteredMarkets = getFilteredMarkets()
      
      if (filteredMarkets.length === 0) {
        setExportStatus('error')
        setExportMessage('No markets match the selected criteria')
        setIsExporting(false)
        return
      }

      const exportData = prepareExportData(filteredMarkets)
      const filename = generateFilename(options.format)

      switch (options.format) {
        case 'csv':
          exportToCSV(exportData, filename)
          break
        case 'pdf':
          exportToPDF(exportData, filename)
          break
        case 'json':
          exportToJSON(exportData, filename)
          break
      }

      setExportStatus('success')
      setExportMessage(`Successfully exported ${filteredMarkets.length} markets`)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setExportStatus('idle')
        setExportMessage('')
      }, 2000)

    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
      setExportMessage('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setOptions(defaultOptions)
    setExportStatus('idle')
    setExportMessage('')
    onClose()
  }

  const filteredCount = getFilteredMarkets().length

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Export Markets</h2>
              <p className="text-sm text-muted-foreground">
                Download your tracked markets in various formats
              </p>
            </div>
          </div>
        </div>

        {/* Export Format */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Export Format</h3>
          <div className="grid grid-cols-1 gap-3">
            {formatOptions.map(({ value, label, icon: Icon }) => (
              <Card 
                key={value}
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  options.format === value 
                    ? "border-primary bg-primary/5" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleOptionChange('format', value as ExportFormat)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">{label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {value === 'csv' && 'Best for spreadsheet applications'}
                      {value === 'pdf' && 'Formatted report for sharing'}
                      {value === 'json' && 'Structured data for developers'}
                    </p>
                  </div>
                  {options.format === value && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Scope Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Market Scope</h3>
          <Select
            value={options.scope}
            onValueChange={(value) => handleOptionChange('scope', value as ExportScope)}
            options={scopeOptions}
            placeholder="Select scope"
          />
          <p className="text-sm text-muted-foreground">
            {filteredCount} markets will be exported with current selection
          </p>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Include Information</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeContact}
                onChange={(e) => handleOptionChange('includeContact', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium">Contact Information</span>
                <p className="text-sm text-muted-foreground">Phone, email, website</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeSchedule}
                onChange={(e) => handleOptionChange('includeSchedule', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium">Schedule Details</span>
                <p className="text-sm text-muted-foreground">Operating days and hours</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeDescription}
                onChange={(e) => handleOptionChange('includeDescription', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium">Market Description</span>
                <p className="text-sm text-muted-foreground">Detailed description and tags</p>
              </div>
            </label>
          </div>
        </div>

        {/* Export Status */}
        {exportStatus !== 'idle' && (
          <Card className={cn(
            "p-4",
            exportStatus === 'success' 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center gap-3">
              {exportStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={cn(
                  "font-medium",
                  exportStatus === 'success' ? "text-green-800" : "text-red-800"
                )}>
                  {exportStatus === 'success' ? 'Export Complete' : 'Export Failed'}
                </p>
                <p className={cn(
                  "text-sm",
                  exportStatus === 'success' ? "text-green-700" : "text-red-700"
                )}>
                  {exportMessage}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || markets.length === 0}
          >
            {isExporting ? (
              <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export Markets'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}