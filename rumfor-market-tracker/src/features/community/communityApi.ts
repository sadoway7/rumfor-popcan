import { ApiResponse, Comment, CommentReaction, Photo, Hashtag, HashtagVote } from '@/types'

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

export const communityApi = {
  // Comments API
  async getComments(marketId: string, page = 1, limit = 20): Promise<ApiResponse<Comment[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    const response = await httpClient.get<ApiResponse<Comment[]>>(`/comments/market/${marketId}?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch comments')
    return response
  },

  async createComment(comment: {
    marketId: string
    content: string
    parentId?: string
  }): Promise<ApiResponse<Comment>> {
    const response = await httpClient.post<ApiResponse<Comment>>('/comments', comment)
    if (!response.success) throw new Error(response.error || 'Failed to create comment')
    return response
  },

  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    const response = await httpClient.patch<ApiResponse<Comment>>(`/comments/${commentId}`, { content })
    if (!response.success) throw new Error(response.error || 'Failed to update comment')
    return response
  },

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/comments/${commentId}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete comment')
    return response
  },

  async addReaction(commentId: string, type: 'like' | 'dislike' | 'love' | 'laugh'): Promise<ApiResponse<CommentReaction>> {
    const response = await httpClient.post<ApiResponse<CommentReaction>>(`/comments/${commentId}/reactions`, { type })
    if (!response.success) throw new Error(response.error || 'Failed to add reaction')
    return response
  },

  async removeReaction(commentId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/comments/${commentId}/reactions`)
    if (!response.success) throw new Error(response.error || 'Failed to remove reaction')
    return response
  },

  // Photos API
  async getPhotos(marketId: string, page = 1, limit = 20): Promise<ApiResponse<Photo[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    const response = await httpClient.get<ApiResponse<Photo[]>>(`/photos/market/${marketId}?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch photos')
    return response
  },

  async uploadPhoto(photo: {
    marketId: string
    file: File
    caption?: string
    tags?: string[]
  }): Promise<ApiResponse<Photo>> {
    const formData = new FormData()
    formData.append('marketId', photo.marketId)
    formData.append('file', photo.file)
    if (photo.caption) formData.append('caption', photo.caption)
    if (photo.tags?.length) formData.append('tags', JSON.stringify(photo.tags))

    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token
      : undefined

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/photos`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to upload photo')
    }

    return await response.json()
  },

  async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/photos/${photoId}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete photo')
    return response
  },

  // Hashtags API
  async getHashtags(marketId: string): Promise<ApiResponse<Hashtag[]>> {
    const response = await httpClient.get<ApiResponse<Hashtag[]>>(`/hashtags/market/${marketId}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch hashtags')
    return response
  },

  async createHashtag(hashtag: {
    marketId: string
    name: string
  }): Promise<ApiResponse<Hashtag>> {
    const response = await httpClient.post<ApiResponse<Hashtag>>('/hashtags', hashtag)
    if (!response.success) throw new Error(response.error || 'Failed to create hashtag')
    return response
  },

  async voteOnHashtag(hashtagId: string, value: number): Promise<ApiResponse<HashtagVote>> {
    const response = await httpClient.post<ApiResponse<HashtagVote>>(`/hashtags/${hashtagId}/vote`, { value })
    if (!response.success) throw new Error(response.error || 'Failed to vote on hashtag')
    return response
  },

  async deleteHashtag(hashtagId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/hashtags/${hashtagId}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete hashtag')
    return response
  },

  // Predefined hashtags for suggestions
  async getPredefinedHashtags(): Promise<ApiResponse<string[]>> {
    const response = await httpClient.get<ApiResponse<string[]>>('/hashtags/predefined')
    if (!response.success) throw new Error(response.error || 'Failed to fetch predefined hashtags')
    return response
  }
}

export default communityApi
