import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Calendar, TrendingUp, Filter } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { VendorExpenseTracker } from '@/components/VendorExpenseTracker'
import { useAuthStore } from '@/features/auth/authStore'
import { useMarkets } from '@/features/markets/hooks/useMarkets'

export function FinancialReportsPage() {
  const { user } = useAuthStore()
  const { markets, isLoading: marketsLoading } = useMarkets()
  const [selectedMarketId, setSelectedMarketId] = useState<string>('')

  // Get markets the user has applied to or been approved for
  const myMarkets = markets.filter(market => 
    market.promoterId !== user?.id // Exclude markets I created as promoter
  )

  if (marketsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track expenses and analyze your market profitability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/vendor/todos">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              View Planning
            </Button>
          </Link>
          <Link to="/vendor/calendar">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* Market Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="market-select" className="text-sm font-medium text-foreground mb-2 block">
              Select Market for Financial Analysis
            </label>
            <Select
              id="market-select"
              value={selectedMarketId}
              onValueChange={setSelectedMarketId}
              options={[
                { value: '', label: 'Choose a market for expense tracking...' },
                ...myMarkets.map(market => ({
                  value: market.id,
                  label: market.name
                }))
              ]}
            />
          </div>
          {selectedMarketId && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setSelectedMarketId('')}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Selection
              </Button>
            </div>
          )}
        </div>
        
        {myMarkets.length === 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm">
              You don't have any markets to track expenses for yet. 
              <Link to="/markets" className="text-accent hover:underline ml-1">
                Browse markets
              </Link> to find opportunities.
            </p>
          </div>
        )}
      </Card>

      {/* Expense Tracking Interface */}
      {selectedMarketId ? (
        <VendorExpenseTracker marketId={selectedMarketId} />
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Your Market Expenses</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Select a market above to start tracking expenses, generate financial reports, and monitor your profitability.
            </p>
            {myMarkets.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Available markets:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {myMarkets.slice(0, 3).map((market) => (
                    <Button
                      key={market.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMarketId(market.id)}
                    >
                      {market.name}
                    </Button>
                  ))}
                  {myMarkets.length > 3 && (
                    <Button variant="outline" size="sm" disabled>
                      +{myMarkets.length - 3} more
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Financial Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Expense Categories</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Booth Fees</p>
                <p className="text-sm text-muted-foreground">Market participation costs</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">25%</p>
                <p className="text-xs text-muted-foreground">of total expenses</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Transportation</p>
                <p className="text-sm text-muted-foreground">Travel and delivery costs</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">20%</p>
                <p className="text-xs text-muted-foreground">of total expenses</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Supplies & Equipment</p>
                <p className="text-sm text-muted-foreground">Display and setup materials</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">30%</p>
                <p className="text-xs text-muted-foreground">of total expenses</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Marketing</p>
                <p className="text-sm text-muted-foreground">Advertising and promotion</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">15%</p>
                <p className="text-xs text-muted-foreground">of total expenses</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Other</p>
                <p className="text-sm text-muted-foreground">Miscellaneous expenses</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">10%</p>
                <p className="text-xs text-muted-foreground">of total expenses</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profitability Tips</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Track All Expenses</h3>
              <p className="text-sm text-green-700">
                Include even small costs like parking, meals, and supplies. These add up quickly and affect your true profit margin.
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Plan Your Pricing</h3>
              <p className="text-sm text-blue-700">
                Set prices that cover your costs plus desired profit margin. Use expense tracking to ensure you're pricing competitively.
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-medium text-orange-800 mb-2">Monitor Trends</h3>
              <p className="text-sm text-orange-700">
                Regular expense tracking helps you identify cost-saving opportunities and seasonal patterns.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}