import { ApiResponse, Comment, CommentReaction, Photo, Hashtag, HashtagVote, User } from '@/types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

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

const mapUser = (user: any): User => ({
  id: user?._id || user?.id || '',
  email: user?.email || '',
  firstName: user?.profile?.firstName || user?.firstName || '',
  lastName: user?.profile?.lastName || user?.lastName || '',
  role: user?.role || 'visitor',
  avatar: user?.profile?.avatar || user?.avatar,
  createdAt: user?.createdAt || new Date().toISOString(),
  updatedAt: user?.updatedAt || new Date().toISOString(),
  isEmailVerified: user?.isEmailVerified ?? false,
  isActive: user?.isActive ?? true,
})

const mapCommentReaction = (reaction: any): CommentReaction => ({
  id: reaction?._id || reaction?.id || '',
  userId: reaction?.user || reaction?.userId || '',
  type: reaction?.type || 'like',
  createdAt: reaction?.createdAt || new Date().toISOString(),
})

const mapComment = (comment: any, marketId: string): Comment => ({
  id: comment?._id || comment?.id || '',
  marketId: comment?.market || marketId,
  userId: comment?.author?._id || comment?.author?.id || comment?.userId || '',
  user: mapUser(comment?.author || comment?.user || {}),
  content: comment?.content || '',
  parentId: comment?.parentId || comment?.parent || undefined,
  replies: Array.isArray(comment?.replies)
    ? comment.replies
        .map((reply: any) => {
          if (!reply || typeof reply === 'string') {
            return null
          }
          return mapComment(reply, marketId)
        })
        .filter(Boolean) as Comment[]
    : [],
  reactions: Array.isArray(comment?.reactions)
    ? comment.reactions.map(mapCommentReaction)
    : [],
  createdAt: comment?.createdAt || new Date().toISOString(),
  updatedAt: comment?.updatedAt || comment?.createdAt || new Date().toISOString(),
})

const mapPhoto = (photo: any, marketId: string): Photo => ({
  id: photo?._id || photo?.id || '',
  marketId: photo?.market || marketId,
  userId: photo?.uploadedBy?._id || photo?.uploadedBy?.id || photo?.userId || '',
  user: mapUser(photo?.uploadedBy || photo?.user || {}),
  url: photo?.imageUrl || photo?.url || photo?.filename || '',
  thumbnailUrl: photo?.thumbnailUrl || photo?.imageUrl || photo?.url || photo?.filename || '',
  caption: photo?.caption || '',
  tags: Array.isArray(photo?.tags) ? photo.tags : [],
  isApproved: photo?.approved ?? photo?.isApproved ?? photo?.moderation?.isApproved ?? true,
  takenAt: photo?.takenAt || undefined,
  createdAt: photo?.createdAt || new Date().toISOString(),
})

const mapHashtagVote = (vote: any): HashtagVote => ({
  id: vote?._id || vote?.id || '',
  userId: vote?.userId || vote?.user || '',
  value: vote?.vote === 'down' ? -1 : vote?.value === -1 ? -1 : 1,
  createdAt: vote?.timestamp || vote?.createdAt || new Date().toISOString(),
})

const mapHashtag = (hashtag: any, marketId: string): Hashtag => ({
  id: hashtag?._id || hashtag?.id || '',
  name: hashtag?.text || hashtag?.name || '',
  marketId: hashtag?.marketId || marketId,
  userId: hashtag?.suggestedBy?._id || hashtag?.suggestedBy?.id || hashtag?.userId || '',
  user: mapUser(hashtag?.suggestedBy || hashtag?.user || {}),
  votes: Array.isArray(hashtag?.voters)
    ? hashtag.voters.map(mapHashtagVote)
    : Array.isArray(hashtag?.votes)
      ? hashtag.votes.map(mapHashtagVote)
      : [],
  createdAt: hashtag?.createdAt || new Date().toISOString(),
})

