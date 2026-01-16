import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface ReportIssueModalProps {
  isOpen: boolean
  onClose: () => void
  marketId: string
  marketName: string
}

const reportCategories = [
  { value: 'inaccurate-info', label: 'Inaccurate Information', icon: '📝' },
  { value: 'contact-issue', label: 'Contact Information Wrong', icon: '📞' },
  { value: 'schedule-wrong', label: 'Schedule/Time Wrong', icon: '🕒' },
  { value: 'location-wrong', label: 'Location Wrong', icon: '📍' },
  { value: 'inappropriate', label: 'Inappropriate Content', icon: '🚫' },
  { value: 'spam', label: 'Spam/Misleading', icon: '🗑️' },
  { value: 'duplicate', label: 'Duplicate Market', icon: '🔄' },
  { value: 'other', label: 'Other', icon: '❓' }
]

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  marketId,
  marketName
}) => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory || !description.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would call an API
      console.log('Reporting issue:', {
        marketId,
        category: selectedCategory,
        description: description.trim()
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setSelectedCategory('')
        setDescription('')
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to submit report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        {submitted ? (
          // Success state
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Report Submitted</h3>
            <p className="text-muted-foreground text-sm">
              Thank you for helping improve our marketplace. We'll review your report shortly.
            </p>
          </div>
        ) : (
          // Report form
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Report Issue</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Reporting issue with: <strong>{marketName}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  What type of issue are you reporting?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {reportCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setSelectedCategory(category.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedCategory === category.value
                          ? 'border-accent bg-accent/5 text-accent-foreground'
                          : 'border-border hover:border-muted-foreground/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Please provide more details (required)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue you're experiencing..."
                  rows={4}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Help us understand the problem so we can fix it quickly.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!selectedCategory || !description.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                We take all reports seriously and review them promptly.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}