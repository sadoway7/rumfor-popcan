/**
 * Production-safe logging utility
 * Logs are stripped from production builds to reduce bundle size
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  includeTimestamp: boolean
  includeStackTrace: boolean
}

class Logger {
  private config: LoggerConfig
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = import.meta.env.DEV
    this.config = {
      enabled: this.isDevelopment,
      level: 'debug',
      includeTimestamp: true,
      includeStackTrace: false
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const requestedLevelIndex = levels.indexOf(level)
    
    return requestedLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): any[] {
    const timestamp = this.config.includeTimestamp 
      ? `[${new Date().toISOString()}]` 
      : ''
    
    const levelTag = `[${level.toUpperCase()}]`
    
    return [
      `${timestamp} ${levelTag} ${message}`,
      ...args
    ].filter(Boolean)
  }

  /**
   * Debug-level logging (stripped in production)
   * Use for detailed debugging information
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', message, ...args))
    }
  }

  /**
   * Info-level logging
   * Use for general informational messages
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args))
    }
  }

  /**
   * Warning-level logging
   * Use for warning messages that don't stop execution
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args))
    }
  }

  /**
   * Error-level logging (kept in production)
   * Use for error messages and exceptions
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.shouldLog('error')) {
      const formattedArgs = [...this.formatMessage('error', message, ...args)]
      
      if (error) {
        if (error instanceof Error) {
          formattedArgs.push(error)
          if (this.config.includeStackTrace && error.stack) {
            formattedArgs.push('\nStack trace:', error.stack)
          }
        } else {
          formattedArgs.push(error)
        }
      }
      
      console.error(...formattedArgs)
    }
  }

  /**
   * Group logging (for related log statements)
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label)
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }

  /**
   * Table logging (for arrays/objects)
   */
  table(data: any): void {
    if (this.isDevelopment) {
      console.table(data)
    }
  }

  /**
   * Time measurement
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }

  /**
   * Configure logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for use in other files
export type { LogLevel }

// Default export
export default logger
