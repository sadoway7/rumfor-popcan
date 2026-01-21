import * as Sentry from '@sentry/react'

// Initialize Sentry for error monitoring
export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',

      // Performance monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: import.meta.env.PROD,
          blockAllMedia: import.meta.env.PROD,
        }),
      ],

      // Performance sample rate
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

      // Session replay sample rate
      replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,

      // Error filtering
      beforeSend(event, hint) {
        // Filter out common non-actionable errors
        const error = hint.originalException as Error
        if (error && error instanceof Error) {
          const message = error.message || error.toString()

          // Filter network errors that are expected (like offline)
          if (message.includes('Failed to fetch') && navigator.onLine === false) {
            return null
          }

          // Filter CORS errors from external services
          if (message.includes('CORS') || message.includes('Network Error')) {
            return null
          }

          // Filter ResizeObserver loop errors (common browser issue)
          if (message.includes('ResizeObserver loop limit exceeded')) {
            return null
          }
        }

        return event
      },
    })

    console.log('✅ Sentry error monitoring initialized')
  } else {
    console.log('⚠️  Sentry DSN not configured, error monitoring disabled')
  }
}

// Error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary

// Performance monitoring helper
export const startTransaction = (name: string, op: string) => {
  return Sentry.startSpan({
    name,
    op,
  }, () => {})
}

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setTag(key, context[key])
      })
    }
    Sentry.captureException(error)
  })
}

// User identification for error tracking
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

export const clearUser = () => {
  Sentry.setUser(null)
}

// Performance monitoring for routes
export const trackRouteChange = (route: string) => {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated to ${route}`,
    level: 'info',
  })
}

export default Sentry