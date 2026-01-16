import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Expense, ExpenseCategory } from '@/types'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface ExpenseChartProps {
  expenses: Expense[]
  className?: string
}

const COLORS = [
  '#8B5CF6', // purple
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#F97316', // orange
  '#84CC16', // lime
  '#EC4899', // pink
  '#6B7280'  // gray
]

const categoryConfig = {
  'booth-fee': { label: 'Booth Fee', color: COLORS[0] },
  'transportation': { label: 'Transportation', color: COLORS[1] },
  'accommodation': { label: 'Accommodation', color: COLORS[2] },
  'supplies': { label: 'Supplies', color: COLORS[3] },
  'equipment': { label: 'Equipment', color: COLORS[4] },
  'marketing': { label: 'Marketing', color: COLORS[5] },
  'food': { label: 'Food', color: COLORS[6] },
  'fuel': { label: 'Fuel', color: COLORS[7] },
  'insurance': { label: 'Insurance', color: COLORS[8] },
  'other': { label: 'Other', color: COLORS[9] }
}

export const ExpenseChart: React.FC<ExpenseChartProps> = React.memo(({
  expenses,
  className
}) => {
  // Group expenses by category
  const expensesByCategory = React.useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, expenses: [] }
      }
      acc[category].total += expense.amount
      acc[category].count += 1
      acc[category].expenses.push(expense)
      return acc
    }, {} as Record<ExpenseCategory, { total: number; count: number; expenses: Expense[] }>)

    return Object.entries(grouped).map(([category, data]) => ({
      category,
      label: categoryConfig[category as ExpenseCategory]?.label || category,
      total: data.total,
      count: data.count,
      color: categoryConfig[category as ExpenseCategory]?.color || COLORS[9]
    })).sort((a, b) => b.total - a.total)
  }, [expenses])

  // Group expenses by month
  const expensesByMonth = React.useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 }
      }
      acc[month].total += expense.amount
      acc[month].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        total: data.total,
        count: data.count,
        label: new Date(month + '-01').toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        })
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [expenses])

  // Calculate trends
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averagePerMonth = expensesByMonth.length > 0 
    ? expensesByMonth.reduce((sum, month) => sum + month.total, 0) / expensesByMonth.length
    : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (expenses.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
          <p className="text-sm">Start tracking your market expenses to see charts and insights</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average/Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(averagePerMonth)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{expensesByCategory.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses by Category (Pie Chart) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Category Breakdown</h4>
            {expensesByCategory.map((category) => {
              const percentage = totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-700">{category.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Monthly Trends (Line Chart) */}
      {expensesByMonth.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expensesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  formatter={(value: number) => [formatCurrency(value), 'Expenses']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Category Comparison (Bar Chart) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expensesByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: number) => [formatCurrency(value), 'Total']}
              />
              <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Insights</h3>
        <div className="space-y-3">
          {expensesByCategory.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Top spending category
                </p>
                <p className="text-xs text-blue-600">
                  {expensesByCategory[0].label} accounts for {((expensesByCategory[0].total / totalExpenses) * 100).toFixed(1)}% of your total expenses
                </p>
              </div>
            </div>
          )}
          
          {expensesByMonth.length > 1 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Average monthly spending
                </p>
                <p className="text-xs text-green-600">
                  You spend approximately {formatCurrency(averagePerMonth)} per month on market-related expenses
                </p>
              </div>
            </div>
          )}
          
          {expenses.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Expense tracking
                </p>
                <p className="text-xs text-purple-600">
                  You've tracked {expenses.length} expense{expenses.length !== 1 ? 's' : ''} across {expensesByCategory.length} categories
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
})