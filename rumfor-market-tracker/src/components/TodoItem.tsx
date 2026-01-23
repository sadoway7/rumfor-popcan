/**
 * @deprecated TodoItem is deprecated. Use the inline TodoCompactItem in VendorTodoList instead.
 * This component is kept for backwards compatibility but will be removed in a future version.
 */
import React from 'react'
import { CheckSquare, Square, Edit, Trash2, AlertCircle } from 'lucide-react'
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
  className?: string
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
  className
}) => {
  const isOverdue = !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
  
  const priorityColors = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <Card className={cn(
      'p-4 transition-all duration-200',
      todo.completed && 'opacity-60',
      isOverdue && 'border-red-200 bg-red-50',
      className
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo.id)}
          className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={todo.completed}
        >
          {todo.completed ? (
            <CheckSquare className="w-5 h-5 text-green-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={cn(
                'font-medium text-gray-900',
                todo.completed && 'line-through text-gray-500'
              )}>
                {todo.title}
              </h3>
              
              {todo.description && (
                <p className={cn(
                  'text-sm text-gray-600 mt-1',
                  todo.completed && 'line-through text-gray-400'
                )}>
                  {todo.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="outline" 
                  className={priorityColors[todo.priority]}
                >
                  {todo.priority}
                </Badge>
                
                {todo.category && (
                  <Badge variant="outline">
                    {todo.category.replace('-', ' ')}
                  </Badge>
                )}
                
                {isOverdue && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Overdue
                  </Badge>
                )}
              </div>
              
              {todo.dueDate && (
                <p className={cn(
                  'text-xs text-gray-500 mt-1',
                  isOverdue && 'text-red-600'
                )}>
                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(todo)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(todo.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
