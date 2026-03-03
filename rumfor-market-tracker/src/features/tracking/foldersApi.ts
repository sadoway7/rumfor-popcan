import { PlanningFolder, CreateFolderData, UpdateFolderData, ApiResponse } from '@/types'
import { httpClient } from '@/lib/httpClient'

export const foldersApi = {
  async getFolders(marketId: string): Promise<PlanningFolder[]> {
    const response = await httpClient.get<ApiResponse<{ folders: PlanningFolder[] }>>(`/folders?marketId=${marketId}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch folders')
    return response.data?.folders || []
  },

  async createFolder(data: CreateFolderData): Promise<PlanningFolder> {
    const response = await httpClient.post<ApiResponse<{ folder: PlanningFolder }>>('/folders', data)
    if (!response.success) throw new Error(response.error || 'Failed to create folder')
    return response.data!.folder
  },

  async updateFolder(id: string, data: UpdateFolderData): Promise<PlanningFolder> {
    const response = await httpClient.patch<ApiResponse<{ folder: PlanningFolder }>>(`/folders/${id}`, data)
    if (!response.success) throw new Error(response.error || 'Failed to update folder')
    return response.data!.folder
  },

  async deleteFolder(id: string, moveItemsTo?: string | null): Promise<void> {
    const params = moveItemsTo !== undefined ? `?moveItemsTo=${moveItemsTo || 'root'}` : ''
    const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/folders/${id}${params}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete folder')
  },

  async reorderFolders(marketId: string, folderIds: string[]): Promise<void> {
    const response = await httpClient.post<ApiResponse<{ reordered: boolean }>>('/folders/reorder', {
      marketId,
      folderIds
    })
    if (!response.success) throw new Error(response.error || 'Failed to reorder folders')
  },

  async moveItemToFolder(itemId: string, itemType: 'todo' | 'expense', folderId: string | null): Promise<void> {
    const response = await httpClient.post<ApiResponse<{ moved: boolean }>>('/folders/move-item', {
      itemId,
      itemType,
      folderId
    })
    if (!response.success) throw new Error(response.error || 'Failed to move item')
  }
}

export default foldersApi
