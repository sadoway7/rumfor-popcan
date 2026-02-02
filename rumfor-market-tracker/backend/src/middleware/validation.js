const { body, param, query, validationResult } = require('express-validator')
const validator = require('validator')

// Enhanced sanitization functions
const sanitizeHtml = (value) => {
  if (typeof value !== 'string') return value
  return validator.escape(value)
}

const sanitizeEmail = (value) => {
  if (typeof value !== 'string') return value
  return validator.normalizeEmail(value, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false
  }) || value
}

const sanitizeString = (value) => {
  if (typeof value !== 'string') return value
  // Remove null bytes, control characters, and normalize whitespace
  return value
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

const sanitizeUrl = (value) => {
  if (typeof value !== 'string') return value
  return validator.isURL(value) ? value : ''
}

const sanitizeAlphanumeric = (value) => {
  if (typeof value !== 'string') return value
  return value.replace(/[^a-zA-Z0-9]/g, '')
}

// Enhanced validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Log validation errors for security monitoring
    console.warn('Validation errors:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      errors: errors.array()
    })

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value ? '[REDACTED]' : undefined // Don't expose user input in responses
      }))
    })
  }

  next()
}

// Validation chains for different entities

// Enhanced user validation with improved sanitization
const validateUserRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 }) // RFC 5321 limit
    .withMessage('Email address is too long')
    .customSanitizer(sanitizeEmail),

  body('password')
    .isLength({ min: 8, max: 128 }) // Reasonable max length
    .withMessage('Password must be between 8 and 128 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .customSanitizer(sanitizeString),

  body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .customSanitizer(sanitizeString),

  handleValidationErrors
]

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
]

const validateUserUpdate = [
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .trim()
    .escape(),

  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .trim()
    .escape(),

  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Display name must be less than 100 characters')
    .trim()
    .escape(),

  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim()
    .escape(),

  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters')
    .trim()
    .escape(),

  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be a boolean'),

  body('preferences.smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications preference must be a boolean'),

  handleValidationErrors
]

