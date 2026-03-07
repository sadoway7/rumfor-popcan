import React from 'react'

export function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    importFn().catch((error) => {
      if (
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('Loading CSS chunk')
      ) {
        console.warn('Chunk load failed, reloading page...', error.message)
        window.location.reload()
        return new Promise(() => {})
      }
      return Promise.reject(error)
    })
  )
}
