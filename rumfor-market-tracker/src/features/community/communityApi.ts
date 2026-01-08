import { ApiResponse, Comment, CommentReaction, Photo, Hashtag, HashtagVote, UserRole } from '@/types'

// Environment configuration
const isDevelopment = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : true
const isMockMode = typeof process !== 'undefined' ? process.env.VITE_USE_MOCK_API === 'true' : true

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api'

// API simulation delay (reduced for better UX)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

// Mock data for development
const mockComments: Comment[] = [
  {
    id: '1',
    marketId: 'market-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      role: 'vendor',
      avatar: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    content: 'Great market! Had an amazing experience selling my handmade jewelry here last weekend. The organizers were very helpful.',
    parentId: undefined,
    replies: [],
    reactions: [
      { id: 'r1', userId: 'user-3', type: 'like', createdAt: '2024-01-01T12:00:00Z' },
      { id: 'r2', userId: 'user-4', type: 'love', createdAt: '2024-01-01T13:00:00Z' }
    ],
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z'
  }
]

const mockPhotos: Photo[] = [
  {
    id: 'photo-1',
    marketId: 'market-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      role: 'vendor',
      avatar: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
    caption: 'Beautiful array of fresh produce at the morning market',
    tags: ['produce', 'fresh', 'vegetables'],
    isApproved: true,
    takenAt: '2024-01-01T08:00:00Z',
    createdAt: '2024-01-01T09:30:00Z'
  }
]

const mockHashtags: Hashtag[] = [
  {
    id: 'hashtag-1',
    name: 'organic',
    marketId: 'market-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      role: 'vendor',
      avatar: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    votes: [
      { id: 'hv1', userId: 'user-2', value: 1, createdAt: '2024-01-01T10:00:00Z' },
      { id: 'hv2', userId: 'user-3', value: 1, createdAt: '2024-01-01T11:00:00Z' }
    ],
    createdAt: '2024-01-01T09:00:00Z'
  }
]

