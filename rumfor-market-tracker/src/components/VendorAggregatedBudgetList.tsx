import React, { useState, useMemo } from 'react'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { Expense, Market, ExpenseCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'
import { MoreVertical, Trash2, Edit2, DollarSign } from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'

interface VendorAggregatedBudgetListProps {
  className?: string
  showHeader?: boolean
}

const expenseCategories = [
  { id: 'supplies', label: 'Supplies', icon: '📦' },
  { id: 'booth-fee', label: 'Booth Fee', icon: '🎫' },
  { id: 'equipment', label: 'Equipment', icon: '🛒' },
  { id: 'transportation', label: 'Transport', icon: '🚚' },
  { id: 'accommodation', label: 'Accommodation', icon: '🏠' }
]

export const VendorAggregatedBudgetList: React.FC<VendorAggregatedBudgetListProps> = ({ className }) => {
  const { user } = useAuthStore()
  const { expenses, isLoading, error, createExpense, updateExpense, deleteExpense } = useExpenses()
  const { trackedMarkets, isLoading: marketsLoading } = useTrackedMarkets()
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newName, setName] = useState('')
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('supplies')
  const [newAmount, setNewAmount] = useState('')
  const [newActualAmount, setNewActualAmount] = useState('')
  const [newMarketId, setNewMarketId] = useState<string | undefined>(undefined)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isEditingActual, setIsEditingActual] = useState(false)

  // Group expenses by market
  const expensesByMarket = useMemo(() => {
    const grouped: Record<string, Expense[]> = {}
    expenses.forEach(expense => {
      const marketId = expense.marketId || 'general'
      if (!grouped[marketId]) {
        grouped[marketId] = []
      }
      grouped[marketId].push(expense)
    })
    return grouped
  }, [expenses])

  // Calculate totals per market
  const marketTotals = useMemo(() => {
    const totals: Record<string, { expected: number; actual: number }> = {}
    Object.entries(expensesByMarket).forEach(([marketId, marketExpenses]) => {
      totals[marketId] = marketExpenses.reduce(
        (acc, exp) => ({
          expected: acc.expected + (exp.amount || 0),
          actual: acc.actual + (exp.actualAmount || 0)
        }),
        { expected: 0, actual: 0 }
      )
    })
    return totals
  }, [expensesByMarket])

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await deleteExpense(id)
    }
    setOpenMenuId(null)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setName(expense.title)
    setNewCategory(expense.category)
    setNewAmount(expense.amount.toString())
    setNewActualAmount(expense.actualAmount?.toString() || '')
    setNewMarketId(expense.marketId || undefined)
    setShowForm(true)
    setOpenMenuId(null)
  }

  const handleSave = async () => {
    if (!newName.trim() || !newAmount) return

    const amount = parseFloat(newAmount)
    const actualAmount = newActualAmount ? parseFloat(newActualAmount) : undefined

    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        title: newName,
        category: newCategory,
        amount,
        actualAmount,
        ...(newMarketId && { marketId: newMarketId })
      })
    } else {
      createExpense({
        vendorId: user?.id || '',
        title: newName,
        category: newCategory,
        amount,
        actualAmount,
        date: new Date().toISOString(),
        marketId: newMarketId || ''
      } as any)
    }
    setShowForm(false)
    setEditingExpense(null)
    setName('')
    setNewCategory('supplies')
    setNewAmount('')
    setNewActualAmount('')
    setNewMarketId(undefined)
  }

  const handleQuickActualUpdate = async (expense: Expense, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      await updateExpense(expense.id, { actualAmount: num })
      setIsEditingActual(false)
    }
  }

  const getMarketName = (marketId: string) => {
    if (!marketId) return 'General'
    const market = trackedMarkets.find((m: Market) => m.id === marketId)
    return market ? market.name : 'Unknown Market'
  }

  // Ultra-compact expense item
  const ExpenseCompactItem = ({ expense }: { expense: Expense }) => {
    const isOverBudget = expense.actualAmount && expense.actualAmount > expense.amount
    const actualValue = expense.actualAmount !== undefined ? expense.actualAmount.toString() : ''

    return (
      <div className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]">
        {/* Icon with market indicator */}
        <div className="flex-shrink-0 relative">
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-accent/10 border border-accent/20">
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          {expense.marketId && (
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full border border-background" style={{backgroundColor: getMarketColor(expense.marketId)}} />
          )}
        </div>

        {/* Name and category */}
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-medium truncate text-foreground">
            {expense.title}
          </span>
          <span className="block text-xs text-muted-foreground truncate">
            {expenseCategories.find(c => c.id === expense.category)?.label || expense.category}
          </span>
        </div>

        {/* Expected amount */}
        <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
          ${expense.amount.toFixed(0)}
        </span>

        {/* Actual amount - inline editable */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isEditingActual && openMenuId === `edit-${expense.id}` ? (
            <input
              type="number"
              autoFocus
              defaultValue={actualValue}
              onBlur={(e) => handleQuickActualUpdate(expense, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuickActualUpdate(expense, (e.target as HTMLInputElement).value)
                } else if (e.key === 'Escape') {
                  setIsEditingActual(false)
                  setOpenMenuId(null)
                }
              }}
              className="w-16 p-1 text-xs border rounded bg-background focus:border-accent outline-none"
            />
          ) : (
            <button
              onClick={() => {
                setIsEditingActual(true)
                setOpenMenuId(`edit-${expense.id}`)
              }}
              className={cn(
                "text-xs font-medium px-2 py-1 rounded flex-shrink-0",
                isOverBudget ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              )}
            >
              ${expense.actualAmount !== undefined ? expense.actualAmount.toFixed(0) : '-'}
            </button>
          )}
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
            className="p-1.5 rounded hover:bg-surface/50 touch-manipulation"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {openMenuId === expense.id && (
            <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
              <button
                onClick={() => handleEdit(expense)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-surface flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(expense.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-surface text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const getMarketColor = (marketId: string) => {
    let hash = 0
    for (let i = 0; i < marketId.length; i++) {
      hash = marketId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']
    return colors[Math.abs(hash) % colors.length]
  }

  if (isLoading || marketsLoading) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="animate-pulse">Loading...</div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-red-500 text-sm">Error loading expenses</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Expenses grouped by market sections */}
      {Object.entries(expensesByMarket).map(([marketId, marketExpenses]) => {
        const marketName = marketId === 'general' ? 'General' : getMarketName(marketId)
        const marketColor = marketId === 'general' ? '#ccc' : getMarketColor(marketId)
        const totals = marketTotals[marketId] || { expected: 0, actual: 0 }
        const isOverBudget = totals.actual > totals.expected

        return (
          <div key={marketId} className="mb-4">
            {/* Market section header with totals */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: marketColor}} />
                <span className="text-base font-semibold text-foreground">{marketName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">${totals.expected.toFixed(0)}</span>
                <span className={cn("font-medium", isOverBudget ? "text-red-600" : "text-green-600")}>
                  ${totals.actual.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Expenses for this market */}
            <div className="space-y-1 ml-5">
              {marketExpenses.map((expense: Expense) => (
                <ExpenseCompactItem key={expense.id} expense={expense} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No expenses yet</p>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingExpense ? 'Edit Expense' : 'New Expense'}
        showCloseButton={true}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
            <Input
              type="text"
              value={newName}
              onChange={e => setName(e.target.value)}
              placeholder="Expense name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as ExpenseCategory)}
              className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
            >
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Expected</label>
              <Input
                type="number"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Actual</label>
              <Input
                type="number"
                value={newActualAmount}
                onChange={e => setNewActualAmount(e.target.value)}
                placeholder="Leave empty"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Market</label>
            <select
              value={newMarketId || ''}
              onChange={e => setNewMarketId(e.target.value || undefined)}
              className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
            >
              <option value="">General</option>
              {trackedMarkets.map((market: Market) => (
                <option key={market.id} value={market.id}>{market.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSave}
            >
              Save
            </Button>

            {editingExpense && (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  handleDelete(editingExpense.id)
                  setShowForm(false)
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
