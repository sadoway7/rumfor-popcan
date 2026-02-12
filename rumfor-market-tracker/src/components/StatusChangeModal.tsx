import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatusOption {
  value: string
  label: string
  color: string
}

interface StatusChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: string
  statusOptions: readonly StatusOption[]
  onStatusChange: (status: string) => void
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  statusOptions,
  onStatusChange,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl max-w-sm w-full border-2 border-border bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg text-foreground">Change Status</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-medium",
                currentStatus === option.value
                  ? "bg-accent text-accent-foreground shadow-lg"
                  : "bg-surface hover:bg-surface-2 text-foreground border border-border"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full flex-shrink-0", option.color)} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatusChangeModal
