import React, { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We encountered an error while loading this content. Please try refreshing the page.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              variant="outline"
            >
              Try Again
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error details (development)
                </summary>
                <pre className="text-xs bg-muted p-2 mt-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}