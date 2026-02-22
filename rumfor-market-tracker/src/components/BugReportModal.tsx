import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectOption } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { BugReportInput } from '@/types'
import httpClient from '@/lib/httpClient'

interface BugReportModalProps {
  isOpen: boolean
  onClose: () => void
}

const severityOptions: SelectOption[] = [
  { value: 'Low', label: 'Low - Minor issue, workaround available' },
  { value: 'Medium', label: 'Medium - Affects functionality but not critical' },
  { value: 'High', label: 'High - Major feature not working' },
  { value: 'Critical', label: 'Critical - App unusable or data loss' }
]

export const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<BugReportInput>({
    title: '',
    description: '',
    severity: 'Medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BugReportInput, string>>>({})
  const { addToast } = useToast()

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BugReportInput, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await httpClient.post('/bug-reports', formData)
      
      addToast({
        variant: 'success',
        title: 'Bug Report Submitted',
        description: 'Thank you for your feedback. We will investigate this issue.'
      })
      
      setFormData({ title: '', description: '', severity: 'Medium' })
      setErrors({})
      onClose()
    } catch (error: any) {
      addToast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.response?.data?.error || 'Failed to submit bug report. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', description: '', severity: 'Medium' })
    setErrors({})
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report a Bug"
      description="Help us improve by reporting any issues you encounter."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          label="Bug Title"
          placeholder="Brief description of the issue"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          error={errors.title}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe what happened, what you expected to happen, and steps to reproduce the issue..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          error={errors.description}
          rows={5}
          required
        />

        <Select
          label="Severity"
          options={severityOptions}
          value={formData.severity}
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            severity: value as BugReportInput['severity'] 
          }))}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
