const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ============================================
// Token Blacklist for Logout (In-Memory Map-based)
// ============================================

// In-memory storage with TTL (Time To Live) support
const accessTokenBlacklist = new Map() // Map<token, expiryTime>
const refreshTokenBlacklist = new Map() // Map<token, expiryTime>
const userCache = new Map() // Map<userId, {data, expiryTime}>

// Cleanup interval - runs every 5 minutes to remove expired entries
setInterval(() => {
  const now = Date.now()
  
  // Clean access token blacklist
  for (const [token, expiryTime] of accessTokenBlacklist.entries()) {
    if (expiryTime < now) {
      accessTokenBlacklist.delete(token)
    }
  }
  
  // Clean refresh token blacklist
  for (const [token, expiryTime] of refreshTokenBlacklist.entries()) {
    if (expiryTime < now) {
      refreshTokenBlacklist.delete(token)
    }
  }
  
  // Clean user cache
  for (const [userId, entry] of userCache.entries()) {
    if (entry.expiryTime < now) {
      userCache.delete(userId)
    }
  }
}, 5 * 60 * 1000) // Run every 5 minutes

// Add access token to blacklist
const addAccessTokenToBlacklist = async (token, expiresIn = '24h') => {
  const ttl = parseExpiresIn(expiresIn)
  const expiryTime = Date.now() + ttl
  accessTokenBlacklist.set(token, expiryTime)
}

// Add refresh token to blacklist
const addRefreshTokenToBlacklist = async (token, expiresIn = '7d') => {
  const ttl = parseExpiresIn(expiresIn)
  const expiryTime = Date.now() + ttl
  refreshTokenBlacklist.set(token, expiryTime)
}

// Check if access token is blacklisted
const isAccessTokenBlacklisted = async (token) => {
  const expiryTime = accessTokenBlacklist.get(token)
  if (!expiryTime) return false
  
  // Check if expired
  if (expiryTime < Date.now()) {
    accessTokenBlacklist.delete(token)
    return false
  }
  
  return true
}

// Check if refresh token is blacklisted
const isRefreshTokenBlacklisted = async (token) => {
  const expiryTime = refreshTokenBlacklist.get(token)
  if (!expiryTime) return false
  
  // Check if expired
  if (expiryTime < Date.now()) {
    refreshTokenBlacklist.delete(token)
    return false
  }
  
  return true
}

// Cache user data in memory
const cacheUser = async (userId, userData, ttl = 300) => { // 5 minutes default
  const expiryTime = Date.now() + (ttl * 1000)
  userCache.set(userId.toString(), {
    data: { ...userData }, // Shallow copy to prevent reference issues
    expiryTime
  })
}

// Get cached user data
const getCachedUser = async (userId) => {
  const entry = userCache.get(userId.toString())
  if (!entry) return null
  
  // Check if expired
  if (entry.expiryTime < Date.now()) {
    userCache.delete(userId.toString())
    return null
  }
  
  return entry.data
}

// Clear user cache
const clearUserCache = async (userId) => {
  userCache.delete(userId.toString())
}

