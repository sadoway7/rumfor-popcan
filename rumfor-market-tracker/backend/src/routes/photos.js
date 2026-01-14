const express = require('express')
const router = express.Router()
const multer = require('multer')

const {
  getPhotos,
  uploadPhotos,
  votePhoto,
  deletePhoto,
  reportPhoto,
  getHeroPhoto
} = require('../controllers/photosController')

const { verifyToken } = require('../middleware/auth')
const { validateMongoId } = require('../middleware/validation')

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per photo
    files: 10 // Max 10 photos at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'))
    }
  }
})

// Helper function to save file locally
const saveFileLocally = async (fileBuffer, filename) => {
  const uploadsDir = path.join(__dirname, '../../uploads')
  await fs.mkdir(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, filename)
  await fs.writeFile(filePath, fileBuffer)
  return `/uploads/${filename}`
}

// Helper function to delete local file
const deleteLocalFile = async (filename) => {
  const filePath = path.join(__dirname, '../../uploads', filename)
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Error deleting local file:', error)
  }
}

// Controller functions
const photoController = {
  // Get photos for a market
  getMarketPhotos: async (req, res) => {
    try {
      const { marketId } = req.params
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        includePending = false 
      } = req.query

      // Validate marketId
      if (!mongoose.Types.ObjectId.isValid(marketId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market ID'
        })
      }

      // Check if market exists
      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      const photos = await Photo.getMarketPhotos(marketId, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        includePending: includePending === 'true'
      })

      const total = await Photo.countDocuments({
        market: marketId,
        isDeleted: false,
        ...(includePending !== 'true' && {
          'moderation.isApproved': true,
          'moderation.isPending': false,
          'moderation.isRejected': false
        })
      })

      res.json({
        success: true,
        data: {
          photos,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        },
        message: 'Photos retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting market photos:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve photos',
        error: error.message
      })
    }
  },

  // Upload photo
  uploadPhoto: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        })
      }

      const { marketId, title, caption, tags } = req.body
      const userId = req.user.id

      // Validate marketId
      if (!mongoose.Types.ObjectId.isValid(marketId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market ID'
        })
      }

      // Check if market exists
      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      // Generate unique filename
      const filename = `photo_${Date.now()}_${Math.random().toString(36).substring(2)}.${req.file.mimetype.split('/')[1]}`

      // Save file locally
      const imageUrl = await saveFileLocally(req.file.buffer, filename)

      // Create photo document
      const photo = new Photo({
        title: title || '',
        caption: caption || '',
        imageUrl: imageUrl,
        imageFilename: filename,
        uploadedBy: userId,
        market: marketId,
        metadata: {
          size: req.file.size,
          format: req.file.mimetype.split('/')[1],
          originalName: req.file.originalname
        },
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : []
      })

      await photo.save()
      await photo.populate('uploadedBy', 'username profile.firstName profile.lastName')

      // Increment market photo count
      await market.incrementStat('totalPhotos')

      res.status(201).json({
        success: true,
        data: { photo },
        message: 'Photo uploaded successfully'
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to upload photo',
        error: error.message
      })
    }
  },

  // Update photo metadata
  updatePhoto: async (req, res) => {
    try {
      const { id } = req.params
      const { title, caption, tags } = req.body
      const userId = req.user.id

      // Validate photoId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid photo ID'
        })
      }

      const photo = await Photo.findById(id)
      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        })
      }

      // Check ownership or admin
      if (photo.uploadedBy.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this photo'
        })
      }

      // Update fields
      if (title !== undefined) photo.title = title
      if (caption !== undefined) photo.caption = caption
      if (tags !== undefined) {
        photo.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())
      }

      await photo.save()
      await photo.populate('uploadedBy', 'username profile.firstName profile.lastName')

      res.json({
        success: true,
        data: { photo },
        message: 'Photo updated successfully'
      })
    } catch (error) {
      console.error('Error updating photo:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update photo',
        error: error.message
      })
    }
  },

  // Delete photo
  deletePhoto: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Validate photoId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid photo ID'
        })
      }

      const photo = await Photo.findById(id)
      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        })
      }

      // Check ownership or admin
      if (photo.uploadedBy.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this photo'
        })
      }

      // Delete local file
      try {
        await deleteLocalFile(photo.imageFilename)
      } catch (fileError) {
        console.error('Error deleting local file:', fileError)
        // Continue with soft delete even if file deletion fails
      }

      // Soft delete
      await photo.softDelete()

      // Update market photo count
      const market = await Market.findById(photo.market)
      if (market) {
        market.statistics.totalPhotos = Math.max(0, market.statistics.totalPhotos - 1)
        await market.save()
      }

      res.json({
        success: true,
        data: null,
        message: 'Photo deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting photo:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete photo',
        error: error.message
      })
    }
  },

  // Vote on photo
  votePhoto: async (req, res) => {
    try {
      const { id } = req.params
      const { voteType = 'up' } = req.body // 'up' or 'down'
      const userId = req.user.id

      // Validate photoId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid photo ID'
        })
      }

      const photo = await Photo.findById(id)
      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        })
      }

      // Check if photo is approved
      if (!photo.moderation.isApproved && !photo.moderation.isPending) {
        return res.status(403).json({
          success: false,
          message: 'Cannot vote on unapproved photo'
        })
      }

      // Add vote
      await photo.addVote(userId, voteType)
      await photo.populate('uploadedBy', 'username profile.firstName profile.lastName')

      res.json({
        success: true,
        data: { photo },
        message: 'Vote recorded successfully'
      })
    } catch (error) {
      console.error('Error voting on photo:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: error.message
      })
    }
  },

  // Get featured photos for a market
  getFeaturedPhotos: async (req, res) => {
    try {
      const { marketId } = req.params
      const { limit = 10 } = req.query

      if (!mongoose.Types.ObjectId.isValid(marketId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market ID'
        })
      }

      const photos = await Photo.getFeaturedPhotos(marketId, parseInt(limit))

      res.json({
        success: true,
        data: { photos },
        message: 'Featured photos retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting featured photos:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve featured photos',
        error: error.message
      })
    }
  },

  // Get photo statistics for a market
  getPhotoStats: async (req, res) => {
    try {
      const { marketId } = req.params

      if (!mongoose.Types.ObjectId.isValid(marketId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market ID'
        })
      }

      const stats = await Photo.getMarketPhotoStats(marketId)

      res.json({
        success: true,
        data: stats[0] || {
          totalPhotos: 0,
          totalVotes: 0,
          totalUpVotes: 0,
          totalDownVotes: 0,
          pendingPhotos: 0,
          approvedPhotos: 0
        },
        message: 'Photo statistics retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting photo stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve photo statistics',
        error: error.message
      })
    }
  }
}

// Protected routes
router.use(verifyToken)

// Get photos for a market
router.get('/market/:marketId', validateMongoId('marketId'), getPhotos)

// Get hero photo for a market
router.get('/market/:marketId/hero', validateMongoId('marketId'), getHeroPhoto)

// Upload photos (with file upload)
router.post('/market/:marketId', validateMongoId('marketId'), upload.array('photos', 10), uploadPhotos)

// Vote on photo
router.post('/:photoId/vote', validateMongoId('photoId'), votePhoto)

// Delete photo
router.delete('/:photoId', validateMongoId('photoId'), deletePhoto)

// Report photo
router.post('/:photoId/report', validateMongoId('photoId'), reportPhoto)

module.exports = router
