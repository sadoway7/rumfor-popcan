nimport React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Todo, TodoPriority } from '@/types'

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.string().optional(),
})

type TodoFormData = z.infer<typeof todoSchema>

interface TodoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingTodo?: Todo | null
  marketId: string
}

export const TodoForm: React.FC<TodoFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTodo,
  marketId
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      priority: 'medium',
      category: 'setup'
    }
  })

  // Set form values when editing
  useEffect(() => {
    if (editingTodo) {
      setValue('title', editingTodo.title)
      setValue('description', editingTodo.description || '')
      setValue('priority', editingTodo.priority)
      setValue('category', editingTodo.category)
      setValue('dueDate', editingTodo.dueDate ? new Date(editingTodo.dueDate).toISOString().split('T')[0] : '')
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        category: 'setup',
        dueDate: ''
      })
    }
  }, [editingTodo, setValue, reset])

  const onFormSubmit = async (data: TodoFormData) => {
    setIsSubmitting(true)
    
    try {
      const todoData = {
        vendorId: '', // This will be set by the hook
        marketId,
        title: data.title,
        description: data.description || '',
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        completed: false
      }
      
      await onSubmit(todoData)
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to save todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const categoryOptions = [
    { value: 'setup', label: 'Setup' },
    { value: 'products', label: 'Products' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'post-event', label: 'Post Event' }
  ]

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTodo ? 'Edit Todo' : 'Create New Todo'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              {...register('title')}
              placeholder="Enter todo title"
              error={errors.title?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Optional description"
              rows={3}
              error={errors.description?.message}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <Select
              value={watch('priority')}
              onValueChange={(value) => setValue('priority', value as TodoPriority)}
              options={priorityOptions}
              placeholder="Select priority"
            />
            {errors.priority && (
              <p className="text-sm text-red-600 mt-1">{errors.priority.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
              options={categoryOptions}
              placeholder="Select category"
            />
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="date"
              {...register('dueDate')}
              error={errors.dueDate?.message}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingTodo ? 'Update Todo' : 'Create Todo')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}