import React from 'react'
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { Todo } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface TodoProgressProps {
  todos: Todo[]
  className?: string
}

export const TodoProgress: React.FC<TodoProgressProps> = ({
  todos,
  className
}) => {
  const completed = todos.filter(todo => todo.completed).length
  const pending = todos.length - completed
  const overdue = todos.filter(todo => 
    !todo.completed && 
    todo.dueDate && 
    new Date(todo.dueDate) < new Date()
  ).length

  if (todos.length === 0) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-muted" />
        <p className="text-sm text-muted-foreground">No tasks to track</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <p className="text-lg font-bold">{completed}</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </Card>
        
        <Card className="p-3 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
          <p className="text-lg font-bold">{pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </Card>
        
        <Card className={cn(
          "p-3 text-center",
          overdue > 0 && "border-red-200 bg-red-50"
        )}>
          <AlertCircle className={cn(
            "w-5 h-5 mx-auto mb-1",
            overdue > 0 ? "text-red-600" : "text-muted"
          )} />
          <p className="text-lg font-bold">{overdue}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </Card>
      </div>

      {/* Category pills */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Categories</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(
            todos.reduce((acc, todo) => {
              acc[todo.category] = (acc[todo.category] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          ).map(([category, count]) => (
            <Badge key={category} variant="outline" className="text-xs">
              {category.replace('-', ' ')} ({count})
            </Badge>
          ))}
        </div>
      </Card>

      {/* Insights */}
      {overdue > 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            {overdue} overdue task{overdue !== 1 ? 's' : ''} - focus on these first
          </p>
        </div>
      )}
    </div>
  )
}
