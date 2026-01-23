import React, { useState, useEffect } from 'react'
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
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {editingTodo ? 'Edit Task' : 'New Task'}
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
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
            <Input
              {...register('title')}
              placeholder="Task title"
              error={errors.title?.message}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <Textarea
              {...register('description')}
              placeholder="Add details..."
              rows={2}
              error={errors.description?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as TodoPriority)}
                options={priorityOptions}
                placeholder="Priority"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
                options={categoryOptions}
                placeholder="Category"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
            <Input
              type="date"
              {...register('dueDate')}
              error={errors.dueDate?.message}
              className="h-10"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10"
            >
              {isSubmitting ? 'Saving...' : (editingTodo ? 'Save' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}