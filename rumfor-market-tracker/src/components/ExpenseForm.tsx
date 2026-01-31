import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { DollarSign, Calendar, FileText, Tag, AlertCircle } from 'lucide-react'
import { Expense, ExpenseCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface ExpenseFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingExpense?: Expense | null
  isLoading?: boolean
  marketId: string
}

const categories: { value: ExpenseCategory; label: string; description: string }[] = [
  { value: 'booth-fee', label: 'Booth Fee', description: 'Market booth rental fees' },
  { value: 'transportation', label: 'Transportation', description: 'Gas, parking, rideshare' },
  { value: 'accommodation', label: 'Accommodation', description: 'Hotel, lodging costs' },
  { value: 'supplies', label: 'Supplies', description: 'Display materials, tablecloths' },
  { value: 'equipment', label: 'Equipment', description: 'Tools, machinery rental' },
  { value: 'marketing', label: 'Marketing', description: 'Flyers, business cards, ads' },
  { value: 'food-meals', label: 'Food', description: 'Meals during market events' },
  { value: 'gasoline', label: 'Fuel', description: 'Vehicle fuel costs' },
  { value: 'insurance', label: 'Insurance', description: 'Event or liability insurance' },
  { value: 'miscellaneous', label: 'Other', description: 'Miscellaneous expenses' }
]

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingExpense,
  isLoading = false,
  marketId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'other' as ExpenseCategory,
    date: format(new Date(), 'yyyy-MM-dd'),
    receipt: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        title: editingExpense.title,
        description: editingExpense.description || '',
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        date: format(new Date(editingExpense.date), 'yyyy-MM-dd'),
        receipt: editingExpense.receipt || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: 'other',
        date: format(new Date(), 'yyyy-MM-dd'),
        receipt: ''
      })
    }
    setErrors({})
  }, [editingExpense, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const expenseData = {
      vendorId: 'vendor-1', // This should come from auth store
      marketId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date(formData.date).toISOString(),
      receipt: formData.receipt.trim() || undefined
    }

    onSubmit(expenseData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getCategoryColor = (category: ExpenseCategory) => {
    switch (category) {
      case 'booth-fee': return 'border-purple-300'
      case 'transportation': return 'border-blue-300'
      case 'accommodation': return 'border-indigo-300'
      case 'supplies': return 'border-green-300'
      case 'equipment': return 'border-yellow-300'
      case 'marketing': return 'border-pink-300'
      case 'food-meals': return 'border-orange-300'
      case 'gasoline': return 'border-red-300'
      case 'insurance': return 'border-gray-300'
      default: return 'border-slate-300'
    }
  }

  const formatCurrency = (value: string) => {
    const number = parseFloat(value)
    if (isNaN(number)) return ''
    return number.toFixed(2)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Expense Title *
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Booth fee payment"
            className={cn(
              "w-full",
              errors.title && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            disabled={isLoading}
          />
          {errors.title && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Amount and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', formatCurrency(e.target.value))}
                placeholder="0.00"
                className={cn(
                  "pl-8",
                  errors.amount && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                disabled={isLoading}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Category *
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value as ExpenseCategory)}
              disabled={isLoading}
              options={categories.map(c => ({ value: c.value, label: `${c.label} - ${c.description}` }))}
            />
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {categories.find(c => c.value === formData.category)?.description}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description or notes about this expense"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Date and Receipt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Date *
            </label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className={cn(
                errors.date && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Receipt */}
          <div className="space-y-2">
            <label htmlFor="receipt" className="text-sm font-medium text-gray-700">
              Receipt/File
            </label>
            <Input
              id="receipt"
              value={formData.receipt}
              onChange={(e) => handleInputChange('receipt', e.target.value)}
              placeholder="Receipt filename or description"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Upload receipts separately or reference them here
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {formData.title || 'Expense title'}
              </p>
              <p className="text-xs text-gray-600">
                {formData.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", getCategoryColor(formData.category))}>
                  {categories.find(c => c.value === formData.category)?.label || 'Other'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formData.date ? format(new Date(formData.date), 'MMM dd, yyyy') : 'No date'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {formData.amount ? `$${formatCurrency(formData.amount)}` : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {editingExpense ? 'Updating...' : 'Adding...'}
              </div>
            ) : (
              editingExpense ? 'Update Expense' : 'Add Expense'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}