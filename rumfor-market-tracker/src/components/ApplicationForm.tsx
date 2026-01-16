import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Progress } from '@/components/ui/Progress'
import { Market, CustomField, Application } from '@/types'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react'

interface ApplicationFormProps {
  market: Market
  existingApplication?: Application
  onSuccess?: (application: Application) => void
  onCancel?: () => void
  className?: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  file: File
}

// Default form schema
const defaultFormSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessDescription: z.string().min(50, 'Description must be at least 50 characters'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required'),
  website: z.string().optional(),
  experience: z.string().min(1, 'Experience level is required'),
  certifications: z.array(z.string()).optional(),
})

interface FormData {
  businessName: string
  businessDescription: string
  contactEmail: string
  contactPhone: string
  website?: string
  experience: string
  certifications?: string[]
  [key: string]: any
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  market,
  existingApplication,
  onSuccess,
  onCancel,
  className
}) => {
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimeoutRef = useRef<number | null>(null)
  const isInitialLoad = useRef(true)

  const { user } = useAuthStore()
  const { createApplication, updateApplication, submitApplication, isSubmitting } = useVendorApplications()

  const customFieldNames = useMemo(() => {
    return (market.applicationFields || [])
      .map(field => field.name)
      .filter(name => !['businessName', 'businessDescription', 'experience', 'contactEmail', 'contactPhone', 'website'].includes(name))
  }, [market.applicationFields])

  const steps = useMemo(() => ([
    {
      id: 'business',
      label: 'Business Info',
      description: 'Tell us about your business and experience.',
      fields: ['businessName', 'businessDescription', 'experience']
    },
    {
      id: 'contact',
      label: 'Contact Details',
      description: 'Provide the best way to reach you.',
      fields: ['contactEmail', 'contactPhone', 'website']
    },
    {
      id: 'additional',
      label: 'Additional Details',
      description: 'Share supporting details and documents.',
      fields: ['certifications', ...customFieldNames]
    }
  ]), [customFieldNames])

  // Create dynamic schema based on market's custom fields
  const createDynamicSchema = (): z.ZodSchema<FormData> => {
    let schema = defaultFormSchema

    // Add custom fields validation
    market.applicationFields?.forEach(field => {
      let fieldSchema: z.ZodTypeAny = z.string()
      
      switch (field.type) {
        case 'textarea':
          fieldSchema = z.string()
          if (field.validation?.minLength) {
            fieldSchema = (fieldSchema as z.ZodString).min(field.validation.minLength, `${field.name} must be at least ${field.validation.minLength} characters`)
          }
          if (field.validation?.maxLength) {
            fieldSchema = (fieldSchema as z.ZodString).max(field.validation.maxLength, `${field.name} must be less than ${field.validation.maxLength} characters`)
          }
          break
        case 'select':
          if (field.options && field.options.length > 0) {
            fieldSchema = z.enum(field.options as [string, ...string[]])
          }
          break
        case 'checkbox':
          fieldSchema = z.array(z.string())
          if (field.required) {
            fieldSchema = (fieldSchema as z.ZodArray<z.ZodString>).min(1, `${field.name} is required`)
          }
          break
        case 'radio':
          if (field.options && field.options.length > 0) {
            fieldSchema = z.enum(field.options as [string, ...string[]])
          }
          break
        case 'file':
          // File validation would be handled separately
          fieldSchema = z.any()
          break
      }

      if (field.required && field.type !== 'checkbox') {
        fieldSchema = fieldSchema.refine(val => val !== undefined && val !== '', `${field.name} is required`)
      }

      // Create a new schema with the extended fields
      schema = schema.extend({ [field.name]: fieldSchema }) as any
    })

    return schema
  }

  const schema = createDynamicSchema()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const watchedValues = watch()
  const storageKey = useMemo(() => {
    const userId = user?.id || 'guest'
    return `application-draft-${market.id}-${userId}`
  }, [market.id, user?.id])

  // Initialize form with existing data or defaults
  useEffect(() => {
    if (existingApplication) {
      // Populate form with existing application data
      const data = existingApplication.submittedData || {}
      setCustomFieldValues(existingApplication.customFields || {})

      Object.keys(data).forEach(key => {
        setValue(key as string, data[key])
      })

      if (existingApplication.customFields) {
        Object.keys(existingApplication.customFields).forEach(key => {
          setCustomFieldValues(prev => ({
            ...prev,
            [key]: existingApplication.customFields![key]
          }))
        })
      }

      if (existingApplication.updatedAt) {
        setLastSavedAt(existingApplication.updatedAt)
      }
    } else {
      setValue('contactEmail', user?.email || '')
      setValue('contactPhone', '')
      setValue('website', '')
      setValue('certifications', [])
    }
  }, [existingApplication, setValue, user?.email])

  useEffect(() => {
    if (existingApplication) return

    try {
      const storedDraft = localStorage.getItem(storageKey)
      if (!storedDraft) return

      const parsedDraft = JSON.parse(storedDraft) as {
        submittedData?: Record<string, any>
        customFields?: Record<string, any>
        savedAt?: string
      }

      if (parsedDraft.submittedData) {
        Object.entries(parsedDraft.submittedData).forEach(([key, value]) => {
          setValue(key as string, value)
        })
      }

      if (parsedDraft.customFields) {
        setCustomFieldValues(parsedDraft.customFields)
      }

      if (parsedDraft.savedAt) {
        setLastSavedAt(parsedDraft.savedAt)
      }
    } catch (error) {
      console.warn('Failed to load saved draft', error)
    }
  }, [existingApplication, setValue, storageKey])

  useEffect(() => {
    if (existingApplication) return
    if (!isDirty) return

    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current)
    }

    setIsAutoSaving(true)
    setAutoSaveError(null)

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString()
        const draftPayload = {
          submittedData: {
            ...watchedValues,
            ...customFieldValues
          },
          customFields: customFieldValues,
          savedAt
        }
        localStorage.setItem(storageKey, JSON.stringify(draftPayload))
        setLastSavedAt(savedAt)
      } catch (error) {
        setAutoSaveError('Auto-save failed. Please use Save Draft.')
      } finally {
        setIsAutoSaving(false)
      }
    }, 900)

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [customFieldValues, existingApplication, isDirty, storageKey, watchedValues])

  // Handle custom field changes
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  // File upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const newFiles: UploadedFile[] = []
    const errors: string[] = []

    files.forEach(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 10MB`)
        return
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`)
        return
      }

      // Create uploaded file object
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file
      }

      newFiles.push(uploadedFile)
    })

    if (errors.length > 0) {
      setUploadErrors(errors)
    } else {
      setUploadErrors([])
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Render custom field
  const renderCustomField = (field: CustomField) => {
    const value = customFieldValues[field.name] || ''
    const error = (errors as any)[field.name]?.message

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <Input
              {...register(field.name)}
              value={value}
              onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <Textarea
              {...register(field.name)}
              value={value}
              onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              rows={4}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <Select
              value={value}
              onValueChange={(val) => handleCustomFieldChange(field.name, val)}
              className={error ? 'border-destructive' : ''}
              options={[
                { value: '', label: `Select ${field.name.toLowerCase()}` },
                ...field.options?.map(option => ({ value: option, label: option })) || []
              ]}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )

      case 'checkbox': {
        const checkboxValues = Array.isArray(value) ? value : []
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <Checkbox
                  key={option}
                  checked={checkboxValues.includes(option)}
                  onValueChange={(checked: boolean) => {
                    const currentValues = checkboxValues
                    if (checked) {
                      handleCustomFieldChange(field.name, [...currentValues, option])
                    } else {
                      handleCustomFieldChange(field.name, currentValues.filter(v => v !== option))
                    }
                  }}
                  label={option}
                />
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )
      }

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.name}-${option}`}
                    name={field.name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                    className="h-4 w-4 text-accent"
                  />
                  <label htmlFor={`${field.name}-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  or drag and drop files here
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            
            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {uploadErrors.length > 0 && (
              <div className="space-y-1">
                {uploadErrors.map((error, index) => (
                  <p key={index} className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {error}
                  </p>
                ))}
              </div>
            )}
            
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const saveApplication = async (data: FormData, draft: boolean) => {
    try {
      const applicationData = {
        marketId: market.id,
        market,
        submittedData: {
          ...data,
          ...customFieldValues
        },
        customFields: customFieldValues,
        status: draft ? 'draft' as const : 'submitted' as const,
      }

      let result: Application | null = null

      if (existingApplication) {
        // Update existing application
        const success = await updateApplication(existingApplication.id, applicationData)
        if (success && onSuccess) {
          // If updating draft, might need to submit
          if (!draft && existingApplication.status === 'draft') {
            await submitApplication(existingApplication.id)
          }
          if (!draft) {
            localStorage.removeItem(storageKey)
          }
          onSuccess(existingApplication)
        }
      } else {
        // Create new application
        result = await createApplication(applicationData)
        if (result && onSuccess) {
          if (!draft) {
            await submitApplication(result.id)
            localStorage.removeItem(storageKey)
          }
          onSuccess(result)
        }
      }
      if (draft) {
        const savedAt = new Date().toISOString()
        setLastSavedAt(savedAt)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    await saveApplication(data, false)
  }

  const handleSaveDraft = async () => {
    const data = getValues()
    await saveApplication(data, true)
  }

  const handleSubmitForm = () => {
    handleSubmit(onSubmit)()
  }

  const handleNextStep = async () => {
    const fields = (steps[currentStep]?.fields || []) as string[]
    const isStepValid = await trigger(fields)
    if (!isStepValid) return
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const progressValue = Math.round(((currentStep + 1) / steps.length) * 100)

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <Card className="p-6">
        <div className="mb-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Apply to {market.name}</h2>
            <p className="text-muted-foreground">
              Complete the application form below. Fields marked with * are required.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium">
                Step {currentStep + 1} of {steps.length} · {steps[currentStep]?.label}
              </span>
              <span className="text-xs text-muted-foreground">{progressValue}% complete</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-xs text-muted-foreground">{steps[currentStep]?.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {isAutoSaving && <span>Saving draft...</span>}
              {!isAutoSaving && lastSavedAt && (
                <span>Last saved {new Date(lastSavedAt).toLocaleTimeString()}</span>
              )}
              {autoSaveError && <span className="text-destructive">{autoSaveError}</span>}
            </div>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Please review the highlighted fields:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-destructive">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error?.message as string}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Business Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...register('businessName')}
                    placeholder="Enter your business name"
                    className={errors.businessName ? 'border-destructive' : ''}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive">{errors.businessName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Experience Level <span className="text-destructive">*</span>
                  </label>
                  <Select
                    {...register('experience')}
                    className={errors.experience ? 'border-destructive' : ''}
                    options={[
                      { value: '', label: 'Select experience level' },
                      { value: '1-2 years', label: '1-2 years' },
                      { value: '3-5 years', label: '3-5 years' },
                      { value: '5-10 years', label: '5-10 years' },
                      { value: '10+ years', label: '10+ years' },
                    ]}
                  />
                  {errors.experience && (
                    <p className="text-sm text-destructive">{errors.experience.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Business Description <span className="text-destructive">*</span>
                </label>
                <Textarea
                  {...register('businessDescription')}
                  placeholder="Describe your business, products, and services"
                  rows={4}
                  className={errors.businessDescription ? 'border-destructive' : ''}
                />
                {errors.businessDescription && (
                  <p className="text-sm text-destructive">{errors.businessDescription.message}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...register('contactEmail')}
                    type="email"
                    placeholder="your@email.com"
                    className={errors.contactEmail ? 'border-destructive' : ''}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Phone <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...register('contactPhone')}
                    type="tel"
                    placeholder="(555) 123-4567"
                    className={errors.contactPhone ? 'border-destructive' : ''}
                  />
                  {errors.contactPhone && (
                    <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  {...register('website')}
                  type="url"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <>
              {market.applicationFields && market.applicationFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <div className="space-y-4">
                    {market.applicationFields.map(renderCustomField)}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Certifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Organic Certified', 'FDA Approved', 'Local Producer', 'Vegan', 'Gluten-Free', 'Fair Trade'].map(cert => (
                    <Checkbox
                      key={cert}
                      checked={watch('certifications')?.includes(cert) || false}
                      onValueChange={(checked: boolean) => {
                        const current = watch('certifications') || []
                        if (checked) {
                          setValue('certifications', [...current, cert])
                        } else {
                          setValue('certifications', current.filter(c => c !== cert))
                        }
                      }}
                      label={cert}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 pt-6 border-t sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  'Save Draft'
                )}
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmitForm}
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : null}
                  Submit Application
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
