import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, BarChart3, Plus, Filter } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { VendorTodoList } from '@/components/VendorTodoList'
import { useAuthStore } from '@/features/auth/authStore'
import { useMarkets } from '@/features/markets/hooks/useMarkets'

export function BusinessPlanningPage() {
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
          <p className="text-muted-foreground">Loading planning tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Planning</h1>
          <p className="text-muted-foreground mt-1">
            Organize your market preparation and track progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/vendor/expenses">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              View Expenses
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
              Select Market
            </label>
            <Select
              id="market-select"
              value={selectedMarketId}
              onValueChange={setSelectedMarketId}
              options={[
                { value: '', label: 'Choose a market for planning...' },
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
              You don't have any markets to plan for yet. 
              <Link to="/markets" className="text-accent hover:underline ml-1">
                Browse markets
              </Link> to find opportunities.
            </p>
          </div>
        )}
      </Card>

      {/* Todo Planning Interface */}
      {selectedMarketId ? (
        <VendorTodoList marketId={selectedMarketId} />
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Market to Start Planning</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Choose a market from the dropdown above to access todo lists, expense tracking, and planning tools specific to that market.
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

      {/* Planning Tips */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Planning Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Start Early</h3>
            <p className="text-sm text-muted-foreground">
              Begin planning 2-4 weeks before the market date to ensure you have enough time for preparation.
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Use Templates</h3>
            <p className="text-sm text-muted-foreground">
              Save time by using pre-made todo templates for common market preparation tasks.
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Track Expenses</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your costs to ensure profitability and budget for future markets.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}