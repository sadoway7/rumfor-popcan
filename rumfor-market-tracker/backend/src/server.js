require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const morgan = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const csrf = require('csurf')
const connectDB = require('../config/database')

// Import middleware
const { extractVersionFromPath, addVersionHeaders, handleDeprecation } = require('./middleware/versioning')

// Import routes
const authRoutes = require('./routes/auth')
const marketRoutes = require('./routes/markets')
const applicationRoutes = require('./routes/applications')
const userRoutes = require('./routes/users')
const todoRoutes = require('./routes/todos')
const expenseRoutes = require('./routes/expenses')
const commentRoutes = require('./routes/comments')
const photoRoutes = require('./routes/photos')
const hashtagRoutes = require('./routes/hashtags')
const adminRoutes = require('./routes/admin')
const notificationRoutes = require('./routes/notifications')

const app = express()

// Import enhanced rate limiting middleware
const { userRateLimiter, authRateLimiter, passwordResetLimiter, uploadRateLimiter } = require('./middleware/rateLimiter')

// Security middleware - Enhanced helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.unsplash.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// Session middleware for CSRF token storage
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/rumfor-market-tracker',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}))

// CSRF Protection setup
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
})

// Enhanced Rate Limiting - User-based limits
app.use('/api/', userRateLimiter('general'))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}))

// Version extraction and headers middleware
app.use('/api', extractVersionFromPath)
app.use('/api', addVersionHeaders)
app.use('/api', handleDeprecation)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API version info endpoint
app.get('/api', (req, res) => {
  const { getVersionInfo } = require('./middleware/versioning')
  res.json({
    message: 'Rumfor Market Tracker API',
    ...getVersionInfo()
  })
})

// CSRF token endpoint - provide token for GET requests
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  })
})

// Health check endpoint with version info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    version: req.apiVersion || 'v1'
  })
})

// Apply CSRF protection to state-changing routes
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired CSRF token. Please refresh the page and try again.'
    })
  }
  next(err)
}

// API routes with enhanced rate limiting and CSRF protection
// Legacy routes without versioning (for backward compatibility)
app.use('/api/auth/login', authRateLimiter)
app.use('/api/auth/register', authRateLimiter)
app.use('/api/auth/forgot-password', passwordResetLimiter)
app.use('/api/auth/reset-password', passwordResetLimiter)

app.use('/api/auth', csrfProtection, authRoutes)
app.use('/api/markets', csrfProtection, marketRoutes)
app.use('/api/applications', csrfProtection, applicationRoutes)
app.use('/api/users', csrfProtection, userRoutes)
app.use('/api/todos', csrfProtection, todoRoutes)
app.use('/api/expenses', csrfProtection, expenseRoutes)
app.use('/api/comments', csrfProtection, commentRoutes)
app.use('/api/photos', uploadRateLimiter, csrfProtection, photoRoutes)
app.use('/api/hashtags', csrfProtection, hashtagRoutes)
app.use('/api/admin', csrfProtection, adminRoutes)
app.use('/api/notifications', csrfProtection, notificationRoutes)

// Versioned routes (v1)
app.use('/api/v1/auth/login', authRateLimiter)
app.use('/api/v1/auth/register', authRateLimiter)
app.use('/api/v1/auth/forgot-password', passwordResetLimiter)
app.use('/api/v1/auth/reset-password', passwordResetLimiter)

app.use('/api/v1/auth', csrfProtection, authRoutes)
app.use('/api/v1/markets', csrfProtection, marketRoutes)
app.use('/api/v1/applications', csrfProtection, applicationRoutes)
app.use('/api/v1/users', csrfProtection, userRoutes)
app.use('/api/v1/todos', csrfProtection, todoRoutes)
app.use('/api/v1/expenses', csrfProtection, expenseRoutes)
app.use('/api/v1/comments', csrfProtection, commentRoutes)
app.use('/api/v1/photos', uploadRateLimiter, csrfProtection, photoRoutes)
app.use('/api/v1/hashtags', csrfProtection, hashtagRoutes)
app.use('/api/v1/admin', csrfProtection, adminRoutes)
app.use('/api/v1/notifications', csrfProtection, notificationRoutes)

// CSRF error handler
app.use(csrfErrorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err)
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

const PORT = process.env.PORT || 3001

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB()
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📱 Environment: ${process.env.NODE_ENV}`)
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`)
      console.log(`🔒 CSRF protection enabled`)
      console.log(`⚡ Enhanced user-based rate limiting enabled`)
      console.log(`🛡️ Security headers (HSTS, CSP, etc.) configured`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
