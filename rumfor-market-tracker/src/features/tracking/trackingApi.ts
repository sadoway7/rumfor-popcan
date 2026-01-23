import { Todo, Expense, ExpenseCategory, ApiResponse, PaginatedResponse } from '@/types'
import { httpClient } from '@/lib/httpClient'

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
  async getTodos(marketId?: string): Promise<Todo[]> {
    const queryParams = new URLSearchParams()
    if (marketId) queryParams.append('marketId', marketId)

    const response = await httpClient.get<ApiResponse<{ todos: Todo[]; pagination: any }>>(`/todos?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch todos')
    return response.data?.todos || []
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
