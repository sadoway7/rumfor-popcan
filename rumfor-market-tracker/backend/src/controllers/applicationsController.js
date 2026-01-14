const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const UserMarketTracking = require('../models/UserMarketTracking')
const Market = require('../models/Market')
const Notification = require('../models/Notification')
const { validateApplicationCreation, validateMongoId, validatePagination } = require('../middleware/validation')

// Get all applications (for promoters/admin)
const getApplications = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    market,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  let query = {}

  // If user is promoter, only show applications for their markets
  if (req.user.role === 'promoter') {
    const promoterMarkets = await Market.find({ promoter: req.user.id }).select('_id')
    query.market = { $in: promoterMarkets.map(m => m._id) }
  }

  if (status) {
    query.status = status
  }

  if (market) {
    query.market = market
  }

  const applications = await UserMarketTracking.find(query)
    .populate({
      path: 'user',
      select: 'username profile.firstName profile.lastName profile.business'
    })
    .populate({
      path: 'market',
      select: 'name location.city location.state category promoter'
    })
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await UserMarketTracking.countDocuments(query)

  sendSuccess(res, {
    applications,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  }, 'Applications retrieved successfully')
})

// Get single application
const getApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const application = await UserMarketTracking.findById(id)
    .populate({
      path: 'user',
      select: 'username profile.firstName profile.lastName profile.business'
    })
    .populate({
      path: 'market',
      select: 'name location.city location.state category promoter vendorInfo'
    })

  if (!application) {
    return next(new AppError('Application not found', 404))
  }

  // Check if user can access this application
  const market = await Market.findById(application.market._id)
  
  if (application.user._id.toString() !== req.user.id && 
      market.promoter.toString() !== req.user.id && 
      req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  sendSuccess(res, {
    application
  }, 'Application retrieved successfully')
})

// Create new application
const createApplication = catchAsync(async (req, res, next) => {
  const { market, applicationData = {}, personalNotes = '' } = req.body

  // Check if market exists
  const marketDoc = await Market.findById(market)

  if (!marketDoc) {
    return next(new AppError('Market not found', 404))
  }

  // Check if user already has an application for this market
  const existingApplication = await UserMarketTracking.findOne({
    user: req.user.id,
    market: market
  })

  if (existingApplication) {
    return next(new AppError('You already have an application for this market', 400))
  }

  // Check if application deadline has passed
  if (marketDoc.vendorInfo.applicationDeadline && 
      marketDoc.vendorInfo.applicationDeadline < new Date()) {
    return next(new AppError('Application deadline has passed', 400))
  }

  // Create application
  const application = await UserMarketTracking.create({
    user: req.user.id,
    market: market,
    status: 'applied',
    applicationData: {
      fields: applicationData.fields || [],
      notes: applicationData.notes || '',
      submittedAt: new Date()
    },
    personalNotes: personalNotes || ''
  })

  // Increment market statistics
  await marketDoc.incrementStat('totalApplications')

  // Create notification for promoter
  await Notification.create({
    recipient: marketDoc.promoter,
    type: 'new-application',
    title: 'New Application Received',
    message: `A new application has been submitted for ${marketDoc.name}`,
    data: {
      marketId: market,
      applicationId: application._id,
      userId: req.user.id
    },
    priority: 'medium'
  })

  const populatedApplication = await UserMarketTracking.findById(application._id)
    .populate({
      path: 'user',
      select: 'username profile.firstName profile.lastName profile.business'
    })
    .populate({
      path: 'market',
      select: 'name location.city location.state category'
    })

  sendSuccess(res, {
    application: populatedApplication
  }, 'Application submitted successfully', 201)
})

// Update application status (for promoters)
const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { status, reviewNotes = '' } = req.body

  const application = await UserMarketTracking.findById(id)
    .populate('market', 'promoter name')

  if (!application) {
    return next(new AppError('Application not found', 404))
  }

  // Check if user is the promoter of this market or admin
  if (application.market.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update applications for your markets', 403))
  }

  // Validate status transition logic:
  // - 'applied' applications can be 'booked' (approved) or 'cancelled' (rejected)
  // - 'booked' applications can only be 'cancelled' (withdrawn by promoter)
  // This prevents invalid state changes and maintains application workflow integrity
  const validStatuses = ['booked', 'cancelled']

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status. Must be "booked" or "cancelled"', 400))
  }

  // Business rule: Only pending applications can be approved
  if (status === 'booked' && application.status !== 'applied') {
    return next(new AppError('Can only book applications with "applied" status', 400))
  }

  // Business rule: Applications can be cancelled at any active stage
  if (status === 'cancelled' && !['applied', 'booked'].includes(application.status)) {
    return next(new AppError('Can only cancel applications with "applied" or "booked" status', 400))
  }

  // Update application
  await application.reviewApplication(status, req.user.id, reviewNotes)

  // Create notification for applicant
  await Notification.create({
    recipient: application.user,
    type: 'application-status-change',
    title: `Application ${status === 'booked' ? 'Approved' : 'Rejected'}`,
    message: `Your application for ${application.market.name} has been ${status === 'booked' ? 'approved' : 'rejected'}`,
    data: {
      marketId: application.market._id,
      applicationId: application._id,
      oldStatus: application.status,
      newStatus: status
    },
    priority: status === 'booked' ? 'high' : 'medium'
  })

  const updatedApplication = await UserMarketTracking.findById(id)
    .populate({
      path: 'user',
      select: 'username profile.firstName profile.lastName profile.business'
    })
    .populate({
      path: 'market',
      select: 'name location.city location.state category'
    })

  sendSuccess(res, {
    application: updatedApplication
  }, `Application ${status} successfully`)
})

