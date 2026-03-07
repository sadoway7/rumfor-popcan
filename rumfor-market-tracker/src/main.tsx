import ReactDOM from 'react-dom/client'
import { BrowserRouter, ScrollRestoration } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastProvider } from './components/ui/Toast'
import { BottomNavProvider } from './contexts/BottomNavContext'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { initSentry } from './utils/sentry'
import { initPerformanceMonitoring } from './utils/performance'
import './styles/globals.css'
import 'uno.css'

// Global handler for chunk load failures (stale builds after deployment)
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('Failed to fetch dynamically imported module') ||
    event.message?.includes('Loading chunk') ||
    event.message?.includes('Loading CSS chunk')
  ) {
    console.warn('Chunk load failed, reloading page to fetch fresh assets...')
    window.location.reload()
    return true
  }
  return false
})

// Also handle unhandled promise rejections from dynamic imports
window.addEventListener('unhandledrejection', (event) => {
  const message = (event.reason as Error)?.message || ''
  if (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Loading chunk') ||
    message.includes('Loading CSS chunk')
  ) {
    console.warn('Chunk load promise rejected, reloading page...')
    window.location.reload()
    event.preventDefault()
  }
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Enable React Router v7 future flags to suppress warnings

// Initialize monitoring
initSentry()
initPerformanceMonitoring()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BottomNavProvider>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </BottomNavProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>,
)