import React, { useState } from 'react'
import { cn } from '@/utils/cn'

export interface TabItem {
  key: string
  label: string
  disabled?: boolean
  content: React.ReactNode
  icon?: React.ReactNode
}

export interface TabsProps {
  items: TabItem[]
  defaultActiveKey?: string
  activeKey?: string
  onChange?: (activeKey: string) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'underline' | 'pills'
  className?: string
  fullWidth?: boolean
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  size = 'md',
  variant = 'default',
  className,
  fullWidth = false
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(defaultActiveKey || items[0]?.key)
  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return
    
    if (activeKey === undefined) {
      setInternalActiveKey(key)
    }
    onChange?.(key)
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  }

  const tabPaddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  }

  const tabBaseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    default: 'border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground data-[state=active]:border-accent data-[state=active]:text-foreground',
    underline: 'border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 data-[state=active]:border-accent data-[state=active]:text-foreground',
    pills: 'rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground',
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex border-b border-border',
          fullWidth && 'w-full'
        )}
        role="tablist"
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={currentActiveKey === item.key}
            aria-controls={`tabpanel-${item.key}`}
            tabIndex={currentActiveKey === item.key ? 0 : -1}
            data-state={currentActiveKey === item.key ? 'active' : 'inactive'}
            className={cn(
              tabBaseClasses,
              tabPaddingClasses[size],
              sizeClasses[size],
              variants[variant],
              fullWidth && 'flex-1',
              item.disabled && 'cursor-not-allowed'
            )}
            onClick={() => handleTabClick(item.key, item.disabled)}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className="mr-2">{item.icon}</span>
            )}
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="py-4">
        {items.map((item) => (
          <div
            key={item.key}
            role="tabpanel"
            id={`tabpanel-${item.key}`}
            aria-labelledby={`tab-${item.key}`}
            hidden={currentActiveKey !== item.key}
            className={cn(
              'focus:outline-none',
              currentActiveKey === item.key && 'animate-in fade-in-0 duration-200'
            )}
          >
            {currentActiveKey === item.key && item.content}
          </div>
        ))}
      </div>
    </div>
  )
}

Tabs.displayName = 'Tabs'

export { Tabs }