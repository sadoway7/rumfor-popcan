import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/features/auth/authStore'
import { 
  Store, 
  User, 
  Building, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Info
} from 'lucide-react'
import { cn } from '@/utils/cn'

export function AddMarketPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedUserType, setSelectedUserType] = useState<'vendor' | 'promoter' | null>(null)

  // Auto-detect user type if already set
  React.useEffect(() => {
    if (user?.role === 'promoter') {
      setSelectedUserType('promoter')
    } else if (user?.role === 'vendor') {
      setSelectedUserType('vendor')
    }
  }, [user?.role])

  // Auto-navigate if user type is already determined
  React.useEffect(() => {
    if (selectedUserType === 'vendor') {
      navigate('/vendor/add-market/vendor')
    } else if (selectedUserType === 'promoter') {
      navigate('/promoter/add-market')
    }
  }, [selectedUserType, navigate])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to add a market</p>
        </div>
      </div>
    )
  }

  if (selectedUserType && (user.role === 'promoter' || user.role === 'vendor')) {
    // Auto-navigation in progress
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to {selectedUserType} form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <Store className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add a New Market</h1>
          <p className="text-muted-foreground mt-2">
            Help build the marketplace by adding markets you've discovered
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendor Option */}
        <Card 
          className={cn(
            "p-6 cursor-pointer transition-all hover:shadow-lg border-2",
            selectedUserType === 'vendor' ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
          )}
          onClick={() => setSelectedUserType('vendor')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">I'm a Vendor</h3>
                <p className="text-sm text-muted-foreground">Track and manage market participation</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Quick form to add market to database</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Auto-tracks market for your use</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Organize todos and expenses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Apply to promoter-managed markets</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">
                  Perfect for adding markets you want to track or participate in
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Promoter Option */}
        <Card 
          className={cn(
            "p-6 cursor-pointer transition-all hover:shadow-lg border-2",
            selectedUserType === 'promoter' ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
          )}
          onClick={() => setSelectedUserType('promoter')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">I'm a Promoter</h3>
                <p className="text-sm text-muted-foreground">Create and manage markets professionally</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Full-featured market management</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Custom application forms</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Vendor management tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Analytics and reporting</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  Comprehensive tools for professional market management
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Role Indicator */}
      {user.role && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              {user.role === 'promoter' ? 'Promoter' : 'Vendor'} Account
            </Badge>
            <span className="text-sm text-muted-foreground">
              Using your current role to streamline the process
            </span>
          </div>
        </Card>
      )}

      {/* Continue Button */}
      {selectedUserType && (
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => {
              if (selectedUserType === 'vendor') {
                navigate('/vendor/add-market/vendor')
              } else {
                navigate('/promoter/add-market')
              }
            }}
            className="flex items-center gap-2"
          >
            Continue as {selectedUserType === 'vendor' ? 'Vendor' : 'Promoter'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Help Text */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Why add markets?</h4>
            <p className="text-sm text-blue-700">
              By adding markets you discover, you help build a comprehensive database that benefits the entire community. 
              Vendors get better visibility into opportunities, and promoters can see what markets are popular in different areas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}