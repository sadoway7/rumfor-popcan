import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { EmailTemplate, EmailTemplateVariable } from '@/types'
import { X, Save, Eye, AlertCircle } from 'lucide-react'
import { adminApi } from '@/features/admin/adminApi'

interface EmailTemplateDrawerProps {
  isOpen: boolean
  onClose: () => void
  template: EmailTemplate | null
  onSave: () => void
}

export const EmailTemplateDrawer: React.FC<EmailTemplateDrawerProps> = ({
  isOpen,
  onClose,
  template,
  onSave
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    htmlContent: '',
    textContent: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { addToast } = useToast()

  useEffect(() => {
    if (template) {
      setFormData({
        subject: template.subject || '',
        htmlContent: template.htmlContent || '',
        textContent: template.textContent || ''
      })
      setPreviewHtml(null)
      setErrors({})
    }
  }, [template])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.htmlContent.trim()) {
      newErrors.htmlContent = 'HTML content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!template || !validateForm()) return

    setIsSaving(true)
    try {
      await adminApi.updateEmailTemplate(template.id, formData)
      
      addToast({
        variant: 'success',
        title: 'Template Updated',
        description: 'Email template has been saved successfully.'
      })
      
      onSave()
      onClose()
    } catch (error: any) {
      addToast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.response?.data?.error || 'Failed to update template'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = async () => {
    if (!template) return

    setIsPreviewing(true)
    try {
      const sampleData: Record<string, string> = {}
      template.variables.forEach((v: EmailTemplateVariable) => {
        sampleData[v.name] = v.example || v.name
      })

      const response = await adminApi.previewEmailTemplate(template.id, sampleData)
      
      if (response.success && response.data) {
        setPreviewHtml(response.data.html)
      }
    } catch (error: any) {
      addToast({
        variant: 'destructive',
        title: 'Preview Failed',
        description: 'Could not generate preview'
      })
    } finally {
      setIsPreviewing(false)
    }
  }

  if (!isOpen || !template) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface shadow-xl z-[70] flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{template.name}</h2>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {template.isSystem && (
              <Badge variant="outline">System Template</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Template Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Slug:</span>
              <code className="bg-muted px-2 py-0.5 rounded text-xs">{template.slug}</code>
              <span className="font-medium ml-4">Category:</span>
              <Badge variant="outline">{template.category}</Badge>
            </div>
          </div>

          {/* Variables */}
          {template.variables.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="text-sm font-medium mb-2">Available Variables</h3>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((v: EmailTemplateVariable) => (
                  <div key={v.name} className="flex items-center gap-1 text-xs">
                    <code className="bg-muted px-2 py-0.5 rounded">{`{{${v.name}}}`}</code>
                    {v.required && <span className="text-red-500">*</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use these variables in your template with Handlebars syntax: {`{{variableName}}`}
              </p>
            </div>
          )}

          {/* Subject */}
          <Input
            label="Subject Line"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            error={errors.subject}
          />

          {/* HTML Content */}
          <div>
            <Textarea
              label="HTML Content"
              value={formData.htmlContent}
              onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
              error={errors.htmlContent}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {/* Plain Text Content */}
          <Textarea
            label="Plain Text Content (optional)"
            value={formData.textContent}
            onChange={(e) => setFormData(prev => ({ ...prev, textContent: e.target.value }))}
            rows={6}
            className="font-mono text-sm"
            helperText="Fallback for email clients that don't support HTML"
          />

          {/* Preview */}
          {previewHtml && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 text-sm font-medium">Preview</div>
              <div 
                className="p-4 bg-white max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Changes affect all emails using this template
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isPreviewing}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewing ? 'Loading...' : 'Preview'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
