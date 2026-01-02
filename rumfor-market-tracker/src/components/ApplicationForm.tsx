import React, { useState, useEffect } from 'react'
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
import { Market, CustomField, Application } from '@/types'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { cn } from '@/utils/cn'

interface ApplicationFormProps {
  market: Market
  existingApplication?: Application
  onSuccess?: (application: Application) => void
  onCancel?: () => void
  className?: string
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
  const [isDraft, setIsDraft] = useState(false)
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  
  const { createApplication, updateApplication, submitApplication, isSubmitting } = useVendorApplications()

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
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  // Initialize form with existing data or defaults
  useEffect(() => {
    if (existingApplication) {
      // Populate form with existing application data
      const data = existingApplication.submittedData || {}
      setCustomFieldValues(existingApplication.customFields || {})
      
      // Set form values
      Object.keys(data).forEach(key => {
        setValue(key as string, data[key])
      })
      
      // Set custom field values
      if (existingApplication.customFields) {
        Object.keys(existingApplication.customFields).forEach(key => {
          setCustomFieldValues(prev => ({
            ...prev,
            [key]: existingApplication.customFields![key]
          }))
        })
      }
    } else {
      // Set default values
      setValue('contactEmail', '')
      setValue('contactPhone', '')
      setValue('website', '')
      setValue('certifications', [])
    }
  }, [existingApplication, setValue])

  // Handle custom field changes
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
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

      case 'checkbox':
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
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleCustomFieldChange(field.name, file.name)
                }
              }}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const applicationData = {
        marketId: market.id,
        market,
        submittedData: {
          ...data,
          ...customFieldValues
        },
        customFields: customFieldValues,
        status: isDraft ? 'draft' as const : 'submitted' as const,
      }

      let result: Application | null = null

      if (existingApplication) {
        // Update existing application
        const success = await updateApplication(existingApplication.id, applicationData)
        if (success && onSuccess) {
          // If updating draft, might need to submit
          if (!isDraft && existingApplication.status === 'draft') {
            await submitApplication(existingApplication.id)
          }
          onSuccess(existingApplication)
        }
      } else {
        // Create new application
        result = await createApplication(applicationData)
        if (result && onSuccess) {
          if (!isDraft) {
            await submitApplication(result.id)
          }
          onSuccess(result)
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    }
  }

  const handleSaveDraft = () => {
    setIsDraft(true)
    handleSubmit(onSubmit)()
  }

  const handleSubmitForm = () => {
    setIsDraft(false)
    handleSubmit(onSubmit)()
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Apply to {market.name}</h2>
          <p className="text-muted-foreground">
            Complete the application form below. Fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
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

          {/* Contact Information */}
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

          {/* Custom Fields */}
          {market.applicationFields && market.applicationFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="space-y-4">
                {market.applicationFields.map(renderCustomField)}
              </div>
            </div>
          )}

          {/* Certifications */}
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

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <div className="space-x-2">
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
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}