// Market validation with enhanced security and business rules
const validateMarketCreation = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Market name must be between 3 and 100 characters')
    .customSanitizer(sanitizeString)
    .custom((value) => {
      // Prevent potentially malicious patterns
      if (/<script/i.test(value) || /javascript:/i.test(value)) {
        throw new Error('Market name contains invalid content')
      }
      return value
    }),

  body('description')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      // Skip validation if description is empty or not provided
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return true
      }
      // Validate length if description is provided
      const sanitized = sanitizeString(value)
      if (sanitized.length > 2000) {
        throw new Error('Description must be less than 2000 characters')
      }
      req.body.description = sanitized
      return true
    }),

  body('category')
    .isIn([
      'farmers-market',
      'arts-crafts',
      'flea-market',
      'food-festival',
      'craft-fair',
      'antique-market',
      'seasonal-event',
      'community-event',
      'holiday-market',
      'craft-show',
      'night-market',
      'street-fair',
      'vintage-antique',
      'other'
    ])
    .withMessage('Invalid market category'),

  body('marketType')
    .optional()
    .isIn(['vendor-created', 'promoter-managed'])
    .withMessage('Invalid market type'),

  // Enhanced location validation
  body('location.address.street')
    .optional()
    .isLength({ min: 0, max: 100 })
    .withMessage('Street address must be less than 100 characters')
    .customSanitizer(sanitizeString),

  body('location.address.city')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .customSanitizer(sanitizeString),

  body('location.address.state')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .customSanitizer(sanitizeString),

  body('location.address.zipCode')
    .optional()
    .isLength({ min: 0, max: 10 })
    .withMessage('ZIP code must be less than 10 characters')
    .customSanitizer(sanitizeAlphanumeric),

  body('location.address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country must be less than 50 characters')
    .customSanitizer(sanitizeString),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),

  // Schedule validation - accept array of schedule items (vendor-created) or object with startTime/endTime (promoter-managed)
  body('schedule')
    .optional()
    .isObject()
    .withMessage('Schedule must be an object'),

  body('schedule.recurring')
    .optional()
    .isBoolean()
    .withMessage('Recurring must be a boolean'),

  body('schedule.daysOfWeek')
    .optional()
    .isArray()
    .withMessage('Days of week must be an array'),

  body('schedule.daysOfWeek.*')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),

  body('schedule.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('schedule.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

  body('schedule.seasonStart')
    .optional()
    .isISO8601()
    .withMessage('Season start must be a valid date'),

  body('schedule.seasonEnd')
    .optional()
    .isISO8601()
    .withMessage('Season end must be a valid date'),


  // Application settings validation with business rules
  body('applicationSettings.maxVendors')
    .optional({ nullable: true })
    .if(body('applicationSettings.maxVendors').exists())
    .isInt({ min: 1, max: 1000 })
    .withMessage('Maximum vendors must be between 1 and 1000'),

  body('applicationSettings.applicationFee')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Application fee must be between 0 and $1000'),

  body('applicationSettings.boothFee')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Booth fee must be between 0 and $10,000'),

  // Contact information validation
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Contact email must be valid')
    .normalizeEmail(),

  body('contact.phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters')
    .customSanitizer(sanitizeString),

  body('contact.website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),

  // Accessibility features validation
  body('accessibility')
    .optional()
    .isObject()
    .withMessage('Accessibility must be an object'),

  body('accessibility.wheelchairAccessible')
    .optional()
    .isBoolean()
    .withMessage('wheelchairAccessible must be a boolean'),

  body('accessibility.parkingAvailable')
    .optional()
    .isBoolean()
    .withMessage('parkingAvailable must be a boolean'),

  body('accessibility.restroomsAvailable')
    .optional()
    .isBoolean()
    .withMessage('restroomsAvailable must be a boolean'),

  body('accessibility.familyFriendly')
    .optional()
    .isBoolean()
    .withMessage('familyFriendly must be a boolean'),

  body('accessibility.petFriendly')
    .optional()
    .isBoolean()
    .withMessage('petFriendly must be a boolean'),

  body('accessibility.covered')
    .optional()
    .isBoolean()
    .withMessage('covered must be a boolean'),

  body('accessibility.indoor')
    .optional()
    .isBoolean()
    .withMessage('indoor must be a boolean'),

  body('accessibility.outdoorSeating')
    .optional()
    .isBoolean()
    .withMessage('outdoorSeating must be a boolean'),

  body('accessibility.wifi')
    .optional()
    .isBoolean()
    .withMessage('wifi must be a boolean'),

  body('accessibility.atm')
    .optional()
    .isBoolean()
    .withMessage('atm must be a boolean'),

  body('accessibility.foodCourt')
    .optional()
    .isBoolean()
    .withMessage('foodCourt must be a boolean'),

  body('accessibility.liveMusic')
    .optional()
    .isBoolean()
    .withMessage('liveMusic must be a boolean'),

  body('accessibility.handicapParking')
    .optional()
    .isBoolean()
    .withMessage('handicapParking must be a boolean'),

  body('accessibility.alcoholAvailable')
    .optional()
    .isBoolean()
    .withMessage('alcoholAvailable must be a boolean'),

  // Tags validation
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag must be less than 30 characters'),

  // Images validation
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('promoter')
    .optional()
    .isMongoId()
    .withMessage('Invalid promoter ID'),

  body('createdBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid creator ID'),

  body('createdByType')
    .optional()
    .isIn(['vendor', 'promoter', 'admin'])
    .withMessage('Invalid creator type'),

  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),

  body('amenities.*')
    .optional()
    .isIn(['restrooms', 'parking', 'wifi', 'atm', 'food_court', 'playground', 'pet_friendly', 'accessible', 'covered_area', 'electricity', 'water'])
    .withMessage('Invalid amenity'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft', 'pending_approval', 'suspended', 'cancelled'])
    .withMessage('Invalid status'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),

  body('applicationsEnabled')
    .optional()
    .isBoolean()
    .withMessage('applicationsEnabled must be a boolean'),

  handleValidationErrors
]

const validateMarketUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Market name must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
    .trim()
    .escape(),
  
  body('category')
    .optional()
    .isIn([
      'farmers-market',
      'arts-crafts',
      'flea-market',
      'food-festival',
      'craft-fair',
      'antique-market',
      'seasonal-event',
      'community-event',
      'holiday-market',
      'other'
    ])
    .withMessage('Invalid market category'),
  
  body('vendorInfo.capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  
  body('vendorInfo.applicationFee.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Application fee must be a positive number'),
  
  handleValidationErrors
]

// Enhanced comment validation with XSS prevention
const validateCommentCreation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters')
    .customSanitizer(sanitizeString)
    .custom((value) => {
      // Check for suspicious patterns that might indicate XSS attempts
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ]

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Comment contains potentially malicious content')
        }
      }
      return true
    }),

  body('market')
    .isMongoId()
    .withMessage('Invalid market ID'),

  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID'),

  handleValidationErrors
]

// Photo validation
const validatePhotoUpload = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters')
    .trim()
    .escape(),
  
  body('caption')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Caption must be less than 500 characters')
    .trim()
    .escape(),
  
  body('market')
    .isMongoId()
    .withMessage('Invalid market ID'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag must be less than 30 characters')
    .trim()
    .escape(),
  
  handleValidationErrors
]