export const communityApi = {
  // Comments API
  async getComments(marketId: string, page = 1, limit = 20): Promise<ApiResponse<Comment[]>> {
    if (isDevelopment && isMockMode) {
      await delay(100) // Reduced delay for better UX

      const filteredComments = mockComments.filter(comment => comment.marketId === marketId)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedComments = filteredComments.slice(startIndex, endIndex)

      return {
        success: true,
        data: paginatedComments,
        message: 'Comments retrieved successfully'
      }
    } else {
      // Real API
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      const response = await httpClient.get<ApiResponse<Comment[]>>(`/comments/market/${marketId}?${queryParams}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch comments')
      return response
    }
  },

  async createComment(comment: {
    marketId: string
    content: string
    parentId?: string
  }): Promise<ApiResponse<Comment>> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      // Mock user - in real app this would come from auth
      const mockUser = {
        id: 'user-1',
        firstName: 'Current',
        lastName: 'User',
        email: 'current@example.com',
        role: 'vendor' as UserRole,
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEmailVerified: true,
        isActive: true
      }

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        marketId: comment.marketId,
        userId: mockUser.id,
        user: mockUser,
        content: comment.content,
        parentId: comment.parentId,
        replies: [],
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockComments.unshift(newComment)

      return {
        success: true,
        data: newComment,
        message: 'Comment created successfully'
      }
    } else {
      // Real API
      const response = await httpClient.post<ApiResponse<Comment>>('/comments', comment)
      if (!response.success) throw new Error(response.error || 'Failed to create comment')
      return response
    }
  },

  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    if (isDevelopment && isMockMode) {
      await delay(80)

      // Find and update comment
      const comment = mockComments.find(c => c.id === commentId)
      if (!comment) {
        return {
          success: false,
          error: 'Comment not found'
        }
      }

      comment.content = content
      comment.updatedAt = new Date().toISOString()

      return {
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      }
    } else {
      // Real API
      const response = await httpClient.patch<ApiResponse<Comment>>(`/comments/${commentId}`, { content })
      if (!response.success) throw new Error(response.error || 'Failed to update comment')
      return response
    }
  },

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    await delay(300)
    
    const index = mockComments.findIndex(c => c.id === commentId)
    if (index === -1) {
      return {
        success: false,
        error: 'Comment not found'
      }
    }
    
    mockComments.splice(index, 1)
    
    return {
      success: true,
      message: 'Comment deleted successfully'
    }
  },

  async addReaction(commentId: string, type: 'like' | 'dislike' | 'love' | 'laugh'): Promise<ApiResponse<CommentReaction>> {
    await delay(200)
    
    const comment = mockComments.find(c => c.id === commentId)
    if (!comment) {
      return {
        success: false,
        error: 'Comment not found'
      }
    }
    
    // Remove existing reaction from same user if any
    comment.reactions = comment.reactions.filter(r => r.userId !== 'user-1')
    
    const newReaction: CommentReaction = {
      id: `reaction-${Date.now()}`,
      userId: 'user-1',
      type,
      createdAt: new Date().toISOString()
    }
    
    comment.reactions.push(newReaction)
    
    return {
      success: true,
      data: newReaction,
      message: 'Reaction added successfully'
    }
  },

  async removeReaction(commentId: string): Promise<ApiResponse<void>> {
    await delay(200)
    
    const comment = mockComments.find(c => c.id === commentId)
    if (!comment) {
      return {
        success: false,
        error: 'Comment not found'
      }
    }
    
    comment.reactions = comment.reactions.filter(r => r.userId !== 'user-1')
    
    return {
      success: true,
      message: 'Reaction removed successfully'
    }
  },

  // Photos API
  async getPhotos(marketId: string, page = 1, limit = 20): Promise<ApiResponse<Photo[]>> {
    if (isDevelopment && isMockMode) {
      await delay(100) // Reduced delay for better UX

      const filteredPhotos = mockPhotos.filter(photo => photo.marketId === marketId)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPhotos = filteredPhotos.slice(startIndex, endIndex)

      return {
        success: true,
        data: paginatedPhotos,
        message: 'Photos retrieved successfully'
      }
    } else {
      // Real API
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      const response = await httpClient.get<ApiResponse<Photo[]>>(`/photos/market/${marketId}?${queryParams}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch photos')
      return response
    }
  },

  async uploadPhoto(photo: {
    marketId: string
    file: File
    caption?: string
    tags?: string[]
  }): Promise<ApiResponse<Photo>> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      // Mock user - in real app this would come from auth
      const mockUser = {
        id: 'user-1',
        firstName: 'Current',
        lastName: 'User',
        email: 'current@example.com',
        role: 'vendor' as UserRole,
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEmailVerified: true,
        isActive: true
      }

      const newPhoto: Photo = {
        id: `photo-${Date.now()}`,
        marketId: photo.marketId,
        userId: mockUser.id,
        user: mockUser,
        url: URL.createObjectURL(photo.file),
        thumbnailUrl: URL.createObjectURL(photo.file),
        caption: photo.caption,
        tags: photo.tags || [],
        isApproved: true, // Auto-approve for demo
        takenAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      mockPhotos.unshift(newPhoto)

      return {
        success: true,
        data: newPhoto,
        message: 'Photo uploaded successfully'
      }
    } else {
      // Real API - For file upload, we'll need FormData
      const formData = new FormData()
      formData.append('marketId', photo.marketId)
      formData.append('file', photo.file)
      if (photo.caption) formData.append('caption', photo.caption)
      if (photo.tags?.length) formData.append('tags', JSON.stringify(photo.tags))

      try {
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
      } catch (error) {
        throw error
      }
    }
  },

  async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    if (isDevelopment && isMockMode) {
      await delay(80)

      const index = mockPhotos.findIndex(p => p.id === photoId)
      if (index === -1) {
        return {
          success: false,
          error: 'Photo not found'
        }
      }

      mockPhotos.splice(index, 1)

      return {
        success: true,
        message: 'Photo deleted successfully'
      }
    } else {
      // Real API
      const response = await httpClient.delete<ApiResponse<void>>(`/photos/${photoId}`)
      if (!response.success) throw new Error(response.error || 'Failed to delete photo')
      return response
    }
  },

  // Hashtags API
  async getHashtags(marketId: string): Promise<ApiResponse<Hashtag[]>> {
    await delay(300)
    
    const filteredHashtags = mockHashtags.filter(hashtag => hashtag.marketId === marketId)
    // Sort by vote count (highest first)
    filteredHashtags.sort((a, b) => b.votes.length - a.votes.length)
    
    return {
      success: true,
      data: filteredHashtags,
      message: 'Hashtags retrieved successfully'
    }
  },

  async createHashtag(hashtag: {
    marketId: string
    name: string
  }): Promise<ApiResponse<Hashtag>> {
    await delay(300)
    
    // Mock user - in real app this would come from auth
    const mockUser = {
      id: 'user-1',
      firstName: 'Current',
      lastName: 'User',
      email: 'current@example.com',
      role: 'vendor' as UserRole,
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEmailVerified: true,
      isActive: true
    }
    
    const newHashtag: Hashtag = {
      id: `hashtag-${Date.now()}`,
      marketId: hashtag.marketId,
      userId: mockUser.id,
      user: mockUser,
      name: hashtag.name.toLowerCase().replace(/\s+/g, '-'),
      votes: [],
      createdAt: new Date().toISOString()
    }
    
    mockHashtags.push(newHashtag)
    
    return {
      success: true,
      data: newHashtag,
      message: 'Hashtag created successfully'
    }
  },

  async voteOnHashtag(hashtagId: string, value: number): Promise<ApiResponse<HashtagVote>> {
    await delay(200)
    
    const hashtag = mockHashtags.find(h => h.id === hashtagId)
    if (!hashtag) {
      return {
        success: false,
        error: 'Hashtag not found'
      }
    }
    
    // Remove existing vote if any
    hashtag.votes = hashtag.votes.filter(v => v.userId !== 'user-1')
    
    // Add new vote if value is not 0
    if (value !== 0) {
      const newVote: HashtagVote = {
        id: `vote-${Date.now()}`,
        userId: 'user-1',
        value,
        createdAt: new Date().toISOString()
      }
      
      hashtag.votes.push(newVote)
      
      return {
        success: true,
        data: newVote,
        message: 'Vote recorded successfully'
      }
    }
    
    return {
      success: true,
      data: { id: '', userId: '', value: 0, createdAt: new Date().toISOString() },
      message: 'Vote removed successfully'
    }
  },

  async deleteHashtag(hashtagId: string): Promise<ApiResponse<void>> {
    await delay(300)
    
    const index = mockHashtags.findIndex(h => h.id === hashtagId)
    if (index === -1) {
      return {
        success: false,
        error: 'Hashtag not found'
      }
    }
    
    mockHashtags.splice(index, 1)
    
    return {
      success: true,
      message: 'Hashtag deleted successfully'
    }
  },

  // Predefined hashtags for suggestions
  async getPredefinedHashtags(): Promise<ApiResponse<string[]>> {
    await delay(200)
    
    const predefinedHashtags = [
      'organic', 'local', 'fresh', 'handmade', 'artisan', 'seasonal',
      'sustainable', 'eco-friendly', 'family-friendly', 'pet-friendly',
      'food-truck', 'live-music', 'outdoor', 'indoor', 'weekend',
      'farm-fresh', 'crafts', 'produce', 'baked-goods', 'homegrown'
    ]
    
    return {
      success: true,
      data: predefinedHashtags,
      message: 'Predefined hashtags retrieved successfully'
    }
  }
}

export default communityApi