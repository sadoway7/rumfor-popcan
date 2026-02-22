import React, { useState } from 'react'
import { X, BookmarkMinus, AlertTriangle } from 'lucide-react'
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
  onUntrack?: () => Promise<void>
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  statusOptions,
  onStatusChange,
  onUntrack,
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isUntracking, setIsUntracking] = useState(false)

  if (!isOpen) return null

  const handleUntrackClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmUntrack = async () => {
    if (!onUntrack) return
    setIsUntracking(true)
    try {
      await onUntrack()
      onClose()
    } catch (error) {
      console.error('Failed to untrack:', error)
    } finally {
      setIsUntracking(false)
      setShowConfirm(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl max-w-sm w-full border-2 border-border bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        {!showConfirm ? (
          <>
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
              {onUntrack && (
                <>
                  <div className="pt-2 border-t border-border mt-2" />
                  <button
                    onClick={handleUntrackClick}
                    className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-medium bg-surface hover:bg-red-50 text-red-600 border border-border hover:border-red-200"
                  >
                    <BookmarkMinus className="w-4 h-4 flex-shrink-0" />
                    <span>Untrack Market</span>
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Untrack Market?</h3>
                <p className="text-sm text-muted-foreground">This will remove it from your list.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-surface hover:bg-surface-2 text-foreground font-medium border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUntrack}
                disabled={isUntracking}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
              >
                {isUntracking ? 'Removing...' : 'Untrack'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusChangeModal
