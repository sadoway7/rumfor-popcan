import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardContent } from '@/components/ui'
import { CheckCircle, Mail, ArrowRight, Store } from 'lucide-react'

export function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center md:p-4">
      <div className="w-full md:max-w-md md:rounded-xl md:shadow-lg">
        <Card className="md:border rounded-none md:rounded-xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Rumfor!
              </h1>
              <p className="text-muted-foreground">
                Your account has been created successfully
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
                <Mail className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground">Verify your email</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for a verification link to unlock all features.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
                <Store className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground">Set up your vendor profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your business details, profile photo, and product categories.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> Add any welcome notes or instructions here for new users.
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/dashboard" className="block">
                <Button className="w-full">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/markets" className="block">
                <Button variant="outline" className="w-full">
                  Browse Markets
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
