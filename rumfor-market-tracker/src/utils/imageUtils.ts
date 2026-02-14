interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Compress and resize an image file
 * Converts to webp format for smaller file sizes
 * 
 * @param file - The image file to compress
 * @param options - Compression options
 * @param options.maxWidth - Maximum width (default 500)
 * @param options.maxHeight - Maximum height (default 500)
 * @param options.quality - Compression quality 0-1 (default 0.8)
 * @returns Promise<string> - Base64 webp data URL
 */
export async function compressAndResizeImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { maxWidth = 500, maxHeight = 500, quality = 0.8 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to webp
      const compressedDataUrl = canvas.toDataURL('image/webp', quality)
      resolve(compressedDataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Convert a base64 data URL to a File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/webp'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
}
