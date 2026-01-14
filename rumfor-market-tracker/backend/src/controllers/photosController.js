const { catchAsync, AppError, sendSuccess } = require('../middleware/errorHandler')
const Photo = require('../models/Photo')
const Market = require('../models/Market')
const User = require('../models/User')
const path = require('path')
const fs = require('fs').promises

// Get photos for a market
const getPhotos = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const { page = 1, limit = 20, sort = 'votes' } = req.query

  // Verify market exists
  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  let sortOptions = { createdAt: -1 }
  if (sort === 'votes') {
    sortOptions = { voteCount: -1, createdAt: -1 }
  } else if (sort === 'recent') {
    sortOptions = { createdAt: -1 }
  }

  const photos = await Photo.find({ market: marketId, approved: true })
    .populate('uploadedBy', 'username profile.firstName profile.lastName')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()

  const total = await Photo.countDocuments({ market: marketId, approved: true })

  sendSuccess(res, {
    photos,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(total / limit),
      count: photos.length
    }
  }, 'Photos retrieved successfully')
})

// Upload photos to a market
const uploadPhotos = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const { caption = '' } = req.body
  const userId = req.user.id
  const files = req.files

  // Verify market exists
  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  if (!files || files.length === 0) {
    return next(new AppError('At least one photo is required', 400))
  }

  if (files.length > 10) {
    return next(new AppError('Maximum 10 photos can be uploaded at once', 400))
  }

  const uploadedPhotos = []

  for (const file of files) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      // Clean up uploaded file
      try {
        await fs.unlink(file.path)
      } catch (err) {
        console.error('Failed to clean up invalid file:', err)
      }
      continue // Skip invalid files instead of failing entire upload
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      // Clean up uploaded file
      try {
        await fs.unlink(file.path)
      } catch (err) {
        console.error('Failed to clean up oversized file:', err)
      }
      continue // Skip oversized files
    }

    // Generate unique filename to prevent conflicts
    const fileExt = path.extname(file.originalname)
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`
    const filePath = path.join('uploads', 'photos', fileName)

    // Move file to permanent location
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.rename(file.path, filePath)
    } catch (err) {
      console.error('Failed to move uploaded file:', err)
      continue
    }

    // Create photo record
    const photo = await Photo.create({
      market: marketId,
      uploadedBy: userId,
      caption: caption.trim(),
      filename: fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      // Auto-approve for basic users, flag for moderation for new users
      approved: true // TODO: Implement moderation based on user reputation
    })

    uploadedPhotos.push(photo)
  }

  if (uploadedPhotos.length === 0) {
    return next(new AppError('No valid photos were uploaded', 400))
  }

  // Update market photo count
  await Market.findByIdAndUpdate(marketId, {
    $inc: { photoCount: uploadedPhotos.length }
  })

  // Populate uploadedBy info
  await Promise.all(
    uploadedPhotos.map(photo =>
      photo.populate('uploadedBy', 'username profile.firstName profile.lastName')
    )
  )

  sendSuccess(res, {
    photos: uploadedPhotos,
    uploaded: uploadedPhotos.length,
    failed: files.length - uploadedPhotos.length
  }, 'Photos uploaded successfully', 201)
})

// Vote on a photo
const votePhoto = catchAsync(async (req, res, next) => {
  const { photoId } = req.params
  const { vote } = req.body // 1 for upvote, -1 for downvote, 0 to remove vote
  const userId = req.user.id

  if (vote !== 1 && vote !== -1 && vote !== 0) {
    return next(new AppError('Vote must be 1 (upvote), -1 (downvote), or 0 (remove)', 400))
  }

  const photo = await Photo.findById(photoId)
  if (!photo) {
    return next(new AppError('Photo not found', 404))
  }

  if (!photo.approved) {
    return next(new AppError('Photo is not approved yet', 400))
  }

  // Find existing vote by this user
  const existingVoteIndex = photo.votes.findIndex(v => v.user.toString() === userId)

  if (vote === 0) {
    // Remove vote
    if (existingVoteIndex === -1) {
      return next(new AppError('No vote found to remove', 400))
    }

    const oldVote = photo.votes[existingVoteIndex].vote
    photo.votes.splice(existingVoteIndex, 1)
    photo.voteCount += (oldVote === 1 ? -1 : 1) // Reverse the old vote
  } else {
    // Add or update vote
    if (existingVoteIndex !== -1) {
      const oldVote = photo.votes[existingVoteIndex].vote
      photo.votes[existingVoteIndex].vote = vote
      photo.votes[existingVoteIndex].updatedAt = new Date()

      // Adjust vote count
      if (oldVote === vote) {
        // Same vote, no change
      } else if (oldVote === 1 && vote === -1) {
        photo.voteCount -= 2 // up to down = -2
      } else if (oldVote === -1 && vote === 1) {
        photo.voteCount += 2 // down to up = +2
      } else {
        photo.voteCount += vote // First vote
      }
    } else {
      // New vote
      photo.votes.push({
        user: userId,
        vote,
        createdAt: new Date()
      })
      photo.voteCount += vote
    }
  }

  await photo.save()

  sendSuccess(res, {
    photo: {
      id: photo._id,
      voteCount: photo.voteCount
    }
  }, 'Vote recorded successfully')
})

// Delete a photo
const deletePhoto = catchAsync(async (req, res, next) => {
  const { photoId } = req.params
  const userId = req.user.id
  const userRole = req.user.role

  const photo = await Photo.findById(photoId)
  if (!photo) {
    return next(new AppError('Photo not found', 404))
  }

  // Allow deletion if user is uploader or admin
  if (photo.uploadedBy.toString() !== userId && userRole !== 'admin') {
    return next(new AppError('You do not have permission to delete this photo', 403))
  }

  // Delete physical file
  try {
    const filePath = path.join('uploads', 'photos', photo.filename)
    await fs.unlink(filePath)
  } catch (err) {
    console.error('Failed to delete physical file:', err)
    // Continue with database deletion even if file deletion fails
  }

  // Delete database record
  await Photo.findByIdAndDelete(photoId)

  // Update market photo count
  await Market.findByIdAndUpdate(photo.market, { $inc: { photoCount: -1 } })

  sendSuccess(res, null, 'Photo deleted successfully')
})

// Report a photo
const reportPhoto = catchAsync(async (req, res, next) => {
  const { photoId } = req.params
  const { reason, details } = req.body
  const userId = req.user.id

  if (!reason) {
    return next(new AppError('Report reason is required', 400))
  }

  const photo = await Photo.findById(photoId)
  if (!photo) {
    return next(new AppError('Photo not found', 404))
  }

  // Check if user already reported this photo
  const existingReport = photo.reports.find(r => r.user.toString() === userId)
  if (existingReport) {
    return next(new AppError('You have already reported this photo', 400))
  }

  // Add report
  await Photo.findByIdAndUpdate(photoId, {
    $push: {
      reports: {
        user: userId,
        reason,
        details: details || '',
        createdAt: new Date()
      }
    }
  })

  // If photo has multiple reports, mark for moderator review
  const updatedPhoto = await Photo.findById(photoId)
  if (updatedPhoto.reports.length >= 3) {
    await Photo.findByIdAndUpdate(photoId, { reported: true })
  }

  sendSuccess(res, null, 'Photo reported successfully')
})

// Get hero photo for market (highest voted approved photo)
const getHeroPhoto = catchAsync(async (req, res, next) => {
  const { marketId } = req.params

  // Verify market exists
  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const heroPhoto = await Photo.findOne({
    market: marketId,
    approved: true
  })
  .sort({ voteCount: -1, createdAt: -1 })
  .populate('uploadedBy', 'username profile.firstName profile.lastName')

  if (!heroPhoto) {
    return sendSuccess(res, { heroPhoto: null }, 'No hero photo found')
  }

  sendSuccess(res, { heroPhoto }, 'Hero photo retrieved successfully')
})

module.exports = {
  getPhotos,
  uploadPhotos,
  votePhoto,
  deletePhoto,
  reportPhoto,
  getHeroPhoto
}