const mongoose = require('mongoose')
const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const MarketConversion = require('../models/MarketConversion')
const Market = require('../models/Market')
const User = require('../models/User')
const { validateMarketConversionRequest, validateConversionReview } = require('../middleware/validation')

// Request market conversion
const requestConversion = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const {
    toType,
    reason,
    details,
    conversionData = {}
  } = req.body

  // Find the market
  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Check if user can request conversion for this market
  if (market.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only request conversions for markets you manage', 403))
  }

  // Check if there's already a pending conversion request
  const existingRequest = await MarketConversion.findOne({
    market: marketId,
    status: { $in: ['pending', 'under_review'] }
  })

  if (existingRequest) {
    return next(new AppError('A conversion request for this market is already pending review', 409))
  }

  // Validate conversion types
  const allowedConversions = {
    vendor: ['promoter'],
    promoter: ['vendor'],
    admin: ['promoter', 'vendor']
  }

  if (!allowedConversions[market.createdByType]?.includes(toType)) {
    return next(new AppError(`Invalid conversion from ${market.createdByType} to ${toType}`, 400))
  }

  // Create conversion request
  const conversion = await MarketConversion.create({
    market: marketId,
    requestedBy: req.user.id,
    fromType: market.createdByType,
    toType,
    reason,
    details,
    conversionData,
    createdBy: req.user.id
  })

  // Log the request
  console.log(`Market conversion requested: ${market.name} (${market.createdByType} -> ${toType}) by ${req.user.username}`)

  const populatedConversion = await MarketConversion.findById(conversion._id)
    .populate('market', 'name createdByType')
    .populate('requestedBy', 'username profile.firstName profile.lastName')

  sendSuccess(res, {
    conversion: populatedConversion
  }, 'Market conversion request submitted successfully', 201)
})

// Get user's conversion requests
const getMyRequests = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  // Build query
  let query = { requestedBy: req.user.id }

  if (status) {
    query.status = status
  }

  // Execute query
  const conversions = await MarketConversion.find(query)
    .populate('market', 'name createdByType status location.city')
    .populate('reviewedBy', 'username profile.firstName profile.lastName')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  // Get total count
  const total = await MarketConversion.countDocuments(query)

  sendSuccess(res, {
    conversions,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  }, 'Conversion requests retrieved successfully')
})

// Get conversion requests for review (admin only)
const getPendingRequests = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status = 'pending',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  // Build query
  let query = { status }

  if (status === 'pending') {
    query.status = { $in: ['pending', 'under_review'] }
  }

  // Execute query
  const conversions = await MarketConversion.find(query)
    .populate('market', 'name createdByType status location.city location.state')
    .populate('requestedBy', 'username profile.firstName profile.lastName email')
    .populate('reviewedBy', 'username profile.firstName profile.lastName')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  // Get total count
  const total = await MarketConversion.countDocuments(query)

  // Get summary stats
  const stats = await MarketConversion.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])

  sendSuccess(res, {
    conversions,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    stats: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})
  }, 'Pending conversion requests retrieved successfully')
})

// Review conversion request (admin only)
const reviewConversion = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { action, reviewNotes, rejectionReason } = req.body

  // Find the conversion request
  const conversion = await MarketConversion.findById(id)
    .populate('market')
    .populate('requestedBy', 'username email')

  if (!conversion) {
    return next(new AppError('Conversion request not found', 404))
  }

  if (!['pending', 'under_review'].includes(conversion.status)) {
    return next(new AppError('This conversion request has already been reviewed', 400))
  }

  let result
  if (action === 'approve') {
    // Update market's createdByType
    conversion.market.createdByType = conversion.toType
    conversion.market.updatedBy = req.user.id

    // If converting to promoter, update promoter field if needed
    if (conversion.toType === 'promoter' && conversion.market.promoter.toString() !== conversion.requestedBy.toString()) {
      // Keep the original promoter or set to the requester based on business logic
      // For now, we'll keep the original promoter
    }

    await conversion.market.save()

    result = await conversion.approve(req.user.id, reviewNotes)

    // Log approval
    console.log(`Market conversion approved: ${conversion.market.name} (${conversion.fromType} -> ${conversion.toType})`)

    // TODO: Send notification email to requester

  } else if (action === 'reject') {
    if (!rejectionReason) {
      return next(new AppError('Rejection reason is required', 400))
    }

    result = await conversion.reject(req.user.id, rejectionReason, reviewNotes)

    // Log rejection
    console.log(`Market conversion rejected: ${conversion.market.name} (${conversion.fromType} -> ${conversion.toType}) - ${rejectionReason}`)

    // TODO: Send notification email to requester

  } else if (action === 'review') {
    // Mark as under review
    conversion.status = 'under_review'
    conversion.reviewedBy = req.user.id
    conversion.reviewNotes = reviewNotes
    result = await conversion.save()
  } else {
    return next(new AppError('Invalid action. Must be approve, reject, or review', 400))
  }

  const populatedResult = await MarketConversion.findById(result._id)
    .populate('market', 'name createdByType')
    .populate('requestedBy', 'username profile.firstName profile.lastName')
    .populate('reviewedBy', 'username profile.firstName profile.lastName')

  sendSuccess(res, {
    conversion: populatedResult
  }, `Conversion request ${action}ed successfully`)
})

// Cancel conversion request
const cancelConversion = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const conversion = await MarketConversion.findById(id)

  if (!conversion) {
    return next(new AppError('Conversion request not found', 404))
  }

  // Check if user owns this request
  if (conversion.requestedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only cancel your own conversion requests', 403))
  }

  if (!['pending', 'under_review'].includes(conversion.status)) {
    return next(new AppError('Cannot cancel a conversion request that has already been reviewed', 400))
  }

  conversion.status = 'cancelled'
  conversion.updatedBy = req.user.id
  await conversion.save()

  sendSuccess(res, {
    conversion
  }, 'Conversion request cancelled successfully')
})

// Get single conversion request
const getConversion = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const conversion = await MarketConversion.findById(id)
    .populate('market', 'name description createdByType status location')
    .populate('requestedBy', 'username profile.firstName profile.lastName email')
    .populate('reviewedBy', 'username profile.firstName profile.lastName')
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username')

  if (!conversion) {
    return next(new AppError('Conversion request not found', 404))
  }

  // Check if user can view this request
  const isOwner = conversion.requestedBy._id.toString() === req.user.id
  const isAdmin = req.user.role === 'admin'
  const isReviewer = conversion.reviewedBy && conversion.reviewedBy._id.toString() === req.user.id

  if (!isOwner && !isAdmin && !isReviewer) {
    return next(new AppError('You do not have permission to view this conversion request', 403))
  }

  sendSuccess(res, {
    conversion
  }, 'Conversion request retrieved successfully')
})

module.exports = {
  requestConversion,
  getMyRequests,
  getPendingRequests,
  reviewConversion,
  cancelConversion,
  getConversion
}