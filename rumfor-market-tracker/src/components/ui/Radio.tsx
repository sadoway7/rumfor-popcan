import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string
  description?: string
  error?: string
  options: RadioOption[]
  onValueChange?: (value: string) => void
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      label,
      description,
      error,
      options,
      onValueChange,
      onChange,
      name,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const radioGroupId = id || `radio-group-${Math.random().toString(36).substr(2, 9)}`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.target.value)
      onChange?.(e)
    }

    return (
      <div className="space-y-3">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="space-y-3">
          {options.map((option, index) => {
            const optionId = `${radioGroupId}-${index}`
            return (
              <div key={option.value} className="flex items-start space-x-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    ref={ref}
                    id={optionId}
                    name={name || radioGroupId}
                    value={option.value}
                    className={cn(
                      'h-4 w-4 border border-border text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
                      className
                    )}
                    onChange={handleChange}
                    disabled={disabled || option.disabled}
                    {...props}
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={optionId}
                    className={cn(
                      'text-sm font-medium text-foreground cursor-pointer',
                      (disabled || option.disabled) && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

export { Radio }