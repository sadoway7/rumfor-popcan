import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { usePhotos } from '@/features/community/hooks/usePhotos'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'

interface PhotoUploaderProps {
  marketId: string
  onUploadComplete?: () => void
  className?: string
}

interface FileWithPreview extends File {
  preview?: string
  id: string
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  marketId,
  onUploadComplete,
  className
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const [tags, setTags] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)
  const [currentTag, setCurrentTag] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { user } = useAuthStore()
  const {
    uploadPhoto,
    isUploading,
    validateFile,
    compressImage,
    uploadError
  } = usePhotos(marketId)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }

  const handleFiles = async (fileList: File[]) => {
    const validFiles: FileWithPreview[] = []
    
    for (const file of fileList) {
      // Validate file
      const validation = validateFile(file)
      if (validation) {
        alert(`File "${file.name}": ${validation}`)
        continue
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      
      // Compress image if needed
      try {
        const compressedFile = await compressImage(file)
        const fileWithPreview: FileWithPreview = {
          ...compressedFile,
          preview: URL.createObjectURL(compressedFile),
          id: `${Date.now()}-${Math.random()}`
        }
        validFiles.push(fileWithPreview)
      } catch (error) {
        console.error('Failed to compress image:', error)
        // Use original file if compression fails
        const fileWithPreview: FileWithPreview = {
          ...file,
          preview: previewUrl,
          id: `${Date.now()}-${Math.random()}`
        }
        validFiles.push(fileWithPreview)
      }
    }
    
    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
    
    // Clean up related state
    setCaptions(prev => {
      const newCaptions = { ...prev }
      delete newCaptions[fileId]
      return newCaptions
    })
    
    setTags(prev => {
      const newTags = { ...prev }
      delete newTags[fileId]
      return newTags
    })
  }

  const handleCaptionChange = (fileId: string, caption: string) => {
    setCaptions(prev => ({
      ...prev,
      [fileId]: caption
    }))
  }

  const addTagToCurrent = (fileId: string) => {
    if (!currentTag.trim()) return
    
    const existingTags = tags[fileId] || ''
    const tagList = existingTags.split(',').map(t => t.trim()).filter(Boolean)
    
    if (!tagList.includes(currentTag.trim())) {
      const newTags = [...tagList, currentTag.trim()].join(', ')
      setTags(prev => ({
        ...prev,
        [fileId]: newTags
      }))
    }
    
    setCurrentTag('')
  }

  const handleSubmit = async () => {
    if (files.length === 0 || isUploading) return
    
    try {
      for (const file of files) {
        const caption = captions[file.id] || ''
        const tagList = tags[file.id]?.split(',').map(t => t.trim()).filter(Boolean) || []
        
        await uploadPhoto(file, caption, tagList)
      }
      
      // Clean up
      setFiles([])
      setCaptions({})
      setTags({})
      setCurrentTag('')
      
      onUploadComplete?.()
    } catch (error) {
      console.error('Failed to upload photos:', error)
    }
  }

  const getTagList = (fileId: string) => {
    return (tags[fileId] || '').split(',').map(t => t.trim()).filter(Boolean)
  }

  if (!user) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Sign in to upload photos</h3>
          <p className="text-muted-foreground">
            Please log in to share photos from this market.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          dragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50',
          'p-8 text-center'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Photos</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop photos here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPEG, PNG, GIF, and WebP. Max 5MB per image.
            </p>
          </div>
          
          <Button variant="outline" size="sm">
            Choose Files
          </Button>
        </div>
      </Card>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Selected Photos ({files.length})
            </h3>
            <Button
              onClick={handleSubmit}
              disabled={isUploading || files.length === 0}
              size="sm"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Uploading...
                </div>
              ) : (
                `Upload ${files.length} Photo${files.length > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="p-4 space-y-3">
                {/* Image Preview */}
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Caption Input */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Caption (optional)
                  </label>
                  <Textarea
                    value={captions[file.id] || ''}
                    onChange={(e) => handleCaptionChange(file.id, e.target.value)}
                    placeholder="Describe this photo..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
                
                {/* Tags Input */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Tags (comma-separated)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTagToCurrent(file.id)
                        }
                      }}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-1 text-sm border border-border rounded-md bg-background"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addTagToCurrent(file.id)}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Tag List */}
                  <div className="flex flex-wrap gap-1">
                    {getTagList(file.id).map((tag, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Remove Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {uploadError}
        </div>
      )}

      {/* Upload Guidelines */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium mb-2">Photo Guidelines</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Share clear, well-lit photos of the market</li>
          <li>• Include vendor booths, products, or market atmosphere</li>
          <li>• Avoid photos with personal information visible</li>
          <li>• Maximum 10 photos per upload</li>
          <li>• Photos will be reviewed before appearing publicly</li>
        </ul>
      </Card>
    </div>
  )
}

export default PhotoUploader