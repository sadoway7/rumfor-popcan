import React, { useState } from 'react'
import { Plus, Search, Filter, Download, DollarSign } from 'lucide-react'
import { useExpenses, useExpenseSummary } from '@/features/tracking/hooks/useExpenses'
import { Expense, ExpenseCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ExpenseItem } from './ExpenseItem'
import { ExpenseForm } from './ExpenseForm'
import { ExpenseSummary } from './ExpenseSummary'
import { ExpenseChart } from './ExpenseChart'
import { cn } from '@/utils/cn'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'

interface VendorExpenseTrackerProps {
  marketId: string
  className?: string
}

type FilterType = 'all' | 'recent' | 'this-month' | 'this-year'
type SortType = 'date' | 'amount' | 'category' | 'title'

const categoryLabels: Record<ExpenseCategory, string> = {
  'booth-fee': 'Booth Fee',
  'transportation': 'Transportation',
  'accommodation': 'Accommodation',
  'supplies': 'Supplies',
  'equipment': 'Equipment',
  'marketing': 'Marketing',
  'food': 'Food',
  'fuel': 'Fuel',
  'insurance': 'Insurance',
  'other': 'Other'
}

export const VendorExpenseTracker: React.FC<VendorExpenseTrackerProps> = ({
  marketId,
  className
}) => {
  const { expenses, isLoading, error, createExpense, deleteExpense } = useExpenses(marketId)
  const { summary } = useExpenseSummary(marketId)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('date')
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | ''>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showCharts, setShowCharts] = useState(false)

  // Filter and sort expenses
  const filteredAndSortedExpenses = React.useMemo(() => {
    let filtered = expenses

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
      )
    }

    // Apply date filter
    const now = new Date()
    switch (filter) {
      case 'recent':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(expense => new Date(expense.date) >= weekAgo)
        break
      case 'this-month':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
        })
        break
      case 'this-year':
        filtered = filtered.filter(expense => new Date(expense.date).getFullYear() === now.getFullYear())
        break
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory)
    }

    // Sort expenses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'amount':
          return b.amount - a.amount
        case 'category':
          return a.category.localeCompare(b.category)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [expenses, searchQuery, filter, sortBy, selectedCategory])

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(expenses.map(expense => expense.category)))
    return cats.sort()
  }, [expenses])

  // Get stats
  const stats = React.useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const thisMonth = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
    }).reduce((sum, expense) => sum + expense.amount, 0)
    
    return {
      total,
      count: expenses.length,
      thisMonth,
      average: expenses.length > 0 ? total / expenses.length : 0
    }
  }, [expenses])

  const handleCreateExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createExpense(expenseData)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id)
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingExpense(null)
  }

  const handleExport = () => {
    try {
      if (filteredAndSortedExpenses.length === 0) {
        alert('No expenses to export')
        return
      }

      // Prepare export data
      const exportData = filteredAndSortedExpenses.map(expense => ({
        'Title': expense.title,
        'Description': expense.description || '',
        'Category': categoryLabels[expense.category],
        'Amount': formatCurrency(expense.amount),
        'Date': format(new Date(expense.date), 'yyyy-MM-dd')
      }))

      // Generate filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm')
      const filename = `expenses-${timestamp}.csv`

      // Convert to CSV and download
      const csv = Papa.unparse(exportData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex items-center justify-center">
          <Spinner className="w-6 h-6" />
          <span className="ml-2 text-gray-600">Loading expenses...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="text-center text-red-600">
          <DollarSign className="w-8 h-8 mx-auto mb-2" />
          <p>Error loading expenses: {error}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Tracking</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and analyze your market-related expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.total)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-lg font-semibold">{stats.count}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.thisMonth)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.average)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary */}
      {summary && (
        <ExpenseSummary 
          expenses={expenses} 
          onExport={handleExport}
        />
      )}

      {/* Charts */}
      {showCharts && (
        <ExpenseChart expenses={expenses} />
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as FilterType)}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'recent', label: 'Last 7 Days' },
                { value: 'this-month', label: 'This Month' },
                { value: 'this-year', label: 'This Year' }
              ]}
            />

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortType)}
              options={[
                { value: 'date', label: 'Date' },
                { value: 'amount', label: 'Amount' },
                { value: 'category', label: 'Category' },
                { value: 'title', label: 'Title' }
              ]}
            />

            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as ExpenseCategory | '')}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({ 
                  value: cat, 
                  label: categoryLabels[cat]
                }))
              ]}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setFilter('all')
                setSelectedCategory('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Expense List */}
      {filteredAndSortedExpenses.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<DollarSign className="w-12 h-12 text-gray-300" />}
            title="No expenses found"
            description={
              searchQuery || filter !== 'all' || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'Start tracking your market expenses to stay organized'
            }
            action={
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateExpense}
        editingExpense={editingExpense}
        marketId={marketId}
      />
    </div>
  )
}