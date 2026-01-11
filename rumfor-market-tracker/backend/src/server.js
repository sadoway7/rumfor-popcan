require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const morgan = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const csrf = require('csurf')
const connectDB = require('../config/database')
const User = require('./models/User')

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

// Security middleware
app.use(helmet())

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

// Rate limiting - General API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress
})

// Stricter rate limiting for auth endpoints (5 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  skipSuccessfulRequests: true // Don't count successful logins
})

app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// CSRF token endpoint - provide token for GET requests
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  })
})

// Health check endpoint (no CSRF required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
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

// API routes with auth rate limiting (CSRF disabled for auth - handle via CORS)
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/markets', csrfProtection, marketRoutes)
app.use('/api/applications', csrfProtection, applicationRoutes)
app.use('/api/users', csrfProtection, userRoutes)
app.use('/api/todos', csrfProtection, todoRoutes)
app.use('/api/expenses', csrfProtection, expenseRoutes)
app.use('/api/comments', csrfProtection, commentRoutes)
app.use('/api/photos', csrfProtection, photoRoutes)
app.use('/api/hashtags', csrfProtection, hashtagRoutes)
app.use('/api/admin', csrfProtection, adminRoutes)
app.use('/api/notifications', csrfProtection, notificationRoutes)

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
// Ensure admin user exists
const ensureAdminUser = async () => {
  try {
    const adminEmail = 'sadoway@gmail.com'
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (!existingAdmin) {
      const adminUser = new User({
        username: 'jsadoway',
        email: adminEmail,
        password: 'Oswald1986!',
        role: 'admin',
        isEmailVerified: true,
        profile: {
          firstName: 'James',
          lastName: 'Sadoway',
          bio: 'System administrator'
        },
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          publicProfile: true
        }
      })

      await adminUser.save()
      console.log('👑 Admin user created:', adminEmail)
    } else {
      console.log('👑 Admin user exists:', adminEmail)
    }
  } catch (error) {
    console.error('❌ Error ensuring admin user exists:', error)
  }
}

const startServer = async () => {
  try {
    await connectDB()
    await ensureAdminUser()

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📱 Environment: ${process.env.NODE_ENV}`)
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`)
      console.log(`🔒 CSRF protection enabled`)
      console.log(`⚡ Auth rate limiting: 5 attempts/15min`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
