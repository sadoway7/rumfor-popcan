import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface BottomNavOverride {
  primaryButtonColor?: string
  onPrimaryClick?: () => void
  primaryButtonLabel?: string
}

interface BottomNavContextType {
  override: BottomNavOverride | null
  setOverride: (override: BottomNavOverride | null) => void
}

const BottomNavContext = createContext<BottomNavContextType | null>(null)

export function BottomNavProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<BottomNavOverride | null>(null)

  return (
    <BottomNavContext.Provider value={{ override, setOverride }}>
      {children}
    </BottomNavContext.Provider>
  )
}

export function useBottomNavOverride() {
  const context = useContext(BottomNavContext)
  if (!context) {
    return { override: null, setOverride: () => {} }
  }
  return context
}
