import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Flag
} from 'lucide-react'
import { Todo } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: <Flag className="w-3 h-3" />
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Flag className="w-3 h-3" />
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: <Flag className="w-3 h-3" />
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertCircle className="w-3 h-3" />
  }
}

const categoryConfig = {
  setup: {
    label: 'Setup',
    color: 'bg-purple-100 text-purple-700'
  },
  products: {
    label: 'Products',
    color: 'bg-green-100 text-green-700'
  },
  marketing: {
    label: 'Marketing',
    color: 'bg-pink-100 text-pink-700'
  },
  logistics: {
    label: 'Logistics',
    color: 'bg-yellow-100 text-yellow-700'
  },
  'post-event': {
    label: 'Post-Event',
    color: 'bg-indigo-100 text-indigo-700'
  }
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const isOverdue = !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
  
  const handleToggle = () => {
    if (!isLoading) {
      onToggle(todo.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(todo)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(todo.id)
  }

  const formatDueDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const formatDueTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm')
    } catch {
      return ''
    }
  }

  const priority = priorityConfig[todo.priority]
  const category = categoryConfig[todo.category as keyof typeof categoryConfig] || {
    label: todo.category,
    color: 'bg-gray-100 text-gray-700'
  }

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md cursor-pointer",
        todo.completed && "opacity-75",
        isOverdue && !todo.completed && "border-red-200 bg-red-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleToggle}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <div className="flex-shrink-0 pt-1">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 rounded animate-pulse" />
          ) : todo.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className={cn(
              "w-5 h-5 transition-colors",
              isOverdue ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium text-sm leading-5",
                todo.completed && "line-through text-gray-500"
              )}>
                {todo.title}
              </h3>
              
              {todo.description && (
                <p className={cn(
                  "text-xs text-gray-600 mt-1 leading-4",
                  todo.completed && "line-through"
                )}>
                  {todo.description}
                </p>
              )}
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

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-3">
            {/* Priority badge */}
            <Badge variant="outline" className={cn("text-xs", priority.color)}>
              {priority.icon}
              <span className="ml-1">{priority.label}</span>
            </Badge>

            {/* Category badge */}
            <Badge variant="outline" className={cn("text-xs", category.color)}>
              {category.label}
            </Badge>

            {/* Due date */}
            {todo.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-red-600" : "text-gray-500"
              )}>
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>{formatDueDate(todo.dueDate)}</span>
                {formatDueTime(todo.dueDate) && (
                  <>
                    <Clock className="w-3 h-3 ml-1" />
                    <span>{formatDueTime(todo.dueDate)}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}