import React, { useState } from 'react'
import { AlertTriangle, Bug } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { BugReportModal } from '@/components/BugReportModal'

interface ErrorFallbackProps {
  error?: Error
  onRetry: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const [showBugReport, setShowBugReport] = useState(false)

  const getErrorMessage = () => {
    if (error?.message) {
      return error.message
    }
    return 'We encountered an error while loading this content. Please try refreshing the page.'
  }

  return (
    <>
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {getErrorMessage()}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={onRetry}
              variant="outline"
            >
              Try Again
            </Button>
            <Button
              onClick={() => setShowBugReport(true)}
              variant="outline"
            >
              <Bug className="h-4 w-4 mr-2" />
              Report this issue
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error details (development)
              </summary>
              <pre className="text-xs bg-muted p-2 mt-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </Card>

      <BugReportModal 
        isOpen={showBugReport} 
        onClose={() => setShowBugReport(false)} 
      />
    </>
  )
}
