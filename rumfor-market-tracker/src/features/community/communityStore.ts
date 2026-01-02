import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Comment, Photo, Hashtag } from '@/types'

interface CommunityState {
  // Comments
  comments: Comment[]
  isLoadingComments: boolean
  commentsError: string | null
  
  // Photos
  photos: Photo[]
  isLoadingPhotos: boolean
  photosError: string | null
  
  // Hashtags
  hashtags: Hashtag[]
  isLoadingHashtags: boolean
  hashtagsError: string | null
  
  // Actions
  setComments: (comments: Comment[]) => void
  addComment: (comment: Comment) => void
  updateComment: (id: string, updates: Partial<Comment>) => void
  removeComment: (id: string) => void
  setCommentsLoading: (loading: boolean) => void
  setCommentsError: (error: string | null) => void
  
  setPhotos: (photos: Photo[]) => void
  addPhoto: (photo: Photo) => void
  removePhoto: (id: string) => void
  setPhotosLoading: (loading: boolean) => void
  setPhotosError: (error: string | null) => void
  
  setHashtags: (hashtags: Hashtag[]) => void
  addHashtag: (hashtag: Hashtag) => void
  updateHashtag: (id: string, updates: Partial<Hashtag>) => void
  removeHashtag: (id: string) => void
  setHashtagsLoading: (loading: boolean) => void
  setHashtagsError: (error: string | null) => void
  
  // Utility actions
  clearErrors: () => void
  reset: () => void
}

const initialState = {
  comments: [],
  isLoadingComments: false,
  commentsError: null,
  photos: [],
  isLoadingPhotos: false,
  photosError: null,
  hashtags: [],
  isLoadingHashtags: false,
  hashtagsError: null,
}

export const useCommunityStore = create<CommunityState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Comments actions
      setComments: (comments) => set({ comments }),
      
      addComment: (comment) => set((state) => ({
        comments: [comment, ...state.comments]
      })),
      
      updateComment: (id, updates) => set((state) => ({
        comments: state.comments.map(comment =>
          comment.id === id ? { ...comment, ...updates } : comment
        )
      })),
      
      removeComment: (id) => set((state) => ({
        comments: state.comments.filter(comment => comment.id !== id)
      })),
      
      setCommentsLoading: (loading) => set({ isLoadingComments: loading }),
      setCommentsError: (error) => set({ commentsError: error }),

      // Photos actions
      setPhotos: (photos) => set({ photos }),
      
      addPhoto: (photo) => set((state) => ({
        photos: [photo, ...state.photos]
      })),
      
      removePhoto: (id) => set((state) => ({
        photos: state.photos.filter(photo => photo.id !== id)
      })),
      
      setPhotosLoading: (loading) => set({ isLoadingPhotos: loading }),
      setPhotosError: (error) => set({ photosError: error }),

      // Hashtags actions
      setHashtags: (hashtags) => set({ hashtags }),
      
      addHashtag: (hashtag) => set((state) => ({
        hashtags: [...state.hashtags, hashtag]
      })),
      
      updateHashtag: (id, updates) => set((state) => ({
        hashtags: state.hashtags.map(hashtag =>
          hashtag.id === id ? { ...hashtag, ...updates } : hashtag
        )
      })),
      
      removeHashtag: (id) => set((state) => ({
        hashtags: state.hashtags.filter(hashtag => hashtag.id !== id)
      })),
      
      setHashtagsLoading: (loading) => set({ isLoadingHashtags: loading }),
      setHashtagsError: (error) => set({ hashtagsError: error }),

      // Utility actions
      clearErrors: () => set({
        commentsError: null,
        photosError: null,
        hashtagsError: null
      }),
      
      reset: () => set(initialState)
    }),
    {
      name: 'community-store'
    }
  )
)