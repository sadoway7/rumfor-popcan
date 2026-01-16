import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react'

export interface VendorAttendanceTrackerProps {
  marketId: string
  currentStatus?: 'attending' | 'interested' | 'not-attending' | 'maybe'
  onStatusUpdate?: (marketId: string, status: string) => Promise<void>
  isLoading?: boolean
  canEdit?: boolean
}

const attendanceOptions = [
  {
    value: 'attending',
    label: 'Attending',
    icon: CheckCircle,
    color: 'text-green-600',
    description: 'I plan to attend this market'
  },
  {
    value: 'interested',
    label: 'Interested',
    icon: AlertCircle,
    color: 'text-yellow-600',
    description: 'I\'m interested in attending'
  },
  {
    value: 'maybe',
    label: 'Maybe',
    icon: HelpCircle,
    color: 'text-blue-600',
    description: 'I\'m considering attending'
  },
  {
    value: 'not-attending',
    label: 'Not Attending',
    icon: XCircle,
    color: 'text-red-600',
    description: 'I won\'t be attending this market'
  }
]

export const VendorAttendanceTracker: React.FC<VendorAttendanceTrackerProps> = ({
  marketId,
  currentStatus,
  onStatusUpdate,
  isLoading = false,
  canEdit = true
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'interested')
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (!canEdit || !onStatusUpdate) return

    setUpdating(true)
    try {
      await onStatusUpdate(marketId, newStatus)
      setSelectedStatus(newStatus as Exclude<VendorAttendanceTrackerProps['currentStatus'], undefined>)
    } catch (error) {
      console.error('Failed to update attendance status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const currentOption = attendanceOptions.find(opt => opt.value === selectedStatus)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-accent" />
          My Attendance Status
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your attendance plans for this market. This is an honor system - only mark as attending if you're committed.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status Display */}
        {currentOption && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <currentOption.icon className={`h-5 w-5 ${currentOption.color}`} />
            <div>
              <div className="font-medium">{currentOption.label}</div>
              <div className="text-sm text-muted-foreground">{currentOption.description}</div>
            </div>
            <Badge variant="outline" className={currentOption.color}>
              Current
            </Badge>
          </div>
        )}

        {/* Status Options */}
        {canEdit && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Update your status:</h4>
            <div className="grid gap-2">
              {attendanceOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedStatus === option.value
                const isCurrent = currentStatus === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={updating || isLoading}
                    className={`w-full p-3 text-left border rounded-lg transition-all hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      {updating && isSelected && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {isCurrent && !updating && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!canEdit && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            Attendance tracking is not available for this market type.
          </div>
        )}
      </CardContent>
    </Card>
  )
}