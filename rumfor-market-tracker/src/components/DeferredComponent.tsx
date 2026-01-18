import { useState, useEffect, ReactNode } from 'react'

interface DeferredComponentProps {
  children: ReactNode
  delay?: number
}

export function DeferredComponent({ children, delay = 0 }: DeferredComponentProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}