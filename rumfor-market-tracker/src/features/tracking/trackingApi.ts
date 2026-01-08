import { Todo, Expense, ExpenseCategory, ApiResponse, PaginatedResponse } from '@/types'

// Environment configuration
const isDevelopment = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : true
const isMockMode = typeof process !== 'undefined' ? process.env.VITE_USE_MOCK_API === 'true' : true

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api'

// HTTP client with interceptors
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Add auth token if available
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token
      : null

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || 'Request failed'
        )
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const httpClient = new HttpClient(API_BASE_URL)

// Mock data for development
const mockTodos: Todo[] = [
  {
    id: '1',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Complete vendor application',
    description: 'Fill out all required fields and upload necessary documents',
    completed: false,
    priority: 'high',
    dueDate: '2024-01-15T00:00:00Z',
    category: 'setup',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Design booth layout',
    description: 'Create booth design and layout plan',
    completed: false,
    priority: 'medium',
    dueDate: '2024-01-20T00:00:00Z',
    category: 'setup',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Prepare product inventory',
    description: 'Organize and price all products for the market',
    completed: true,
    priority: 'high',
    dueDate: '2024-01-25T00:00:00Z',
    category: 'products',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Create marketing materials',
    description: 'Design flyers, business cards, and social media content',
    completed: false,
    priority: 'medium',
    dueDate: '2024-01-22T00:00:00Z',
    category: 'marketing',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const mockExpenses: Expense[] = [
  {
    id: '1',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Booth fee payment',
    description: 'Market booth rental fee for January',
    amount: 150.00,
    category: 'booth-fee',
    date: '2024-01-01T00:00:00Z',
    receipt: 'receipt-booth-fee.pdf',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Transportation costs',
    description: 'Gas and parking for market day',
    amount: 25.50,
    category: 'transportation',
    date: '2024-01-05T00:00:00Z',
    receipt: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Display supplies',
    description: 'Table cloth, signage, and display materials',
    amount: 45.75,
    category: 'supplies',
    date: '2024-01-10T00:00:00Z',
    receipt: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    vendorId: 'vendor-1',
    marketId: '1',
    title: 'Business cards',
    description: 'Printing costs for marketing materials',
    amount: 30.00,
    category: 'marketing',
    date: '2024-01-15T00:00:00Z',
    receipt: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Todo templates for common market preparation tasks
const todoTemplates = {
  setup: [
    'Complete vendor application',
    'Review market rules and regulations',
    'Design booth layout',
    'Obtain necessary permits and licenses',
    'Set up payment processing system'
  ],
  products: [
    'Prepare product inventory',
    'Price all products',
    'Organize display materials',
    'Prepare product samples',
    'Update product descriptions'
  ],
  marketing: [
    'Create marketing materials',
    'Post on social media',
    'Design promotional flyers',
    'Contact local media',
    'Update business website'
  ],
  logistics: [
    'Arrange transportation',
    'Prepare equipment and tools',
    'Pack display materials',
    'Plan booth setup/breakdown',
    'Confirm accommodation if needed'
  ],
  'post-event': [
    'Clean up booth area',
    'Process payments',
    'Follow up with customers',
    'Review sales performance',
    'Plan for next market'
  ]
}

// API simulation delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const trackingApi = {
  // TODO API
  async getTodos(marketId?: string): Promise<PaginatedResponse<Todo>> {
    if (isDevelopment && isMockMode) {
      await delay(100)

      let todos = [...mockTodos]
      if (marketId) {
        todos = todos.filter(todo => todo.marketId === marketId)
      }

      return {
        data: todos,
        pagination: {
          page: 1,
          limit: 50,
          total: todos.length,
          totalPages: 1
        }
      }
    } else {
      const queryParams = new URLSearchParams()
      if (marketId) queryParams.append('marketId', marketId)

      const response = await httpClient.get<ApiResponse<PaginatedResponse<Todo>>>(`/todos?${queryParams}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch todos')
      return response.data!
    }
  },

  async createTodo(todo: Omit<Todo, 'id' | 'vendorId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Todo>> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      const newTodo: Todo = {
        ...todo,
        vendorId: 'vendor-1', // Mock vendor ID
        id: `todo-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockTodos.push(newTodo)

      return {
        success: true,
        data: newTodo
      }
    } else {
      const response = await httpClient.post<ApiResponse<Todo>>('/todos', todo)
      if (!response.success) throw new Error(response.error || 'Failed to create todo')
      return response
    }
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<ApiResponse<Todo>> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      const todoIndex = mockTodos.findIndex(t => t.id === id)
      if (todoIndex === -1) {
        return {
          success: false,
          error: 'Todo not found'
        }
      }

      mockTodos[todoIndex] = {
        ...mockTodos[todoIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      return {
        success: true,
        data: mockTodos[todoIndex]
      }
    } else {
      const response = await httpClient.patch<ApiResponse<Todo>>(`/todos/${id}`, updates)
      if (!response.success) throw new Error(response.error || 'Failed to update todo')
      return response
    }
  },

  async deleteTodo(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    if (isDevelopment && isMockMode) {
      await delay(200)

      const todoIndex = mockTodos.findIndex(t => t.id === id)
      if (todoIndex === -1) {
        return {
          success: false,
          error: 'Todo not found'
        }
      }

      mockTodos.splice(todoIndex, 1)

      return {
        success: true,
        data: { deleted: true }
      }
    } else {
      const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/todos/${id}`)
      if (!response.success) throw new Error(response.error || 'Failed to delete todo')
      return response
    }
  },

  async getTodoTemplates(category?: string): Promise<ApiResponse<string[]>> {
    await delay(200)
    
    if (category && todoTemplates[category as keyof typeof todoTemplates]) {
      return {
        success: true,
        data: todoTemplates[category as keyof typeof todoTemplates]
      }
    }
    
    return {
      success: true,
      data: Object.values(todoTemplates).flat()
    }
  },

  // EXPENSE API
  async getExpenses(marketId?: string): Promise<PaginatedResponse<Expense>> {
    if (isDevelopment && isMockMode) {
      await delay(100)

      let expenses = [...mockExpenses]
      if (marketId) {
        expenses = expenses.filter(expense => expense.marketId === marketId)
      }

      return {
        data: expenses,
        pagination: {
          page: 1,
          limit: 50,
          total: expenses.length,
          totalPages: 1
        }
      }
    } else {
      const queryParams = new URLSearchParams()
      if (marketId) queryParams.append('marketId', marketId)

      const response = await httpClient.get<ApiResponse<PaginatedResponse<Expense>>>(`/expenses?${queryParams}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch expenses')
      return response.data!
    }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Expense>> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      const newExpense: Expense = {
        ...expense,
        id: `expense-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockExpenses.push(newExpense)

      return {
        success: true,
        data: newExpense
      }
    } else {
      const response = await httpClient.post<ApiResponse<Expense>>('/expenses', expense)
      if (!response.success) throw new Error(response.error || 'Failed to create expense')
      return response
    }
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<ApiResponse<Expense>> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      const expenseIndex = mockExpenses.findIndex(e => e.id === id)
      if (expenseIndex === -1) {
        return {
          success: false,
          error: 'Expense not found'
        }
      }

      mockExpenses[expenseIndex] = {
        ...mockExpenses[expenseIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      return {
        success: true,
        data: mockExpenses[expenseIndex]
      }
    } else {
      const response = await httpClient.patch<ApiResponse<Expense>>(`/expenses/${id}`, updates)
      if (!response.success) throw new Error(response.error || 'Failed to update expense')
      return response
    }
  },

  async deleteExpense(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    if (isDevelopment && isMockMode) {
      await delay(200)

      const expenseIndex = mockExpenses.findIndex(e => e.id === id)
      if (expenseIndex === -1) {
        return {
          success: false,
          error: 'Expense not found'
        }
      }

      mockExpenses.splice(expenseIndex, 1)

      return {
        success: true,
        data: { deleted: true }
      }
    } else {
      const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/expenses/${id}`)
      if (!response.success) throw new Error(response.error || 'Failed to delete expense')
      return response
    }
  },

  async getExpenseSummary(vendorId: string, marketId?: string): Promise<ApiResponse<{
    totalExpenses: number
    expensesByCategory: Record<ExpenseCategory, number>
    expensesByMonth: Record<string, number>
  }>> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      let expenses = mockExpenses.filter(expense => expense.vendorId === vendorId)
      if (marketId) {
        expenses = expenses.filter(expense => expense.marketId === marketId)
      }

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

      const expensesByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<ExpenseCategory, number>)

      const expensesByMonth = expenses.reduce((acc, expense) => {
        const month = new Date(expense.date).toISOString().slice(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

      return {
        success: true,
        data: {
          totalExpenses,
          expensesByCategory,
          expensesByMonth
        }
      }
    } else {
      const queryParams = new URLSearchParams()
      if (marketId) queryParams.append('marketId', marketId)

      const response = await httpClient.get<ApiResponse<{
        totalExpenses: number
        expensesByCategory: Record<ExpenseCategory, number>
        expensesByMonth: Record<string, number>
      }>>(`/expenses/market/${marketId || '0'}/summary`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch expense summary')
      return response
    }
  }
}