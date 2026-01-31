import React from 'react'
import { format } from 'date-fns'
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Download,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Expense, ExpenseCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface ExpenseSummaryProps {
  expenses: Expense[]
  className?: string
  onExport?: () => void
}

interface ExpenseSummaryData {
  totalExpenses: number
  expensesByCategory: Record<ExpenseCategory, number>
  expensesByMonth: Record<string, number>
  totalTransactions: number
  averageExpense: number
  topCategory: { category: ExpenseCategory; amount: number } | null
}

const categoryConfig = {
  'booth-fee': { label: 'Booth Fee', color: 'bg-purple-100 text-purple-700', icon: '🏪' },
  'transportation': { label: 'Transportation', color: 'bg-blue-100 text-blue-700', icon: '🚗' },
  'accommodation': { label: 'Accommodation', color: 'bg-indigo-100 text-indigo-700', icon: '🏨' },
  'supplies': { label: 'Supplies', color: 'bg-green-100 text-green-700', icon: '📦' },
  'equipment': { label: 'Equipment', color: 'bg-yellow-100 text-yellow-700', icon: '🔧' },
  'marketing': { label: 'Marketing', color: 'bg-pink-100 text-pink-700', icon: '📢' },
  'food-meals': { label: 'Food', color: 'bg-orange-100 text-orange-700', icon: '🍽️' },
  'gasoline': { label: 'Fuel', color: 'bg-red-100 text-red-700', icon: '⛽' },
  'insurance': { label: 'Insurance', color: 'bg-gray-100 text-gray-700', icon: '🛡️' },
  'miscellaneous': { label: 'Other', color: 'bg-slate-100 text-slate-700', icon: '📋' }
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  expenses,
  className,
  onExport
}) => {
  const summaryData: ExpenseSummaryData = React.useMemo(() => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<ExpenseCategory, number>)
    
    const expensesByMonth = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)
    
    const totalTransactions = expenses.length
    const averageExpense = totalTransactions > 0 ? totalExpenses / totalTransactions : 0
    
    const topCategoryEntry = Object.entries(expensesByCategory)
      .reduce((max, [category, amount]) => 
        amount > max.amount ? { category: category as ExpenseCategory, amount } : max,
        { category: 'other' as ExpenseCategory, amount: 0 }
      )
    
    const topCategory = topCategoryEntry.amount > 0 ? topCategoryEntry : null
    
    return {
      totalExpenses,
      expensesByCategory,
      expensesByMonth,
      totalTransactions,
      averageExpense,
      topCategory
    }
  }, [expenses])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatMonth = (monthStr: string) => {
    return format(new Date(monthStr + '-01'), 'MMM yyyy')
  }

  const recentMonths = Object.entries(summaryData.expensesByMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 3)

  if (expenses.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No expenses recorded</h3>
          <p className="text-sm">Start tracking your market expenses to see financial summaries</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
          <p className="text-sm text-gray-600 mt-1">
            Overview of your market-related expenses
          </p>
        </div>
        {onExport && (
          <Button
            variant="outline"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summaryData.totalExpenses)}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryData.totalTransactions}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Expense</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summaryData.averageExpense)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(summaryData.expensesByCategory).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Category */}
      {summaryData.topCategory && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              {categoryConfig[summaryData.topCategory.category]?.icon || '📊'}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">Top Spending Category</h4>
              <p className="text-sm text-gray-600">
                {categoryConfig[summaryData.topCategory.category]?.label || summaryData.topCategory.category}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summaryData.topCategory.amount)}
              </p>
              <p className="text-sm text-gray-600">
                {((summaryData.topCategory.amount / summaryData.totalExpenses) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(summaryData.expensesByCategory)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => {
              const percentage = (amount / summaryData.totalExpenses) * 100
              const config = categoryConfig[category as ExpenseCategory]
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{config?.icon || '📊'}</span>
                    <Badge variant="outline" className={cn("text-xs", config?.color || 'bg-gray-100 text-gray-700')}>
                      {config?.label || category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </Card>

      {/* Recent Months */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Months</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentMonths.map(([month, amount]) => {
            const isCurrentMonth = month === new Date().toISOString().slice(0, 7)
            
            return (
              <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatMonth(month)}
                  </span>
                  {isCurrentMonth && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                      Current
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(amount)}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Trends */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h4>
        <div className="space-y-3">
          {Object.keys(summaryData.expensesByMonth).length > 1 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Expense tracking active</p>
                <p className="text-xs text-blue-600">
                  You've tracked expenses across {Object.keys(summaryData.expensesByMonth).length} months
                </p>
              </div>
            </div>
          )}
          
          {summaryData.topCategory && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-800">
                  {categoryConfig[summaryData.topCategory.category]?.label || 'Top category'}
                </p>
                <p className="text-xs text-purple-600">
                  Represents your largest expense category at {((summaryData.topCategory.amount / summaryData.totalExpenses) * 100).toFixed(1)}% of total spending
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Financial awareness</p>
              <p className="text-xs text-green-600">
                Average expense of {formatCurrency(summaryData.averageExpense)} per transaction helps with budget planning
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}