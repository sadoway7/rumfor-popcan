import React, { useState } from 'react'
import { cn } from '@/utils/cn'

export interface AccordionItem {
  key: string
  title: string
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
}

export interface AccordionProps {
  items: AccordionItem[]
  type?: 'single' | 'multiple'
  defaultOpenKeys?: string[]
  openKeys?: string[]
  onOpenChange?: (openKeys: string[]) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered'
  allowToggle?: boolean
  className?: string
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  defaultOpenKeys = [],
  openKeys,
  onOpenChange,
  size = 'md',
  variant = 'default',
  className
}) => {
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(defaultOpenKeys)
  const currentOpenKeys = openKeys !== undefined ? openKeys : internalOpenKeys

  const handleToggle = (key: string) => {
    let newOpenKeys: string[]
    
    if (type === 'single') {
      newOpenKeys = currentOpenKeys.includes(key) 
        ? [] 
        : [key]
    } else {
      newOpenKeys = currentOpenKeys.includes(key)
        ? currentOpenKeys.filter(k => k !== key)
        : [...currentOpenKeys, key]
    }
    
    if (openKeys === undefined) {
      setInternalOpenKeys(newOpenKeys)
    }
    onOpenChange?.(newOpenKeys)
  }

  const isOpen = (key: string) => currentOpenKeys.includes(key)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  }

  const headerPaddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }

  const contentPaddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      {items.map((item) => (
        <div
          key={item.key}
          className={cn(
            'border border-border rounded-lg overflow-hidden',
            variant === 'bordered' && 'bg-surface'
          )}
        >
          <button
            type="button"
            className={cn(
              'w-full flex items-center justify-between text-left font-medium transition-colors hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              headerPaddingClasses[size],
              isOpen(item.key) && 'bg-surface/30'
            )}
            onClick={() => handleToggle(item.key)}
            disabled={item.disabled}
            aria-expanded={isOpen(item.key)}
            aria-controls={`accordion-content-${item.key}`}
            id={`accordion-header-${item.key}`}
          >
            <div className="flex items-center">
              {item.icon && (
                <span className="mr-3 text-muted-foreground">{item.icon}</span>
              )}
              <span className="text-foreground">{item.title}</span>
            </div>
            <svg
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isOpen(item.key) && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div
            id={`accordion-content-${item.key}`}
            role="region"
            aria-labelledby={`accordion-header-${item.key}`}
            className={cn(
              'overflow-hidden transition-all duration-200 ease-in-out',
              isOpen(item.key) 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0'
            )}
          >
            <div className={cn(
              'border-t border-border text-muted-foreground',
              contentPaddingClasses[size]
            )}>
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

Accordion.displayName = 'Accordion'

export { Accordion }