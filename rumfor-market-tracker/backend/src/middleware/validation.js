const { body, param, query, validationResult } = require('express-validator')

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    })
  }
  
  next()
}

// Validation chains for different entities

// User validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .trim()
    .escape(),
  
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .trim()
    .escape(),
  
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
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .trim()
    .escape(),
  
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .trim()
    .escape(),
  
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .trim()
    .escape(),
  
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim()
    .escape(),
  
  body('profile.location.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters')
    .trim()
    .escape(),
  
  body('profile.location.state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters')
    .trim()
    .escape(),
  
  body('profile.business.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Business name must be less than 100 characters')
    .trim()
    .escape(),
  
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be a boolean'),
  
  handleValidationErrors
]

// Market validation
const validateMarketCreation = [
  body('name')
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
  
  body('location.address')
    .isLength({ min: 1 })
    .withMessage('Address is required')
    .trim()
    .escape(),
  
  body('location.city')
    .isLength({ min: 1 })
    .withMessage('City is required')
    .trim()
    .escape(),
  
  body('location.state')
    .isLength({ min: 1 })
    .withMessage('State is required')
    .trim()
    .escape(),
  
  body('location.country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters')
    .trim()
    .escape(),
  
  body('dates.type')
    .isIn(['recurring', 'one-time', 'seasonal'])
    .withMessage('Invalid date type'),
  
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

// Comment validation
const validateCommentCreation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters')
    .trim()
    .escape(),
  
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
      'other'
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
  
  body('market')
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
  validateApplicationCreation,
  validateMongoId,
  validatePagination,
  validateSearch
}