// Get my applications
const getMyApplications = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  let query = { user: req.user.id }

  if (status) {
    query.status = status
  }

  const applications = await UserMarketTracking.find(query)
    .populate({
      path: 'market',
      match: { isActive: true },
      select: 'name location.city location.state category promoter dates'
    })
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  // Filter out markets that might have been deleted
  const validApplications = applications.filter(app => app.market)

  const total = await UserMarketTracking.countDocuments(query)

  sendSuccess(res, {
    applications: validApplications,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  }, 'My applications retrieved successfully')
})

// Update application (for applicants)
const updateApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { applicationData, personalNotes } = req.body

  const application = await UserMarketTracking.findById(id)

  if (!application) {
    return next(new AppError('Application not found', 404))
  }

  // Check if user owns this application
  if (application.user.toString() !== req.user.id) {
    return next(new AppError('You can only update your own applications', 403))
  }

  // Can only update applications that are still pending
  if (application.status !== 'applied') {
    return next(new AppError('Can only update applications with "applied" status', 400))
  }

  // Update application data
  if (applicationData) {
    if (applicationData.notes !== undefined) {
      application.applicationData.notes = applicationData.notes
    }
    if (applicationData.fields) {
      application.applicationData.fields = applicationData.fields
    }
  }

  if (personalNotes !== undefined) {
    application.personalNotes = personalNotes
  }

  await application.save()

  const updatedApplication = await UserMarketTracking.findById(id)
    .populate({
      path: 'user',
      select: 'username profile.firstName profile.lastName profile.business'
    })
    .populate({
      path: 'market',
      select: 'name location.city location.state category'
    })

  sendSuccess(res, {
    application: updatedApplication
  }, 'Application updated successfully')
})

// Withdraw application
const withdrawApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { reason = '' } = req.body

  const application = await UserMarketTracking.findById(id)

  if (!application) {
    return next(new AppError('Application not found', 404))
  }

  // Check if user owns this application
  if (application.user.toString() !== req.user.id) {
    return next(new AppError('You can only withdraw your own applications', 403))
  }

  // Can only withdraw applications that are applied or booked
  if (!['applied', 'booked'].includes(application.status)) {
    return next(new AppError('Can only withdraw applications with "applied" or "booked" status', 400))
  }

  // Update status
  application.status = 'cancelled'
  if (reason) {
    application.personalNotes = (application.personalNotes || '') + `\nWithdrawn: ${reason}`
  }

  await application.save()

  // Notify promoter if application was booked
  if (application.status === 'booked') {
    const market = await Market.findById(application.market)
    
    await Notification.create({
      recipient: market.promoter,
      type: 'application-status-change',
      title: 'Application Withdrawn',
      message: `${req.user.username} has withdrawn their application for ${market.name}`,
      data: {
        marketId: application.market,
        applicationId: application._id,
        userId: req.user.id,
        oldStatus: 'booked',
        newStatus: 'cancelled'
      },
      priority: 'medium'
    })
  }

  sendSuccess(res, null, 'Application withdrawn successfully')
})

/**
 * Bulk update application status (for promoters and admins)
 * Processes multiple applications simultaneously with validation and notifications
 * Uses Promise.all for parallel processing to improve performance
 */
const bulkUpdateStatus = catchAsync(async (req, res, next) => {
  const { applicationIds, status, reviewNotes = '' } = req.body

  // Input validation - ensure we have valid application IDs array
  if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
    return next(new AppError('Application IDs are required', 400))
  }

  if (!status || !['booked', 'cancelled'].includes(status)) {
    return next(new AppError('Valid status is required', 400))
  }

  // Fetch all applications with their market information in a single query
  // This ensures we have promoter information for authorization checks
  const applications = await UserMarketTracking.find({
    _id: { $in: applicationIds }
  }).populate('market', 'promoter name')

  // Authorization check: Verify user has permission to modify ALL applications
  // This prevents partial success scenarios where some applications succeed and others fail
  const unauthorizedApplications = applications.filter(app =>
    app.market.promoter.toString() !== req.user.id && req.user.role !== 'admin'
  )

  if (unauthorizedApplications.length > 0) {
    return next(new AppError('You can only update applications for your markets', 403))
  }

  // Parallel processing of all application updates and notifications
  // Each update creates a notification, so we use Promise.all for efficiency
  const updatePromises = applications.map(async (application) => {
    // Update the application status using the model's business logic method
    await application.reviewApplication(status, req.user.id, reviewNotes)

    // Send notification to the applicant about status change
    // Priority is higher for approvals (booked) than rejections (cancelled)
    await Notification.create({
      recipient: application.user,
      type: 'application-status-change',
      title: `Application ${status === 'booked' ? 'Approved' : 'Rejected'}`,
      message: `Your application for ${application.market.name} has been ${status === 'booked' ? 'approved' : 'rejected'}`,
      data: {
        marketId: application.market._id,
        applicationId: application._id,
        oldStatus: application.status,
        newStatus: status
      },
      priority: status === 'booked' ? 'high' : 'medium'
    })

    return application
  })

  // Wait for all updates and notifications to complete
  // This ensures atomicity - all operations succeed or all fail
  await Promise.all(updatePromises)

  sendSuccess(res, {
    updatedCount: applications.length,
    status
  }, `${applications.length} applications ${status} successfully`)
})

// Get application statistics (for promoters/admin)
const getApplicationStats = catchAsync(async (req, res, next) => {
  const { marketId } = req.params

  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Check if user owns this market or is admin
  if (market.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only view statistics for your markets', 403))
  }

  const stats = await UserMarketTracking.getMarketApplicationStats(marketId)

  sendSuccess(res, {
    marketId,
    statistics: stats
  }, 'Application statistics retrieved successfully')
})

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  getMyApplications,
  updateApplication,
  withdrawApplication,
  bulkUpdateStatus,
  getApplicationStats
}