import { ApiResponse } from '@/types'
import { httpClient } from '@/lib/httpClient'

export interface TodoPreset {
  id: string
  user: string
  title: string
  description?: string
  category: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  usageCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface PresetsByCategory {
  system: TodoPreset[]
  user: TodoPreset[]
}

export const presetApi = {
  // Get all presets (grouped by category)
  async getPresets(): Promise<ApiResponse<Record<string, PresetsByCategory>>> {
    const response = await httpClient.get<ApiResponse<Record<string, PresetsByCategory>>>('/todo-presets')
    if (!response.success) throw new Error(response.error || 'Failed to fetch presets')
    return response
  },

  // Get presets for a specific category
  async getPresetsByCategory(category: string): Promise<ApiResponse<PresetsByCategory>> {
    const response = await httpClient.get<ApiResponse<PresetsByCategory>>(`/todo-presets/${category}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch presets')
    return response
  },

  // Create a new user preset
  async createPreset(data: {
    title: string
    description?: string
    category: string
    priority?: 'urgent' | 'high' | 'medium' | 'low'
  }): Promise<ApiResponse<TodoPreset>> {
    const response = await httpClient.post<ApiResponse<TodoPreset>>('/todo-presets', data)
    if (!response.success) throw new Error(response.error || 'Failed to create preset')
    return response
  },

  // Update a preset
  async updatePreset(id: string, data: Partial<TodoPreset>): Promise<ApiResponse<TodoPreset>> {
    const response = await httpClient.patch<ApiResponse<TodoPreset>>(`/todo-presets/${id}`, data)
    if (!response.success) throw new Error(response.error || 'Failed to update preset')
    return response
  },

  // Delete a preset
  async deletePreset(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/todo-presets/${id}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete preset')
    return response
  },

  // Create todo from preset
  async createTodoFromPreset(presetId: string, marketId: string, customizations?: {
    title?: string
    description?: string
    category?: string
    priority?: string
    dueDate?: string
  }): Promise<ApiResponse<any>> {
    const response = await httpClient.post<ApiResponse<any>>('/todo-presets/create-todo', {
      presetId,
      marketId,
      ...customizations
    })
    if (!response.success) throw new Error(response.error || 'Failed to create todo from preset')
    return response
  }
}

export default presetApi