// Todo validation
const validateTodoCreation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Todo title must be between 1 and 200 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim()
    .escape(),
  
  body('category')
    .isIn([
      'setup',
      'products',
      'marketing',
      'logistics',
      'post-event',
      'financial',
      'travel',
      'equipment',
      'permits',
      'other',
      'misc'
    ])
    .withMessage('Invalid todo category'),
  
  body('priority')
    .isIn(['urgent', 'high', 'medium', 'low'])
    .withMessage('Invalid priority level'),
  
  body('market')
    .isMongoId()
    .withMessage('Invalid market ID'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  
  handleValidationErrors
]

// Expense validation
const validateExpenseCreation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Expense title must be between 1 and 200 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim()
    .escape(),
  
  body('category')
    .isIn([
      'booth-fee',
      'supplies',
      'equipment',
      'transportation',
      'accommodation',
      'food-meals',
      'marketing',
      'insurance',
      'permits-licenses',
      'gasoline',
      'parking',
      'storage',
      'shipping',
      'utilities',
      'miscellaneous',
      'revenue'
    ])
    .withMessage('Invalid expense category'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('actualAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual amount must be a positive number'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code')
    .toUpperCase(),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit-card', 'debit-card', 'check', 'bank-transfer', 'paypal', 'other'])
    .withMessage('Invalid payment method'),

  body('marketId')
    .trim()
    .notEmpty().withMessage('Market ID is required')
    .isMongoId()
    .withMessage('Invalid market ID'),

  body('isTaxDeductible')
    .optional()
    .isBoolean()
    .withMessage('Tax deductible flag must be a boolean'),
  
  body('taxCategory')
    .optional()
    .isIn(['office-expenses', 'travel', 'meals', 'transportation', 'equipment', 'supplies', 'other'])
    .withMessage('Invalid tax category'),
  
  handleValidationErrors
]

// Application validation
const validateApplicationCreation = [
  body('market')
    .isMongoId()
    .withMessage('Invalid market ID'),
  
  body('applicationData.notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Application notes must be less than 1000 characters')
    .trim()
    .escape(),
  
  body('applicationData.fields')
    .optional()
    .isArray()
    .withMessage('Application fields must be an array'),
  
  body('applicationData.fields.*.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Field name must be less than 100 characters')
    .trim()
    .escape(),
  
  handleValidationErrors
]

// ID parameter validation
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),

  handleValidationErrors
]

// Market type parameter validation
const validateMarketTypeParam = [
  param('marketType')
    .isIn(['vendor-created', 'promoter-managed'])
    .withMessage('Market type must be either vendor-created or promoter-managed'),

  handleValidationErrors
]

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Sort field is required'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
]

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  query('category')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Category is required'),
  
  query('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
    .trim()
    .escape(),

  query('marketType')
    .optional()
    .isIn(['vendor-created', 'promoter-managed'])
    .withMessage('Market type must be either vendor-created or promoter-managed'),
  
  handleValidationErrors
]

// Message validation with enhanced XSS prevention
const validateMessageCreation = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters')
    .customSanitizer(sanitizeString)
    .custom((value) => {
      // Check for suspicious patterns that might indicate XSS or injection attempts
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /\b(eval|alert|document\.|window\.|location\.)/i
      ]

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Message contains potentially malicious content')
        }
      }
      return true
    }),

  body('recipientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid recipient ID'),

  handleValidationErrors
]

// Market conversion validation
const validateMarketConversionRequest = [
  body('toType')
    .isIn(['vendor', 'promoter', 'admin'])
    .withMessage('Target conversion type must be vendor, promoter, or admin'),

  body('reason')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters')
    .customSanitizer(sanitizeString),

  body('details')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Details must be less than 2000 characters')
    .customSanitizer(sanitizeString),

  body('conversionData.businessLicense')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Business license must be less than 100 characters')
    .trim()
    .escape(),

  body('conversionData.insuranceCertificate')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Insurance certificate must be less than 100 characters')
    .trim()
    .escape(),

  body('conversionData.contactEmail')
    .optional()
    .isEmail()
    .withMessage('Contact email must be valid')
    .normalizeEmail(),

  body('conversionData.contactPhone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Contact phone must be less than 20 characters')
    .trim()
    .escape(),

  handleValidationErrors
]

const validateConversionReview = [
  body('action')
    .isIn(['approve', 'reject', 'review'])
    .withMessage('Action must be approve, reject, or review'),

  body('reviewNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review notes must be less than 1000 characters')
    .customSanitizer(sanitizeString),

  body('rejectionReason')
    .if(body('action').equals('reject'))
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
    .customSanitizer(sanitizeString),

  handleValidationErrors
]

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateMarketCreation,
  validateMarketUpdate,
  validateCommentCreation,
  validatePhotoUpload,
  validateTodoCreation,
  validateExpenseCreation,
  validateMessageCreation,
  validateApplicationCreation,
  validateMongoId,
  validatePagination,
  validateSearch,
  validateMarketTypeParam,
  validateMarketConversionRequest,
  validateConversionReview
}
