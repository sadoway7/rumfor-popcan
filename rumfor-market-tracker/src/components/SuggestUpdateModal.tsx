import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import httpClient from '@/lib/httpClient'

interface SuggestUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  marketId: string
  marketName: string
}

export const SuggestUpdateModal: React.FC<SuggestUpdateModalProps> = ({
  isOpen,
  onClose,
  marketId,
  marketName
}) => {
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!description.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const reportData = {
        title: `[Market Update] ${marketName}`,
        description: `${description.trim()}\n\nMarket: ${marketName}\nMarket ID: ${marketId}`,
        severity: 'Low' as const
      }

      await httpClient.post('/bug-reports', reportData)

      addToast({
        variant: 'success',
        title: 'Update Suggestion Submitted',
        description: 'Thank you for helping keep this market information up to date.'
      })

      setDescription('')
      onClose()
    } catch (error: any) {
      addToast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.response?.data?.error || 'Failed to submit suggestion. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4">
      <div className="bg-background rounded-t-xl sm:rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-background flex items-center justify-between">
          <h3 className="font-semibold">Suggest an Update</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Suggesting update for</p>
            <p className="text-sm font-medium text-foreground">{marketName}</p>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Help keep this market information up to date. Report any changes, updates, or corrections needed.
          </p>

          <textarea
            className="w-full p-3 text-sm bg-surface rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px] resize-none"
            placeholder="Describe what needs to be updated..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="p-4 border-t sticky bottom-0 bg-background">
          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!description.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