export const communityApi = {
  // Comments API
  async getComments(marketId: string, page = 1, limit = 20): Promise<ApiResponse<Comment[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    const response = await httpClient.get<ApiResponse<{ comments: any[] }>>(`/comments/market/${marketId}?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch comments')
    const comments = response.data?.comments || []
    return { ...response, data: comments.map((comment) => mapComment(comment, marketId)) }
  },

  async createComment(comment: {
    marketId: string
    content: string
    parentId?: string
  }): Promise<ApiResponse<Comment>> {
    const response = await httpClient.post<ApiResponse<{ comment: any }>>('/comments', comment)
    if (!response.success) throw new Error(response.error || 'Failed to create comment')
    return { ...response, data: response.data?.comment ? mapComment(response.data.comment, comment.marketId) : undefined }
  },

  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    const response = await httpClient.patch<ApiResponse<{ comment: any }>>(`/comments/${commentId}`, { content })
    if (!response.success) throw new Error(response.error || 'Failed to update comment')
    return { ...response, data: response.data?.comment ? mapComment(response.data.comment, response.data.comment.market || '') : undefined }
  },

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/comments/${commentId}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete comment')
    return response
  },

  async addReaction(commentId: string, type: 'like' | 'dislike' | 'love' | 'laugh'): Promise<ApiResponse<CommentReaction>> {
    const response = await httpClient.post<ApiResponse<CommentReaction>>(`/comments/${commentId}/reaction`, { type })
    if (!response.success) throw new Error(response.error || 'Failed to add reaction')
    return response
  },

  async removeReaction(commentId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/comments/${commentId}/reaction`)
    if (!response.success) throw new Error(response.error || 'Failed to remove reaction')
    return response
  },

  // Photos API
  async getPhotos(marketId: string, page = 1, limit = 20): Promise<ApiResponse<Photo[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    const response = await httpClient.get<ApiResponse<{ photos: any[] }>>(`/photos/market/${marketId}?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch photos')
    const photos = response.data?.photos || []
    return { ...response, data: photos.map((photo) => mapPhoto(photo, marketId)) }
  },

  async uploadPhoto(photo: {
    marketId: string
    file: File
    caption?: string
    tags?: string[]
  }): Promise<ApiResponse<Photo>> {
    const formData = new FormData()
    formData.append('marketId', photo.marketId)
    formData.append('photos', photo.file)
    if (photo.caption) formData.append('caption', photo.caption)
    if (photo.tags?.length) formData.append('tags', JSON.stringify(photo.tags))

    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token
      : undefined

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/photos/market/${photo.marketId}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to upload photo')
    }

    const payload = await response.json()
    if (!payload.success) throw new Error(payload.error || 'Failed to upload photo')
    const uploadedPhoto = payload.data?.photos?.[0] || payload.data?.photo
    return { ...payload, data: uploadedPhoto ? mapPhoto(uploadedPhoto, photo.marketId) : undefined }
  },

  async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/photos/${photoId}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete photo')
    return response
  },

  // Hashtags API
  async getHashtags(marketId: string): Promise<ApiResponse<Hashtag[]>> {
    const response = await httpClient.get<ApiResponse<{ hashtags: any[] }>>(`/hashtags/market/${marketId}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch hashtags')
    const hashtags = response.data?.hashtags || []
    return { ...response, data: hashtags.map((hashtag) => mapHashtag(hashtag, marketId)) }
  },

  async createHashtag(hashtag: {
    marketId: string
    name: string
  }): Promise<ApiResponse<Hashtag>> {
    const response = await httpClient.post<ApiResponse<{ hashtag: any }>>('/hashtags', {
      marketId: hashtag.marketId,
      text: hashtag.name,
    })
    if (!response.success) throw new Error(response.error || 'Failed to create hashtag')
    return { ...response, data: response.data?.hashtag ? mapHashtag(response.data.hashtag, hashtag.marketId) : undefined }
  },

  async voteOnHashtag(hashtagId: string, value: number): Promise<ApiResponse<Hashtag>> {
    if (value === 0) {
      const response = await httpClient.delete<ApiResponse<{ hashtag: any }>>(`/hashtags/${hashtagId}/vote`)
      if (!response.success) throw new Error(response.error || 'Failed to remove vote on hashtag')
      return { ...response, data: response.data?.hashtag ? mapHashtag(response.data.hashtag, response.data.hashtag.marketId || '') : undefined }
    }

    const voteType = value > 0 ? 'up' : 'down'
    const response = await httpClient.post<ApiResponse<{ hashtag: any }>>(`/hashtags/${hashtagId}/vote`, { voteType })
    if (!response.success) throw new Error(response.error || 'Failed to vote on hashtag')
    return { ...response, data: response.data?.hashtag ? mapHashtag(response.data.hashtag, response.data.hashtag.marketId || '') : undefined }
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
