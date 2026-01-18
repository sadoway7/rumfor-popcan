// Performance monitoring configuration
export interface PerformanceConfig {
  reportToAnalytics?: boolean
  reportToConsole?: boolean
  enableNavigationTiming?: boolean
  enableResourceTiming?: boolean
  enableLongTasks?: boolean
}

// Default configuration
const defaultConfig: PerformanceConfig = {
  reportToAnalytics: import.meta.env.PROD,
  reportToConsole: import.meta.env.DEV,
  enableNavigationTiming: true,
  enableResourceTiming: true,
  enableLongTasks: true,
}

// Store metrics for analysis
const metricsStore: Record<string, number> = {}
const metricCallbacks: Array<(metric: any) => void> = []

// Initialize performance monitoring
export const initPerformanceMonitoring = (config: Partial<PerformanceConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config }

  // Report function
  const reportMetric = (name: string, value: number, rating: string = 'unknown') => {
    // Store metric
    metricsStore[name] = value

    // Report to console in development
    if (finalConfig.reportToConsole) {
      console.log(`[Performance] ${name}: ${value.toFixed(2)} (${rating})`)
    }

    // Report to analytics in production
    if (finalConfig.reportToAnalytics) {
      reportToAnalytics(name, value, rating)
    }

    // Call registered callbacks
    metricCallbacks.forEach(callback => {
      try {
        callback({ name, value, rating })
      } catch (error) {
        console.error('[Performance] Callback error:', error)
      }
    })
  }

  // Navigation timing monitoring
  if (finalConfig.enableNavigationTiming) {
    observeNavigationTiming(reportMetric)
  }

  // Resource timing monitoring
  if (finalConfig.enableResourceTiming) {
    observeResourceTiming(reportMetric)
  }

  // Long tasks monitoring
  if (finalConfig.enableLongTasks) {
    observeLongTasks(reportMetric)
  }

  console.log('✅ Performance monitoring initialized')
}

// Observe navigation timing
const observeNavigationTiming = (reportMetric: (name: string, value: number, rating?: string) => void) => {
  if ('PerformanceObserver' in window) {
    const navObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming

          const metrics = {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
            dnsLookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcpConnect: navEntry.connectEnd - navEntry.connectStart,
          }

          Object.entries(metrics).forEach(([key, value]) => {
            const rating = getRating(key, value)
            reportMetric(`nav_${key}`, value, rating)
          })
        }
      })
    })

    navObserver.observe({ entryTypes: ['navigation'] })
  }
}

// Observe resource timing
const observeResourceTiming = (reportMetric: (name: string, value: number, rating?: string) => void) => {
  if ('PerformanceObserver' in window) {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming

          // Track slow resources (>1s)
          if (resourceEntry.duration > 1000) {
            const resourceName = resourceEntry.name.split('/').pop() || 'unknown'
            reportMetric(`slow_resource_${resourceName}`, resourceEntry.duration, 'poor')
          }
        }
      })
    })

    resourceObserver.observe({ entryTypes: ['resource'] })
  }
}

// Observe long tasks
const observeLongTasks = (reportMetric: (name: string, value: number, rating?: string) => void) => {
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        reportMetric('long_task', entry.duration, 'poor')
      })
    })

    longTaskObserver.observe({ entryTypes: ['longtask'] })
  }
}

// Add custom metric callback
export const addMetricCallback = (callback: (metric: any) => void) => {
  metricCallbacks.push(callback)
}

// Remove metric callback
export const removeMetricCallback = (callback: (metric: any) => void) => {
  const index = metricCallbacks.indexOf(callback)
  if (index > -1) {
    metricCallbacks.splice(index, 1)
  }
}

// Get stored metrics
export const getMetrics = () => {
  return { ...metricsStore }
}

// Custom performance markers
export const markPerformance = (name: string) => {
  if (performance.mark) {
    performance.mark(name)
  }
}

export const measurePerformance = (name: string, startMark: string, endMark: string) => {
  if (performance.measure) {
    try {
      performance.measure(name, startMark, endMark)

      const measure = performance.getEntriesByName(name)[0]
      if (measure) {
        const duration = measure.duration

        if (defaultConfig.reportToConsole) {
          console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
        }

        if (defaultConfig.reportToAnalytics) {
          reportToAnalytics(`custom_${name}`, duration, getRating('custom', duration))
        }

        return duration
      }
    } catch (error) {
      console.warn('[Performance] Measure failed:', error)
    }
  }
  return null
}

// Bundle size monitoring
export const reportBundleSize = (size: number) => {
  if (defaultConfig.reportToConsole) {
    console.log(`[Performance] Bundle size: ${(size / 1024 / 1024).toFixed(2)}MB`)
  }

  if (defaultConfig.reportToAnalytics) {
    reportToAnalytics('bundle_size', size, getRating('bundle_size', size / 1024 / 1024))
  }
}

// Memory usage monitoring
export const reportMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const usage = memory.usedJSHeapSize / memory.totalJSHeapSize

    if (defaultConfig.reportToConsole) {
      console.log(`[Performance] Memory usage: ${(usage * 100).toFixed(2)}%`)
    }

    if (defaultConfig.reportToAnalytics) {
      reportToAnalytics('memory_usage', usage, usage > 0.8 ? 'poor' : usage > 0.6 ? 'needs-improvement' : 'good')
    }
  }
}

// Helper function to determine rating
const getRating = (key: string, value: number): string => {
  // Navigation timing ratings
  if (key.startsWith('nav_')) {
    if (key === 'nav_totalTime') {
      return value < 2000 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
    }
    if (key === 'nav_domContentLoaded') {
      return value < 1500 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor'
    }
    if (key === 'nav_dnsLookup' || key === 'nav_tcpConnect') {
      return value < 100 ? 'good' : value < 500 ? 'needs-improvement' : 'poor'
    }
  }

  // Bundle size ratings (in MB)
  if (key === 'bundle_size') {
    return value < 1 ? 'good' : value < 2 ? 'needs-improvement' : 'poor'
  }

  // General fallback
  if (value < 1000) return 'good'
  if (value < 3000) return 'needs-improvement'
  return 'poor'
}

// Report to analytics service (placeholder)
const reportToAnalytics = (name: string, value: number, rating: string) => {
  // Implement your analytics reporting here
  // Example: Google Analytics, Mixpanel, etc.
  try {
    // For now, just log to console
    console.log(`[Analytics] ${name}: ${value} (${rating})`)

    // Example for Google Analytics 4:
    // gtag('event', 'web_vitals', {
    //   name,
    //   value: Math.round(value),
    //   event_category: 'Web Vitals',
    //   event_label: rating,
    // })
  } catch (error) {
    console.error('[Performance] Analytics reporting failed:', error)
  }
}