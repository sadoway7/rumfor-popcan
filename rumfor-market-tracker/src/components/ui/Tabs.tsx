import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  variant?: 'default' | 'underline' | 'pills' | 'glow-pills'
  className?: string
  fullWidth?: boolean
  listClassName?: string
  contentClassName?: string
  inactiveTextColor?: string
  hideIconsOnMobile?: boolean
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  size = 'md',
  variant = 'default',
  className,
  fullWidth = false,
  listClassName,
  contentClassName,
  inactiveTextColor,
  hideIconsOnMobile = false
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(defaultActiveKey || items[0]?.key)
  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey
  
  const pillRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const trayRef = useRef<HTMLDivElement>(null)
  const [pillReady, setPillReady] = useState(false)

  const movePill = useCallback((key: string, animate: boolean) => {
    const tray = trayRef.current
    const tab = tabRefs.current[key]
    const pill = pillRef.current
    if (!tray || !tab || !pill) return

    const trayRect = tray.getBoundingClientRect()
    const tabRect = tab.getBoundingClientRect()

    pill.style.transition = animate
      ? 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none'

    pill.style.left = `${tabRect.left - trayRect.left}px`
    pill.style.width = `${tabRect.width}px`
  }, [])

  useEffect(() => {
    movePill(currentActiveKey, false)
    requestAnimationFrame(() => setPillReady(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleResize = () => movePill(currentActiveKey, false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentActiveKey, movePill])

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return

    if (variant === 'glow-pills') {
      movePill(key, true)
    }
    
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
    sm: 'px-4 py-3 min-h-[44px]',
    md: 'px-5 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[48px]',
  }

  const tabBaseClasses = 'inline-flex items-center justify-center font-medium disabled:pointer-events-none disabled:opacity-50 outline-none'

  const variants = {
    default: `border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground data-[state=active]:border-accent data-[state=active]:text-foreground ${inactiveTextColor || 'text-muted-foreground'}`,
    underline: `border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/50 data-[state=active]:border-accent data-[state=active]:text-foreground ${inactiveTextColor || 'text-muted-foreground'}`,
    pills: `px-4 py-2 rounded-full font-medium data-[state=active]:bg-accent data-[state=active]:text-white ${inactiveTextColor || 'text-muted-foreground'}`,
    'glow-pills': '',
  }

  if (variant === 'glow-pills') {
    return (
      <div className={cn('w-full', className)}>
        <div className={cn('bg-black rounded-b-3xl py-3', listClassName)}>
          <div 
            ref={trayRef}
            className="relative flex rounded-full p-1"
            role="tablist"
          >
            <div 
              ref={pillRef}
              className="absolute top-1 h-[calc(100%-8px)] rounded-full pointer-events-none z-0"
              style={{
                background: 'hsl(var(--accent))',
                opacity: pillReady ? 1 : 0,
                boxShadow: '0 0 20px hsl(var(--accent) / 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            />
            {items.map((item) => {
              const isActive = currentActiveKey === item.key
              return (
                <button
                  key={item.key}
                  ref={el => { tabRefs.current[item.key] = el }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${item.key}`}
                  tabIndex={isActive ? 0 : -1}
                  className={cn(
                    'relative z-[1] flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-base font-medium cursor-pointer select-none whitespace-nowrap transition-colors duration-200',
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-gray-200',
                    item.disabled && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => handleTabClick(item.key, item.disabled)}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <span className={cn("", hideIconsOnMobile && "hidden sm:inline-flex")}>{item.icon}</span>
                  )}
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
        
        <div className={cn("", contentClassName)}>
          {items.map((item) => (
            <div
              key={item.key}
              role="tabpanel"
              id={`tabpanel-${item.key}`}
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

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex gap-2',
          variant !== 'pills' && 'border-b border-border',
          listClassName
        )}
        style={variant === 'pills' ? { justifyContent: 'space-around' } : undefined}
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
              variant === 'pills' ? '' : tabPaddingClasses[size],
              sizeClasses[size],
              variants[variant],
              (fullWidth || variant === 'pills') && 'flex-1',
              item.disabled && 'cursor-not-allowed'
            )}
            onClick={() => handleTabClick(item.key, item.disabled)}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className={cn("mr-2", hideIconsOnMobile && "hidden sm:inline-flex")}>{item.icon}</span>
            )}
            {item.label}
          </button>
        ))}
      </div>
      
      <div className={cn("py-4", contentClassName)}>
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
