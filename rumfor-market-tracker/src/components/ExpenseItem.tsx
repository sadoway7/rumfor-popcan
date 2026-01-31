import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Calendar, 
  Edit3, 
  Trash2, 
  DollarSign,
  Receipt,
  Tag
} from 'lucide-react'
import { Expense } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface ExpenseItemProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const categoryConfig = {
  'booth-fee': {
    label: 'Booth Fee',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🏪'
  },
  'transportation': {
    label: 'Transportation',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '🚗'
  },
  'accommodation': {
    label: 'Accommodation',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: '🏨'
  },
  'supplies': {
    label: 'Supplies',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '📦'
  },
  'equipment': {
    label: 'Equipment',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '🔧'
  },
  'marketing': {
    label: 'Marketing',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: '📢'
  },
  'food-meals': {
    label: 'Food',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: '🍽️'
  },
  'gasoline': {
    label: 'Fuel',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '⛽'
  },
  'insurance': {
    label: 'Insurance',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: '🛡️'
  },
  'miscellaneous': {
    label: 'Other',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '📋'
  }
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(expense)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(expense.id)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const category = categoryConfig[expense.category] || categoryConfig['other']

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md cursor-pointer",
        isLoading && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 text-sm leading-5">
                  {expense.title}
                </h3>
                <span className="text-lg">{category.icon}</span>
              </div>
              
              {expense.description && (
                <p className="text-xs text-gray-600 mb-2 leading-4">
                  {expense.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Amount */}
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatAmount(expense.amount)}
                  </span>
                </div>

                {/* Category */}
                <Badge variant="outline" className={cn("text-xs", category.color)}>
                  <Tag className="w-3 h-3 mr-1" />
                  {category.label}
                </Badge>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(expense.date)}</span>
                </div>

                {/* Receipt */}
                {expense.receipt && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Receipt className="w-3 h-3" />
                    <span>Receipt attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </Card>
  )
}