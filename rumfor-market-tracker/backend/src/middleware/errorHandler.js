const mongoose = require('mongoose')

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

// Handle MongoDB CastError (invalid ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

// Handle MongoDB duplicate field error
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0]
  const value = err.keyValue[field]
  const message = `${field} '${value}' already exists. Please use another value.`
  return new AppError(message, 400)
}

// Handle MongoDB validation error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(val => val.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

// Handle JWT errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401)
}

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401)
}

// Send error in development
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }
  
  // Rendered website
  console.error('ERROR 💥', err)
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  })
}

// Send error in production
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      })
    }
    
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err)
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    })
  }
  
  // Rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    })
  }
  
  // Programming or other unknown error
  console.error('ERROR 💥', err)
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  })
}

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else {
    let error = { ...err }
    error.message = err.message
    
    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    
    sendErrorProd(error, req, res)
  }
}

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

// 404 handler
const notFound = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
  next(err)
}

// Rate limit error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000) || 60
  })
}

// File upload error handler
const handleFileUploadError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB.'
    })
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded. Maximum is 5 files.'
    })
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.'
    })
  }
  
  next(err)
}

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.param || error.path,
    message: error.msg || error.message,
    value: error.value,
    location: error.location
  }))
}

// Create standardized API response
const createApiResponse = (success, data = null, message = '', errors = null, meta = {}) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    ...(message && { message }),
    ...(data !== null && { data }),
    ...(errors && { errors }),
    ...meta
  }
  
  return response
}

// Success response
const sendSuccess = (res, data = null, message = '', statusCode = 200, meta = {}) => {
  return res.status(statusCode).json(
    createApiResponse(true, data, message, null, meta)
  )
}

// Error response
const sendError = (res, message = '', statusCode = 500, errors = null, meta = {}) => {
  return res.status(statusCode).json(
    createApiResponse(false, null, message, errors, meta)
  )
}

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
  notFound,
  rateLimitHandler,
  handleFileUploadError,
  formatValidationErrors,
  createApiResponse,
  sendSuccess,
  sendError
}