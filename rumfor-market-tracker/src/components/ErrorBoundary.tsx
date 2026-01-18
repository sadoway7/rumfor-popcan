import { Component, ErrorInfo, ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleCopyError = () => {
    if (this.state.error) {
      const errorText = `
Error: ${this.state.error.toString()}

${this.state.errorInfo ? `Component Stack:\n${this.state.errorInfo.componentStack}` : ''}

Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
      `.trim()

      navigator.clipboard.writeText(errorText).then(() => {
        // Could show a toast notification here, but for now just copy silently
        console.log('Error details copied to clipboard')
      }).catch((err) => {
        console.error('Failed to copy error details:', err)
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>

              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleCopyError} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Error Details
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
                    <h3 className="font-semibold text-red-600 mb-2">Error:</h3>
                    <pre className="text-sm text-gray-800 mb-4 whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>

                    {this.state.errorInfo && (
                      <>
                        <h3 className="font-semibold text-red-600 mb-2">Component Stack:</h3>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}