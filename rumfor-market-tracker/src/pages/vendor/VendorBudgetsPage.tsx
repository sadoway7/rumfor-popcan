import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Plus, DollarSign } from 'lucide-react'
import { VendorAggregatedBudgetList } from '@/components/VendorAggregatedBudgetList'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'

export function VendorBudgetsPage() {
  const { expenses } = useExpenses()

  // Calculate totals client-side
  const totalExpected = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const totalActual = expenses.reduce((sum, exp) => sum + (exp.actualAmount || 0), 0)
  const overBudget = totalActual > totalExpected

  return (
    <div className="px-2 py-2">
      {/* Unified header - Back button, Stats, Add button */}
      <div className="flex items-center justify-between mb-3 min-h-[40px]">
        <Link
          to="/vendor/dashboard"
          className="p-2 rounded-full bg-surface hover:bg-surface-2 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-3 flex-1 justify-center">
          {expenses.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                ${totalExpected.toFixed(0)} expected
              </span>
              <span className={`text-sm font-medium whitespace-nowrap ${overBudget ? 'text-red-600' : 'text-green-600'}`}>
                ${totalActual.toFixed(0)} actual
              </span>
            </>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => { }}
          className="h-8 px-3 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Coming Soon Banner */}
      <Card className="p-6 mb-4">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">Budget Tracking</h3>
          <p className="text-sm text-muted-foreground">Master List Coming Soon</p>
        </div>
      </Card>

      {/* Aggregated Budget List - no extra padding, no header */}
      <VendorAggregatedBudgetList showHeader={false} />
    </div>
  )
}