// Helper to parse expiresIn string to milliseconds
const parseExpiresIn = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn)
  if (!match) return 24 * 60 * 60 * 1000 // default 24h
  const value = parseInt(match[1])
  const unit = match[2]
  switch (unit) {
    case 's': return value * 1000
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    default: return 24 * 60 * 60 * 1000
  }
}

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    console.log('[DEBUG BACKEND] verifyToken called for:', req.path, req.method)
    const authHeader = req.header('Authorization')
    console.log('[DEBUG BACKEND] authHeader:', authHeader ? authHeader.substring(0, 20) + '...' : 'none')

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Expected Bearer token.'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('[DEBUG BACKEND] token extracted, length:', token.length)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    // Check if token is blacklisted
    const isBlacklisted = await isAccessTokenBlacklisted(token)
    if (isBlacklisted) {
      console.log('[DEBUG BACKEND] token is blacklisted')
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please log in again.'
      })
    }
    
    // In development, accept mock tokens
    let decoded
    if (process.env.NODE_ENV === 'development' && token.startsWith('mock-jwt-token-')) {
      // Extract user ID from mock token format: mock-jwt-token-{userId}-{timestamp}
      const parts = token.split('-')
      if (parts.length >= 4) {
        const userId = parts[3] // user ID is at index 3
        decoded = { id: userId, tv: 0 }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid mock token format.'
        })
      }
    } else {
      // Verify real JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set')
      }
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log('[DEBUG BACKEND] JWT decoded:', { id: decoded.id, tv: decoded.tv })
    }

    // Try to get user from cache first
    let user = await getCachedUser(decoded.id)

    if (!user) {
      // Get user from database
      user = await User.findById(decoded.id).select('-password').lean()
      console.log('[DEBUG BACKEND] user found in DB:', !!user, user ? { id: user._id, active: user.isActive, locked: user.isLocked } : null)

      if (user) {
        // Cache the user for 5 minutes
        await cacheUser(decoded.id, user, 300)
      }
    } else {
      console.log('[DEBUG BACKEND] user found in cache:', { id: user._id, active: user.isActive, locked: user.isLocked })
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      })
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts.'
      })
    }

    if (decoded.tv !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please log in again.'
      })
    }

    // Attach user to request (convert back to mongoose doc if needed, but since we use lean(), it's a plain object)
    req.user = user
    console.log('[DEBUG BACKEND] req.user set to:', { hasUser: !!req.user, userKeys: req.user ? Object.keys(req.user) : null, userId: req.user ? req.user._id : null })
    next()
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      })
    }
    
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    })
  }
}

// Middleware to verify refresh token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      })
    }

    // Check if refresh token is blacklisted
    const isBlacklisted = await isRefreshTokenBlacklisted(refreshToken)
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked. Please log in again.'
      })
    }

    // Verify refresh token
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set')
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    // Try to get user from cache first
    let user = await getCachedUser(decoded.id)

    if (!user) {
      // Get user from database
      user = await User.findById(decoded.id).select('-password').lean()

      if (user) {
        // Cache the user for 5 minutes
        await cacheUser(decoded.id, user, 300)
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token - user not found.'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      })
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked.'
      })
    }

    if (decoded.tv !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked. Please log in again.'
      })
    }

    // Attach user to request
    req.user = user
    next()

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired.'
      })
    }

    console.error('Refresh token verification error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during refresh token verification.'
    })
  }
}

// Middleware to check if user has specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      })
    }
    
    next()
  }
}

// Middleware to check if user is admin
const requireAdmin = requireRole('admin')

// Middleware to check if user is vendor or admin
const requireVendor = requireRole('vendor', 'admin')

// Middleware to check if user is promoter or admin
const requirePromoter = requireRole('promoter', 'admin')

// Middleware to check if user is verified promoter or admin
const requireVerifiedPromoter = async (req, res, next) => {
  console.log('[DEBUG requireVerifiedPromoter] Called with:', {
    hasUser: !!req.user,
    userRole: req.user?.role,
    bodyMarketType: req.body?.marketType
  })
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  // Admin can do anything
  if (req.user.role === 'admin') {
    console.log('[DEBUG requireVerifiedPromoter] Admin allowed')
    return next()
  }
  
  // Allow vendors to create vendor-created markets
  if (req.user.role === 'vendor') {
    const marketType = req.body?.marketType
    console.log('[DEBUG requireVerifiedPromoter] Vendor role, marketType:', marketType)
    if (marketType === 'vendor-created') {
      console.log('[MARKET CREATION] Vendor creating vendor-created market, bypassing promoter verification')
      return next()
    }
    console.log('[DEBUG requireVerifiedPromoter] Vendor rejected: marketType not vendor-created')
    return res.status(403).json({
      success: false,
      message: 'Vendors can only create vendor-created markets.'
    })
  }
  
  // Check if promoter is verified
  if (req.user.role === 'promoter') {
    console.log('[DEBUG requireVerifiedPromoter] Promoter role, allowing')
    return next()
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Verified promoter status required.'
  })
}

