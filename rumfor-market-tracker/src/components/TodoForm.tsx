import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Tag, AlertCircle } from 'lucide-react'
import { Todo, TodoPriority } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface TodoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingTodo?: Todo | null
  isLoading?: boolean
  marketId: string
}

const priorities: { value: TodoPriority; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Can be done anytime' },
  { value: 'medium', label: 'Medium', description: 'Should be done soon' },
  { value: 'high', label: 'High', description: 'Important for market success' },
  { value: 'urgent', label: 'Urgent', description: 'Needs immediate attention' }
]

const categories = [
  { value: 'setup', label: 'Setup', description: 'Initial preparation and planning' },
  { value: 'products', label: 'Products', description: 'Product preparation and inventory' },
  { value: 'marketing', label: 'Marketing', description: 'Promotional activities' },
  { value: 'logistics', label: 'Logistics', description: 'Transportation and setup' },
  { value: 'post-event', label: 'Post-Event', description: 'Cleanup and follow-up' }
]

export const TodoForm: React.FC<TodoFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTodo,
  isLoading = false,
  marketId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    category: 'setup',
    dueDate: '',
    dueTime: '',
    completed: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (editingTodo) {
      const dueDate = editingTodo.dueDate ? new Date(editingTodo.dueDate) : null
      setFormData({
        title: editingTodo.title,
        description: editingTodo.description || '',
        priority: editingTodo.priority,
        category: editingTodo.category,
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : '',
        dueTime: dueDate ? format(dueDate, 'HH:mm') : '',
        completed: editingTodo.completed
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'setup',
        dueDate: '',
        dueTime: '',
        completed: false
      })
    }
    setErrors({})
  }, [editingTodo, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.dueDate && formData.dueTime) {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`)
      if (dueDateTime < new Date()) {
        newErrors.dueDate = 'Due date cannot be in the past'
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

    let dueDateISO: string | undefined
    if (formData.dueDate && formData.dueTime) {
      dueDateISO = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString()
    } else if (formData.dueDate) {
      dueDateISO = new Date(`${formData.dueDate}T23:59:59`).toISOString()
    }

    const todoData = {
      vendorId: 'vendor-1', // This should come from auth store
      marketId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      category: formData.category,
      dueDate: dueDateISO,
      completed: formData.completed
    }

    onSubmit(todoData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case 'low': return 'border-gray-300'
      case 'medium': return 'border-blue-300'
      case 'high': return 'border-orange-300'
      case 'urgent': return 'border-red-300'
      default: return 'border-gray-300'
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editingTodo ? 'Edit Todo' : 'Create New Todo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Title *
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter todo title"
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

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description or notes"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Priority and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Priority *
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange('priority', value as TodoPriority)}
              disabled={isLoading}
              options={priorities.map(p => ({ value: p.value, label: `${p.label} - ${p.description}` }))}
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(formData.priority))}>
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Category *
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
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

        {/* Due Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Due Date */}
          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Due Date
            </label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              disabled={isLoading}
              className={cn(
                errors.dueDate && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Due Time */}
          <div className="space-y-2">
            <label htmlFor="dueTime" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Due Time
            </label>
            <Input
              id="dueTime"
              type="time"
              value={formData.dueTime}
              onChange={(e) => handleInputChange('dueTime', e.target.value)}
              disabled={!formData.dueDate || isLoading}
            />
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
                {editingTodo ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              editingTodo ? 'Update Todo' : 'Create Todo'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}