import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import { X } from 'lucide-react'

export interface SidePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  width?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  position?: 'right' | 'left'
  backdropClassName?: string
  children: React.ReactNode
  hasCustomLayout?: boolean // If true, children handle their own padding and layout
}

const SidePanel: React.FC<SidePanelProps> = ({
  className,
  isOpen,
  onClose,
  title,
  description,
  width = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  position = 'right',
  backdropClassName,
  children,
  hasCustomLayout = false,
  ...props
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descriptionId = React.useId()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when panel is open on mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden'
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeOnEscape, onClose])

  // Focus management
  useEffect(() => {
    if (!isOpen || !panelRef.current) return

    const panelNode = panelRef.current
    const focusable = panelNode.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const first = focusable[0] ?? panelNode
    const last = focusable[focusable.length - 1] ?? panelNode

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (focusable.length === 0) {
        event.preventDefault()
        panelNode.focus()
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    panelNode.addEventListener('keydown', handleKeyDown)
    requestAnimationFrame(() => {
      first.focus()
    })

    return () => {
      panelNode.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const widths: Record<string, string> = {
    sm: 'w-80 max-w-[20rem]',
    md: 'w-96 max-w-[24rem]',
    lg: 'w-[32rem] max-w-[32rem]',
    xl: 'w-[40rem] max-w-[40rem]',
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className={cn("fixed inset-0 z-[200] overflow-y-auto bg-background/80 backdrop-blur-sm", backdropClassName)}
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        className={cn(
          'fixed h-full bg-surface border border-border shadow-xl',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          widths[width],
          position === 'right' ? 'right-0' : 'left-0',
          'animate-in slide-in-from-' + (position === 'right' ? 'full' : 'full') + ' duration-300',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        {...props}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {hasCustomLayout ? (
            children
          ) : (
            <div className="p-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

SidePanel.displayName = 'SidePanel'

export { SidePanel }