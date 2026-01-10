import { Todo, Expense, ExpenseCategory, ApiResponse, PaginatedResponse } from '@/types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

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

export const trackingApi = {
  // TODO API
  async getTodos(marketId?: string): Promise<PaginatedResponse<Todo>> {
    const queryParams = new URLSearchParams()
    if (marketId) queryParams.append('marketId', marketId)

    const response = await httpClient.get<ApiResponse<PaginatedResponse<Todo>>>(`/todos?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch todos')
    return response.data!
  },

  async createTodo(todo: Omit<Todo, 'id' | 'vendorId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Todo>> {
    const response = await httpClient.post<ApiResponse<Todo>>('/todos', todo)
    if (!response.success) throw new Error(response.error || 'Failed to create todo')
    return response
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<ApiResponse<Todo>> {
    const response = await httpClient.patch<ApiResponse<Todo>>(`/todos/${id}`, updates)
    if (!response.success) throw new Error(response.error || 'Failed to update todo')
    return response
  },

  async deleteTodo(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/todos/${id}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete todo')
    return response
  },

  async getTodoTemplates(category?: string): Promise<ApiResponse<string[]>> {
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
    const queryParams = new URLSearchParams()
    if (marketId) queryParams.append('marketId', marketId)

    const response = await httpClient.get<ApiResponse<PaginatedResponse<Expense>>>(`/expenses?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch expenses')
    return response.data!
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Expense>> {
    const response = await httpClient.post<ApiResponse<Expense>>('/expenses', expense)
    if (!response.success) throw new Error(response.error || 'Failed to create expense')
    return response
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<ApiResponse<Expense>> {
    const response = await httpClient.patch<ApiResponse<Expense>>(`/expenses/${id}`, updates)
    if (!response.success) throw new Error(response.error || 'Failed to update expense')
    return response
  },

  async deleteExpense(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/expenses/${id}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete expense')
    return response
  },

  async getExpenseSummary(marketId?: string): Promise<ApiResponse<{
    totalExpenses: number
    expensesByCategory: Record<ExpenseCategory, number>
    expensesByMonth: Record<string, number>
  }>> {
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

export default trackingApi
