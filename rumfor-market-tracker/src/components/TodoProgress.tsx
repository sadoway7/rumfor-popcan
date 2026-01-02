import React from 'react'
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { Todo } from '@/types'
import { Progress } from '@/components/ui/Progress'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface TodoProgressProps {
  todos: Todo[]
  className?: string
}

interface TodoStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}

export const TodoProgress: React.FC<TodoProgressProps> = ({
  todos,
  className
}) => {
  const stats: TodoStats = React.useMemo(() => {
    const total = todos.length
    const completed = todos.filter(todo => todo.completed).length
    const pending = total - completed
    const now = new Date()
    const overdue = todos.filter(todo => 
      !todo.completed && 
      todo.dueDate && 
      new Date(todo.dueDate) < now
    ).length
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    const byCategory = todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      byCategory,
      byPriority
    }
  }, [todos])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'setup': return 'bg-purple-100 text-purple-700'
      case 'products': return 'bg-green-100 text-green-700'
      case 'marketing': return 'bg-pink-100 text-pink-700'
      case 'logistics': return 'bg-yellow-100 text-yellow-700'
      case 'post-event': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-blue-100 text-blue-700'
      case 'low': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (stats.total === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-gray-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-sm">Create your first todo to start tracking progress</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <Badge variant="outline" className="text-sm">
            {stats.completed} of {stats.total} completed
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium">{Math.round(stats.completionRate)}%</span>
          </div>
          
          <Progress value={stats.completionRate} className="h-2" />
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">{stats.completed}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">{stats.pending}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mx-auto mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">{stats.overdue}</div>
              <div className="text-xs text-gray-500">Overdue</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">By Category</h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(stats.byCategory).map(([category, count]) => {
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-xs", getCategoryColor(category))}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-600">{count} tasks</span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Priority Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">By Priority</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(stats.byPriority).map(([priority, count]) => {
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
            return (
              <div key={priority} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(priority))}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
        <div className="space-y-3">
          {stats.overdue > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {stats.overdue} task{stats.overdue !== 1 ? 's' : ''} overdue
                </p>
                <p className="text-xs text-red-600">
                  Focus on completing overdue tasks to stay on track
                </p>
              </div>
            </div>
          )}
          
          {stats.completionRate >= 80 && stats.total > 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Great progress!
                </p>
                <p className="text-xs text-green-600">
                  You're {Math.round(stats.completionRate)}% complete with your tasks
                </p>
              </div>
            </div>
          )}
          
          {stats.pending > 0 && stats.completionRate < 50 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Keep momentum going
                </p>
                <p className="text-xs text-blue-600">
                  {stats.pending} tasks remaining. Consider prioritizing high-priority items
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}