import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'

interface NotFoundPageProps {
  title?: string
  message?: string
  showBackButton?: boolean
  showHomeButton?: boolean
}

export function NotFoundPage({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showBackButton = true,
  showHomeButton = true
}: NotFoundPageProps = {}) {
  const errorCode = title.includes("404") || title === "Page Not Found" ? "404" : "403"
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-muted-foreground mb-4">{errorCode}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {title === "Page Not Found" ? "Check the URL for typos or go back to the homepage." : "Please contact support if you believe this is an error."}
          </p>
          <div className="flex gap-2 justify-center">
            {showHomeButton && (
              <Link to="/">
                <Button>Go Home</Button>
              </Link>
            )}
            {showBackButton && (
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}