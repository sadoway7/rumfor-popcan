import React, { useState, useEffect, createContext, useContext } from 'react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  duration?: number
  action?: React.ReactNode
  onClose?: (id: string) => void
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export interface ToastProps extends Toast {
  onRemove?: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
  onRemove
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove?.(id)
    }, 200)
  }

  const variants = {
    default: 'bg-surface border-border text-foreground',
    success: 'bg-success/10 border-success/30 text-foreground',
    warning: 'bg-warning/10 border-warning/30 text-foreground',
    destructive: 'bg-destructive/10 border-destructive/30 text-foreground',
    info: 'bg-accent/10 border-accent/30 text-foreground',
  }

  const icons = {
    default: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    destructive: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div
      className={cn(
        'flex items-start p-4 rounded-lg border shadow-lg transition-all duration-200 ease-in-out',
        variants[variant],
        isVisible && !isLeaving && 'animate-in fade-in-0 slide-in-from-right-full',
        isLeaving && 'animate-in fade-out-0 slide-out-to-right-full'
      )}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[variant]}
      </div>
      
      <div className="ml-3 flex-1">
        {title && (
          <p className="text-sm font-medium">{title}</p>
        )}
        {description && (
          <p className={cn('text-sm', title ? 'mt-1' : '')}>
            {description}
          </p>
        )}
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="ml-4 h-6 w-6 p-0"
        aria-label="Close toast"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </Button>
    </div>
  )
}

Toast.displayName = 'Toast'

// Toast Provider for managing toasts globally
export interface ToastProviderProps {
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}

const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
    }
    
    setToasts(prev => {
      const updated = [...prev, newToast]
      return updated.slice(-maxToasts) // Keep only the latest maxToasts
    })
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  }

  return (
    <ToastContext.Provider value={contextValue}>
      <div className="toast-provider">
        {children}
        
        <div
          className={cn(
            'fixed z-50 flex flex-col space-y-2 w-96 max-w-sm',
            positionClasses[position]
          )}
          aria-live="polite"
          aria-label="Notifications"
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onRemove={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

ToastProvider.displayName = 'ToastProvider'

export { Toast, ToastProvider }