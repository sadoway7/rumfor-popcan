import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ArrowLeft, Plus } from 'lucide-react'
import { VendorAggregatedTodoList } from '@/components/VendorAggregatedTodoList'
import { useAllTodos } from '@/features/tracking/hooks/useAllTodos'

export function VendorTodosPage() {
  const { todos } = useAllTodos()
  
  const completedTodos = todos.filter(t => t.completed)
  const overdueCount = todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length
  
  return (
    <div className="px-2 py-2">
      {/* Unified header - Back button, Stats, Add button */}
      <div className="flex items-center justify-between mb-3 min-h-[40px]">
        <Link
          to="/vendor/dashboard"
          className="p-2 rounded-full bg-surface hover:bg-surface-2 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="flex items-center gap-3 flex-1 justify-center">
          {todos.length > 0 && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {completedTodos.length} / {todos.length}
            </span>
          )}
          {overdueCount > 0 && (
            <span className="text-sm text-red-600 font-medium whitespace-nowrap">
              {overdueCount} overdue
            </span>
          )}
        </div>
        
        <Button
          size="sm"
          onClick={() => { }}
          className="h-8 px-3 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Aggregated Todo List - no extra padding, no header */}
      <VendorAggregatedTodoList showHeader={false} />
    </div>
  )
}
