import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCommunityStore } from '../communityStore'
import { communityApi } from '../communityApi'

export const usePhotos = (marketId: string) => {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  
  const {
    photos,
    isLoadingPhotos,
    photosError,
    setPhotos,
    addPhoto,
    removePhoto,
    setPhotosError,
  } = useCommunityStore()

  // Query for fetching photos
  const {
    data: photosResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['photos', marketId, page],
    queryFn: () => communityApi.getPhotos(marketId, page),
    enabled: !!marketId,
    staleTime: 30000, // 30 seconds
  })

  // Update store when data changes
  useEffect(() => {
    if (photosResponse?.success && photosResponse.data) {
      if (page === 1) {
        setPhotos(photosResponse.data)
      } else {
        // Append new photos for pagination
        setPhotos([...photos, ...photosResponse.data])
      }
    }
  }, [photosResponse, page, photos, setPhotos])

  // Mutations
  const uploadPhotoMutation = useMutation({
    mutationFn: (photoData: { file: File; caption?: string; tags?: string[] }) =>
      communityApi.uploadPhoto({ ...photoData, marketId }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        addPhoto(response.data)
        queryClient.invalidateQueries({ queryKey: ['photos', marketId] })
      }
    },
    onError: (error: any) => {
      setPhotosError(error.message || 'Failed to upload photo')
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => communityApi.deletePhoto(photoId),
    onSuccess: (_, photoId) => {
      removePhoto(photoId)
      queryClient.invalidateQueries({ queryKey: ['photos', marketId] })
    },
    onError: (error: any) => {
      setPhotosError(error.message || 'Failed to delete photo')
    },
  })

  // Helper functions
  const uploadPhoto = async (file: File, caption?: string, tags?: string[]) => {
    await uploadPhotoMutation.mutateAsync({ file, caption, tags })
  }

  const deletePhoto = async (photoId: string) => {
    await deletePhotoMutation.mutateAsync(photoId)
  }

  const loadMorePhotos = () => {
    setPage(prev => prev + 1)
  }

  const refreshPhotos = () => {
    setPage(1)
    refetch()
  }

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, GIF, and WebP images are allowed'
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB'
    }

    return null
  }

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, file.type, 0.8)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  return {
    // Data
    photos,
    isLoading: isLoading || isLoadingPhotos,
    error: error || photosError,
    
    // Actions
    uploadPhoto,
    deletePhoto,
    loadMorePhotos,
    refreshPhotos,
    
    // Utilities
    validateFile,
    compressImage,
    
    // States
    isUploading: uploadPhotoMutation.isPending,
    isDeleting: deletePhotoMutation.isPending,
    
    // Errors
    uploadError: uploadPhotoMutation.error?.message,
    deleteError: deletePhotoMutation.error?.message,
  }
}

export default usePhotos