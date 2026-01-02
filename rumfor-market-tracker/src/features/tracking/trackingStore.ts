import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Todo, Expense, ExpenseCategory, TodoPriority } from '@/types'

interface TrackingState {
  // Todo state
  todos: Todo[]
  todoTemplates: string[]
  
  // Expense state
  expenses: Expense[]
  expenseSummary: {
    totalExpenses: number
    expensesByCategory: Record<ExpenseCategory, number>
    expensesByMonth: Record<string, number>
  } | null
  
  // Loading states
  isLoadingTodos: boolean
  isLoadingExpenses: boolean
  isCreatingTodo: boolean
  isCreatingExpense: boolean
  isUpdatingTodo: boolean
  isUpdatingExpense: boolean
  
  // Error states
  todosError: string | null
  expensesError: string | null
  
  // Actions - Todos
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  removeTodo: (id: string) => void
  toggleTodo: (id: string) => void
  setTodoTemplates: (templates: string[]) => void
  
  // Actions - Expenses
  setExpenses: (expenses: Expense[]) => void
  addExpense: (expense: Expense) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  removeExpense: (id: string) => void
  setExpenseSummary: (summary: TrackingState['expenseSummary']) => void
  
  // Actions - Loading
  setLoadingTodos: (loading: boolean) => void
  setLoadingExpenses: (loading: boolean) => void
  setCreatingTodo: (loading: boolean) => void
  setCreatingExpense: (loading: boolean) => void
  setUpdatingTodo: (loading: boolean) => void
  setUpdatingExpense: (loading: boolean) => void
  
  // Actions - Errors
  setTodosError: (error: string | null) => void
  setExpensesError: (error: string | null) => void
  
  // Computed getters
  getTodosByMarket: (marketId: string) => Todo[]
  getTodosByCategory: (category: string) => Todo[]
  getTodosByPriority: (priority: TodoPriority) => Todo[]
  getCompletedTodos: () => Todo[]
  getPendingTodos: () => Todo[]
  getOverdueTodos: () => Todo[]
  
  getExpensesByMarket: (marketId: string) => Expense[]
  getExpensesByCategory: (category: ExpenseCategory) => Expense[]
  getExpensesByDateRange: (startDate: string, endDate: string) => Expense[]
  
  // Statistics
  getTodoStats: () => {
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
  }
  
  getExpenseStats: () => {
    total: number
    byCategory: Record<ExpenseCategory, number>
    averagePerMarket: number
  }
}

export const useTrackingStore = create<TrackingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      todos: [],
      todoTemplates: [],
      expenses: [],
      expenseSummary: null,
      
      // Loading states
      isLoadingTodos: false,
      isLoadingExpenses: false,
      isCreatingTodo: false,
      isCreatingExpense: false,
      isUpdatingTodo: false,
      isUpdatingExpense: false,
      
      // Error states
      todosError: null,
      expensesError: null,

      // Todo actions
      setTodos: (todos) => set({ todos }),
      
      addTodo: (todo) => set((state) => ({
        todos: [todo, ...state.todos]
      })),
      
      updateTodo: (id, updates) => set((state) => ({
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, ...updates } : todo
        )
      })),
      
      removeTodo: (id) => set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id)
      })),
      
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      })),
      
      setTodoTemplates: (templates) => set({ todoTemplates: templates }),

      // Expense actions
      setExpenses: (expenses) => set({ expenses }),
      
      addExpense: (expense) => set((state) => ({
        expenses: [expense, ...state.expenses]
      })),
      
      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map(expense =>
          expense.id === id ? { ...expense, ...updates } : expense
        )
      })),
      
      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id)
      })),
      
      setExpenseSummary: (summary) => set({ expenseSummary: summary }),

      // Loading actions
      setLoadingTodos: (loading) => set({ isLoadingTodos: loading }),
      setLoadingExpenses: (loading) => set({ isLoadingExpenses: loading }),
      setCreatingTodo: (loading) => set({ isCreatingTodo: loading }),
      setCreatingExpense: (loading) => set({ isCreatingExpense: loading }),
      setUpdatingTodo: (loading) => set({ isUpdatingTodo: loading }),
      setUpdatingExpense: (loading) => set({ isUpdatingExpense: loading }),

      // Error actions
      setTodosError: (error) => set({ todosError: error }),
      setExpensesError: (error) => set({ expensesError: error }),

      // Computed getters
      getTodosByMarket: (marketId) => {
        const { todos } = get()
        return todos.filter(todo => todo.marketId === marketId)
      },
      
      getTodosByCategory: (category) => {
        const { todos } = get()
        return todos.filter(todo => todo.category === category)
      },
      
      getTodosByPriority: (priority) => {
        const { todos } = get()
        return todos.filter(todo => todo.priority === priority)
      },
      
      getCompletedTodos: () => {
        const { todos } = get()
        return todos.filter(todo => todo.completed)
      },
      
      getPendingTodos: () => {
        const { todos } = get()
        return todos.filter(todo => !todo.completed)
      },
      
      getOverdueTodos: () => {
        const { todos } = get()
        const now = new Date()
        return todos.filter(todo => 
          !todo.completed && 
          todo.dueDate && 
          new Date(todo.dueDate) < now
        )
      },
      
      getExpensesByMarket: (marketId) => {
        const { expenses } = get()
        return expenses.filter(expense => expense.marketId === marketId)
      },
      
      getExpensesByCategory: (category) => {
        const { expenses } = get()
        return expenses.filter(expense => expense.category === category)
      },
      
      getExpensesByDateRange: (startDate, endDate) => {
        const { expenses } = get()
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate)
        })
      },

      // Statistics
      getTodoStats: () => {
        const { todos } = get()
        const total = todos.length
        const completed = todos.filter(todo => todo.completed).length
        const pending = total - completed
        const overdue = get().getOverdueTodos().length
        const completionRate = total > 0 ? (completed / total) * 100 : 0
        
        return {
          total,
          completed,
          pending,
          overdue,
          completionRate
        }
      },
      
      getExpenseStats: () => {
        const { expenses } = get()
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        
        const byCategory = expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount
          return acc
        }, {} as Record<ExpenseCategory, number>)
        
        const markets = new Set(expenses.map(e => e.marketId))
        const averagePerMarket = markets.size > 0 ? total / markets.size : 0
        
        return {
          total,
          byCategory,
          averagePerMarket
        }
      }
    }),
    {
      name: 'tracking-store'
    }
  )
)