// Middleware to check if user owns the resource or has admin privileges
const requireOwnershipOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }

    // Admin can access anything
    if (req.user.role === 'admin') {
      return next()
    }

    // Check ownership
    const resourceUserId = req[resourceField] || req.body[resourceField] || req.params[resourceField]

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: `Cannot determine ownership of resource. Field: ${resourceField}`
      })
    }

    // Convert to string for comparison
    const resourceOwnerId = resourceUserId.toString()
    const currentUserId = req.user._id.toString()

    if (resourceOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      })
    }

    next()
  }
}

// Middleware to check if vendor owns the resource or has admin privileges
const requireVendorOwnershipOrAdmin = (vendorField = 'vendor') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }

    // Admin can access anything
    if (req.user.role === 'admin') {
      return next()
    }

    // User must be vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      })
    }

    // Check vendor ownership
    const resourceVendorId = req[vendorField] || req.body[vendorField] || req.params[vendorField]

    if (!resourceVendorId) {
      return res.status(400).json({
        success: false,
        message: `Cannot determine vendor ownership of resource. Field: ${vendorField}`
      })
    }

    // Convert to string for comparison
    const resourceOwnerId = resourceVendorId.toString()
    const currentUserId = req.user._id.toString()

    if (resourceOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own vendor resources.'
      })
    }

    next()
  }
}

// Middleware to verify 2FA token for 2FA-enabled login
const verifyTwoFactorToken = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for 2FA verification.'
      })
    }

    // Find user by email
    const normalizedEmail = email?.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail }).select('+twoFactorEnabled +twoFactorSecret +twoFactorBackupCodes')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      })
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked.'
      })
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is not enabled for this account.'
      })
    }

    // Attach user to request for the controller
    req.user = user
    next()

  } catch (error) {
    console.error('2FA token verification middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during 2FA verification.'
    })
  }
}

// Optional auth middleware - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next()
    }

    const token = authHeader.substring(7)

    if (!token) {
      return next()
    }

    // Check if token is blacklisted
    const isBlacklisted = await isAccessTokenBlacklisted(token)
    if (isBlacklisted) {
      return next() // Continue without authentication
    }

    // Try to verify token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Try to get user from cache first
    let user = await getCachedUser(decoded.id)

    if (!user) {
      // Get user from database
      user = await User.findById(decoded.id).select('-password').lean()

      if (user) {
        // Cache the user for 5 minutes
        await cacheUser(decoded.id, user, 300)
      }
    }

    if (user && user.isActive && !user.isLocked && decoded.tv === user.tokenVersion) {
      req.user = user
    }

    next()

  } catch (error) {
    // Token verification failed, but continue without authentication
    next()
  }
}

// Middleware to check email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required to access this resource.'
    })
  }
  
  next()
}

// Generate JWT token
const generateToken = (userId, tokenVersion = 0, expiresIn = '24h') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return jwt.sign(
    { id: userId, tv: tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

// Generate refresh token
const generateRefreshToken = (userId, tokenVersion = 0, expiresIn = '7d') => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set')
  }
  return jwt.sign(
    { id: userId, tv: tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn }
  )
}

// Generate tokens pair
const generateTokens = (userId, tokenVersion = 0) => {
  const accessToken = generateToken(userId, tokenVersion, process.env.JWT_EXPIRES_IN || '24h')
  const refreshToken = generateRefreshToken(userId, tokenVersion, process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  
  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
}

module.exports = {
  verifyToken,
  verifyRefreshToken,
  requireRole,
  requireAdmin,
  requirePromoter,
  requireVendor,
  requireVerifiedPromoter,
  requireOwnershipOrAdmin,
  requireVendorOwnershipOrAdmin,
  optionalAuth,
  requireEmailVerification,
  verifyTwoFactorToken,
  generateToken,
  generateRefreshToken,
  generateTokens,
  addAccessTokenToBlacklist,
  addRefreshTokenToBlacklist,
  isAccessTokenBlacklisted,
  isRefreshTokenBlacklisted,
  cacheUser,
  getCachedUser,
  clearUserCache
}
