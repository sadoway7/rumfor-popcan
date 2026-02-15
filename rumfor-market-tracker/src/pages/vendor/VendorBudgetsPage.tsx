import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Plus, DollarSign, MoreVertical, Edit2, Trash2, X, Calendar } from 'lucide-react'
import { useAllExpenses } from '@/features/tracking/hooks/useAllExpenses'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'
import { ExpenseCategory } from '@/types'

export function VendorBudgetsPage() {
  const { user } = useAuthStore()
  const { expenses, createExpense, deleteExpense, isCreating } = useAllExpenses()
  const { trackedMarkets, getTrackingStatus } = useTrackedMarkets()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  
  const [newTitle, setNewTitle] = useState('')
  const [newMarketId, setNewMarketId] = useState('')
  const [newExpected, setNewExpected] = useState('')
  const [newActual, setNewActual] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('miscellaneous')

  // Get all markets the user is following
  const trackedMarketsList = trackedMarkets.filter(market => getTrackingStatus(market.id)?.status !== 'declined' && getTrackingStatus(market.id)?.status !== 'cancelled')

  // Calculate totals client-side
  const totalExpected = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const totalActual = expenses.reduce((sum, exp) => sum + (exp.actualAmount || 0), 0)
  const overBudget = totalActual > totalExpected

  const handleCreateExpense = () => {
    if (!newTitle.trim() || !newMarketId || !newExpected || !newDate) return
    
    createExpense({
      title: newTitle,
      marketId: newMarketId,
      amount: parseFloat(newExpected),
      actualAmount: newActual ? parseFloat(newActual) : undefined,
      date: newDate,
      category: newCategory,
      vendorId: user?.id || ''
    })
    
    setNewTitle('')
    setNewMarketId(trackedMarketsList[0]?.id || '')
    setNewExpected('')
    setNewActual('')
    setNewDate('')
    setNewCategory('miscellaneous')
    setShowCreateModal(false)
    setEditingExpense(null)
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this budget item?')) {
      deleteExpense(id)
    }
    setOpenMenuId(null)
  }

  const openEditModal = (expense: typeof expenses[0]) => {
    setEditingExpense(expense.id)
    setNewTitle(expense.title || '')
    setNewMarketId(expense.marketId)
    setNewExpected(expense.amount.toString())
    setNewActual(expense.actualAmount?.toString() || '')
    setNewDate(expense.date || '')
    setNewCategory(expense.category || 'miscellaneous')
    setShowCreateModal(true)
    setOpenMenuId(null)
  }

  const resetForm = () => {
    setNewTitle('')
    setNewMarketId(trackedMarketsList[0]?.id || '')
    setNewExpected('')
    setNewActual('')
    setNewDate('')
    setNewCategory('miscellaneous')
    setEditingExpense(null)
    setShowCreateModal(false)
  }

  // Find expenses that don't match any tracked market
  const unmatchedExpenses = expenses.filter(exp => 
    !trackedMarketsList.some(market => market.id === exp.marketId)
  )

  const getMarketColor = (marketId: string) => {
    let hash = 0
    for (let i = 0; i < marketId.length; i++) {
      hash = marketId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']
    return colors[Math.abs(hash) % colors.length]
  }

  const openCreateModal = () => {
    setNewMarketId(trackedMarketsList[0]?.id || '')
    setShowCreateModal(true)
  }

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
          onClick={openCreateModal}
          className="h-8 px-3 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Empty state */}
      {expenses.length === 0 && (
        <Card className="p-6 mb-4">
          <div className="text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Budgets Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create budgets for your markets to track expenses</p>
            <Button onClick={openCreateModal} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>
        </Card>
      )}

      {/* Budgets list grouped by market */}
      {trackedMarketsList.length > 0 && (
        <div className="space-y-4">
          {trackedMarketsList.map((market) => {
            const marketExpenses = expenses.filter(exp => exp.marketId === market.id)
            const marketTotalExpected = marketExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
            const marketTotalActual = marketExpenses.reduce((sum, exp) => sum + (exp.actualAmount || 0), 0)
            const marketIsOverBudget = marketTotalActual > marketTotalExpected

            if (marketExpenses.length === 0) return null

            return (
              <Card key={market.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: getMarketColor(market.id)}} />
                    <span className="text-base font-semibold text-foreground">{market.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">${marketTotalExpected.toFixed(0)}</span>
                    <span className={cn("font-medium", marketIsOverBudget ? "text-red-600" : "text-green-600")}>
                      ${marketTotalActual.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 ml-5">
                  {marketExpenses.map((expense) => {
                    const variance = expense.actualAmount !== undefined ? expense.actualAmount - expense.amount : 0

                    return (
                      <div key={expense.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-accent/10 border border-accent/20">
                            <DollarSign className="w-4 h-4 text-accent" />
                          </div>
                        </div>

                        {/* Title and date */}
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate text-foreground">
                            {expense.title || 'Untitled Budget'}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">
                            {expense.date ? new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                          </span>
                        </div>

                        {/* Amounts */}
                        <div className="text-right">
                          <div className="text-xs font-medium text-muted-foreground">
                            ${expense.amount.toFixed(0)}
                          </div>
                          <div className={cn(
                            "text-xs font-semibold whitespace-nowrap min-w-[60px] text-right",
                            variance > 0 ? "text-red-600" : "text-muted-foreground"
                          )}>
                            {expense.actualAmount !== undefined ? `$${expense.actualAmount.toFixed(0)}` : '-'}
                          </div>
                        </div>

                        {/* Variance */}
                        <div className="text-xs font-medium min-w-[50px] text-right whitespace-nowrap">
                          {variance > 0 ? (
                            <span className="text-red-600">+${variance.toFixed(0)}</span>
                          ) : variance < 0 ? (
                            <span className="text-emerald-600">${variance.toFixed(0)}</span>
                          ) : (
                            <span className="text-muted-foreground/30">$0</span>
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
                                onClick={() => openEditModal(expense)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-surface flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
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
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Unmatched expenses (market not tracked) */}
      {unmatchedExpenses.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Other Budgets</span>
              <span className="text-xs text-muted-foreground">({unmatchedExpenses.length})</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {unmatchedExpenses.map((expense) => {
              const variance = expense.actualAmount !== undefined ? expense.actualAmount - expense.amount : 0
              return (
                <div key={expense.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 border border-gray-200">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate text-foreground">
                      {expense.title || 'Untitled Budget'}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {expense.date ? new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-muted-foreground">
                      ${expense.amount.toFixed(0)}
                    </div>
                  </div>
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
                          onClick={() => handleDeleteExpense(expense.id)}
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
            })}
          </div>
        </Card>
      )}

      {/* Create/Edit Expense Modal */}
      {showCreateModal && (
        <Card className="p-6 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-lg p-6 max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingExpense ? 'Edit Budget' : 'Create Budget'}</h3>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-surface/50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                  placeholder="e.g., Booth fee, Gas, Supplies"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Market</label>
                <select 
                  value={newMarketId}
                  onChange={(e) => setNewMarketId(e.target.value)}
                  className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                >
                  <option value="">Select a market</option>
                  {trackedMarketsList.map((market) => (
                    <option key={market.id} value={market.id}>{market.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Expected Amount</label>
                  <input
                    type="number"
                    value={newExpected}
                    onChange={(e) => setNewExpected(e.target.value)}
                    className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Actual Amount</label>
                  <input
                    type="number"
                    value={newActual}
                    onChange={(e) => setNewActual(e.target.value)}
                    className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-sm border-2 rounded-lg hover:bg-surface"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateExpense}
                  disabled={!newTitle.trim() || !newMarketId || !newExpected || !newDate || isCreating}
                  className="flex-1 px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
