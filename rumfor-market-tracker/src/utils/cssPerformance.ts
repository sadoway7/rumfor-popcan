/**
 * CSS Performance Monitoring Utilities
 * Provides tools for monitoring CSS performance and Core Web Vitals
 */

interface PerformanceMetrics {
  cssBundleSize?: number
  styleRecalculations?: number
  layoutShifts?: LayoutShift[]
  paintTime?: number
  loadTime?: number
  unusedCSS?: number
}

interface LayoutShift {
  value: number
  timestamp: number
  element?: string
}

class CSSPerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private layoutShifts: LayoutShift[] = []
  private observer: PerformanceObserver | null = null
  private clsObserver: PerformanceObserver | null = null

  constructor() {
    this.initializeObservers()
    this.collectBundleMetrics()
  }

  /**
   * Initialize Performance Observers for CSS metrics
   */
  private initializeObservers() {
    // Monitor Style Recalculations
    try {
      if ('PerformanceObserver' in window) {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              console.log(`Style recalculation: ${entry.duration}ms`)
              this.metrics.styleRecalculations = (this.metrics.styleRecalculations || 0) + 1
            }
          }
        })
        this.observer.observe({ entryTypes: ['measure'] })
      }
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error)
    }

    // Monitor Cumulative Layout Shift (CLS)
    try {
      if ('PerformanceObserver' in window) {
        this.clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              const layoutShift = {
                value: (entry as any).value,
                timestamp: entry.startTime,
                element: this.getSelectorFromEntry(entry)
              }
              this.layoutShifts.push(layoutShift)
              console.log(`Layout shift detected: ${layoutShift.value}`, layoutShift)
            }
          }
        })
        this.clsObserver.observe({ entryTypes: ['layout-shift'] })
      }
    } catch (error) {
      console.warn('CLS observer not supported:', error)
    }
  }

  /**
   * Collect CSS bundle size and loading metrics
   */
  private collectBundleMetrics() {
    // Wait for page load to collect metrics
    if (document.readyState === 'loading') {
      window.addEventListener('load', () => this.collectBundleMetrics())
      return
    }

    // Find CSS resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const cssResources = resources.filter(entry =>
      entry.name.includes('.css') || entry.initiatorType === 'link'
    )

    for (const resource of cssResources) {
      if (resource.transferSize) {
        this.metrics.cssBundleSize = (this.metrics.cssBundleSize || 0) + resource.transferSize
      }
      if (resource.responseEnd) {
        this.metrics.loadTime = Math.max(this.metrics.loadTime || 0, resource.responseEnd)
      }
    }

    // Measure paint time (First Contentful Paint)
    const paintEntries = performance.getEntriesByType('paint')
    for (const entry of paintEntries) {
      if (entry.name === 'first-contentful-paint') {
        this.metrics.paintTime = entry.startTime
      }
    }
  }

  /**
   * Get CSS selector from performance entry
   */
  private getSelectorFromEntry(entry: PerformanceEntry): string | undefined {
    try {
      // Try to get the element that shifted
      const elements = document.elementsFromPoint(
        (entry as any).x || 0,
        (entry as any).y || 0
      )
      if (elements.length > 0) {
        const element = elements[0] as HTMLElement
        return element.tagName.toLowerCase() +
               (element.id ? `#${element.id}` : '') +
               (element.className ? `.${element.className.split(' ')[0]}` : '')
      }
    } catch (error) {
      console.warn('Could not get selector from entry:', error)
    }
    return undefined
  }

  /**
   * Measure style recalculation performance
   */
  measureStyleRecalculation(callback: () => void): number {
    const startTime = performance.now()
    callback()
    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(`Style recalculation took ${duration}ms`)
    return duration
  }

  /**
   * Detect unused CSS rules (simplified detection)
   */
  detectUnusedCSS(): Promise<string[]> {
    return new Promise((resolve) => {
      const unusedSelectors: string[] = []

      // Get all stylesheet rules
      const styleSheets = Array.from(document.styleSheets)

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || [])

          for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText
              if (selector && selector !== '*' && !document.querySelector(selector)) {
                unusedSelectors.push(selector)
              }
            }
          }
        } catch (error) {
          // Ignore cross-origin stylesheet errors
          continue
        }
      }

      resolve(unusedSelectors.slice(0, 100)) // Limit results
    })
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      layoutShifts: this.layoutShifts
    }
  }

  /**
   * Calculate Cumulative Layout Shift score
   */
  getCLS(): number {
    return this.layoutShifts.reduce((total, shift) => total + shift.value, 0)
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): string {
    const metrics = this.getMetrics()
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      url: window.location.href,
      cssBundleSizeKB: metrics.cssBundleSize ? Math.round(metrics.cssBundleSize / 1024) : undefined,
      styleRecalculations: metrics.styleRecalculations,
      layoutShifts: metrics.layoutShifts?.length || 0,
      cls: this.getCLS(),
      paintTime: metrics.paintTime,
      loadTime: metrics.loadTime
    }, null, 2)
  }

  /**
   * Send metrics to monitoring service (placeholder)
   */
  sendMetrics(endpoint: string): void {
    const metrics = this.exportMetrics()
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, metrics)
    } else {
      fetch(endpoint, {
        method: 'POST',
        body: metrics,
        headers: { 'Content-Type': 'application/json' }
      }).catch(error => console.warn('Failed to send metrics:', error))
    }
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    if (this.clsObserver) {
      this.clsObserver.disconnect()
      this.clsObserver = null
    }
  }
}

// Singleton instance
let monitor: CSSPerformanceMonitor | null = null

/**
 * Initialize CSS performance monitoring
 */
export function initCSSPerformanceMonitoring(): CSSPerformanceMonitor {
  if (!monitor) {
    monitor = new CSSPerformanceMonitor()
  }
  return monitor
}

/**
 * Get current performance monitor instance
 */
export function getCSSPerformanceMonitor(): CSSPerformanceMonitor | null {
  return monitor
}

/**
 * Utility function to measure CSS impact of DOM changes
 */
export function measureCSSImpact(callback: () => void): void {
  if (!monitor) return

  const initialMetrics = monitor.getMetrics()

  const startTime = performance.now()
  callback()
  const endTime = performance.now()

  // Force style recalculation measurement
  setTimeout(() => {
    const finalMetrics = monitor!.getMetrics()
    console.log('CSS Impact Measurement:', {
      duration: endTime - startTime,
      newRecalculations: (finalMetrics.styleRecalculations || 0) - (initialMetrics.styleRecalculations || 0),
      newLayoutShifts: (finalMetrics.layoutShifts?.length || 0) - (initialMetrics.layoutShifts?.length || 0)
    })
  }, 0)
}

/**
 * Hook for React components to monitor CSS performance
 */
export function useCSSPerformance() {
  const monitor = initCSSPerformanceMonitoring()

  return {
    measureImpact: measureCSSImpact,
    getMetrics: () => monitor.getMetrics(),
    getCLS: () => monitor.getCLS(),
    exportMetrics: () => monitor.exportMetrics()
  }
}