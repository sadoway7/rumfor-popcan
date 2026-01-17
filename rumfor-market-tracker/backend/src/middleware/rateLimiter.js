const rateLimit = require('express-rate-limit')
const { getUserById } = require('../models/User')

// Store for tracking user-specific rate limits
const userRateLimits = new Map()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of userRateLimits) {
    if (data.resetTime < now) {
      userRateLimits.delete(key)
    }
  }
}, 5 * 60 * 1000)

// User-based rate limiting configuration
const getUserRateLimit = (userRole, endpoint) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const devMultiplier = isProduction ? 1 : 10 // 10x limits in development

  const limits = {
    // Standard API endpoints
    general: {
      visitor: { windowMs: 15 * 60 * 1000, max: 50 * devMultiplier },   // 50/500 requests per 15 min
      vendor: { windowMs: 15 * 60 * 1000, max: 200 * devMultiplier },    // 200/2000 requests per 15 min
      promoter: { windowMs: 15 * 60 * 1000, max: 500 * devMultiplier },  // 500/5000 requests per 15 min
      admin: { windowMs: 15 * 60 * 1000, max: 1000 * devMultiplier },    // 1000/10000 requests per 15 min
    },
    // Authentication endpoints
    auth: {
      visitor: { windowMs: 15 * 60 * 1000, max: 5 * devMultiplier },     // 5/50 auth attempts per 15 min
      vendor: { windowMs: 15 * 60 * 1000, max: 10 * devMultiplier },     // 10/100 auth attempts per 15 min
      promoter: { windowMs: 15 * 60 * 1000, max: 15 * devMultiplier },   // 15/150 auth attempts per 15 min
      admin: { windowMs: 15 * 60 * 1000, max: 20 * devMultiplier },      // 20/200 auth attempts per 15 min
    },
    // Write operations (POST, PUT, DELETE)
    write: {
      visitor: { windowMs: 15 * 60 * 1000, max: 20 * devMultiplier },    // 20/200 writes per 15 min
      vendor: { windowMs: 15 * 60 * 1000, max: 100 * devMultiplier },    // 100/1000 writes per 15 min
      promoter: { windowMs: 15 * 60 * 1000, max: 200 * devMultiplier },  // 200/2000 writes per 15 min
      admin: { windowMs: 15 * 60 * 1000, max: 500 * devMultiplier },     // 500/5000 writes per 15 min
    },
    // File upload endpoints
    upload: {
      visitor: { windowMs: 60 * 60 * 1000, max: 5 * devMultiplier },     // 5/50 uploads per hour
      vendor: { windowMs: 60 * 60 * 1000, max: 20 * devMultiplier },     // 20/200 uploads per hour
      promoter: { windowMs: 60 * 60 * 1000, max: 50 * devMultiplier },   // 50/500 uploads per hour
      admin: { windowMs: 60 * 60 * 1000, max: 100 * devMultiplier },     // 100/1000 uploads per hour
    },
    // Vendor dashboard analytics and messaging
    vendorDashboard: {
      visitor: { windowMs: 15 * 60 * 1000, max: 20 * devMultiplier },    // 20/200 requests per 15 min
      vendor: { windowMs: 15 * 60 * 1000, max: 50 * devMultiplier },     // 50/500 analytics/messaging requests per 15 min
      promoter: { windowMs: 15 * 60 * 1000, max: 100 * devMultiplier },  // 100/1000 requests per 15 min
      admin: { windowMs: 15 * 60 * 1000, max: 200 * devMultiplier },     // 200/2000 requests per 15 min
    }
  }

  if (endpoint.url.includes('/auth/')) return limits.auth[userRole] || limits.auth.visitor
  if (endpoint.url.includes('/upload') || endpoint.url.includes('/photos')) return limits.upload[userRole] || limits.upload.visitor
  if (endpoint.url.includes('/vendor-analytics') || endpoint.url.includes('/promoter-messages')) return limits.vendorDashboard[userRole] || limits.vendorDashboard.visitor
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(endpoint.method)) return limits.write[userRole] || limits.write.visitor

  return limits.general[userRole] || limits.general.visitor
}

// User-based rate limiter middleware
const userRateLimiter = (endpointType = 'general') => {
  return async (req, res, next) => {
    try {
      const authHeader = req.header('Authorization')
      let userRole = 'visitor'

      // Determine user role if authenticated
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        // In a real implementation, you'd verify the token and get user role
        // For now, we'll use a simplified approach
        try {
          const jwt = require('jsonwebtoken')
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          // Get user role from decoded token or database
          const User = require('../models/User')
          const user = await User.findById(decoded.id).select('role')
          userRole = user?.role || 'visitor'
        } catch (error) {
          userRole = 'visitor' // Token invalid, treat as visitor
        }
      }

      // Get rate limit configuration for this user and endpoint
      const config = getUserRateLimit(userRole, { method: req.method, url: req.url })

      // Create key for tracking this user's requests
      const key = `${userRole}:${req.ip}:${endpointType}`

      // Get or create user rate limit data
      let userData = userRateLimits.get(key)
      const now = Date.now()

      if (!userData || userData.resetTime < now) {
        userData = {
          count: 0,
          resetTime: now + config.windowMs,
          windowMs: config.windowMs,
          max: config.max
        }
        userRateLimits.set(key, userData)
      }

      // Check if limit exceeded
      if (userData.count >= userData.max) {
        const timeUntilReset = Math.ceil((userData.resetTime - now) / 1000)

        return res.status(429).json({
          success: false,
          message: `Too many requests. Please try again in ${timeUntilReset} seconds.`,
          error: 'Rate limit exceeded',
          retryAfter: timeUntilReset,
          limit: config.max,
          remaining: 0,
          resetTime: new Date(userData.resetTime).toISOString()
        })
      }

      // Increment counter
      userData.count++

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': (config.max - userData.count).toString(),
        'X-RateLimit-Reset': new Date(userData.resetTime).toISOString(),
        'X-RateLimit-Window': config.windowMs.toString()
      })

      next()
    } catch (error) {
      console.error('Rate limiter error:', error)
      next() // Continue if rate limiting fails
    }
  }
}

// IP-based fallback rate limiter for unauthenticated requests
const ipRateLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min prod, 5 min dev
  max: process.env.NODE_ENV === 'production' ? 50 : 500, // 50 prod, 500 dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress
})

// Stricter rate limiter for auth endpoints
const authRateLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 min prod, 1 min dev
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 prod, 100 dev
  message: {
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Too many authentication attempts, please try again after 15 minutes.'
      : 'Too many authentication attempts, please try again after 1 minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  skipSuccessfulRequests: true // Don't count successful logins
})

// Brute force protection for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour per IP
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// File upload rate limiter
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour per IP
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = {
  userRateLimiter,
  ipRateLimiter,
  authRateLimiter,
  passwordResetLimiter,
  uploadRateLimiter
}