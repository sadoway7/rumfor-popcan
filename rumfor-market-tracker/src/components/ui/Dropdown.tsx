import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

export interface DropdownOption {
  label: string
  value: string
  disabled?: boolean
  icon?: React.ReactNode
  separator?: boolean
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  placeholder?: string
  label?: string
  error?: string
  helperText?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal'
  required?: boolean
  onValueChange?: (value: string) => void
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  disabled = false,
  size = 'md',
  variant = 'default',
  required = false,
  onValueChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || '')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    onValueChange?.(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => option.value === selectedValue)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-11 px-4 text-base',
  }

  const baseClasses = cn(
    'flex items-center justify-between w-full rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[size],
    variant === 'minimal' && 'border-transparent bg-transparent',
    error && 'border-destructive focus:ring-destructive'
  )

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          className={baseClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 duration-200">
            {options.map((option, index) => {
              if (option.separator) {
                return <div key={index} className="h-px bg-border my-1" />
              }
              
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-surface/80 focus:bg-surface/80 focus:outline-none',
                    option.value === selectedValue && 'bg-accent/10 text-accent',
                    option.disabled && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  role="option"
                  aria-selected={option.value === selectedValue}
                >
                  <div className="flex items-center">
                    {option.icon && (
                      <span className="mr-2 text-muted-foreground">{option.icon}</span>
                    )}
                    <span>{option.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

Dropdown.displayName = 'Dropdown'

export { Dropdown }