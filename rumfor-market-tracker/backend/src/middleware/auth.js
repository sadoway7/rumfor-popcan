const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ============================================
// Token Blacklist for Logout
// ============================================
const accessTokenBlacklist = new Map() // token -> expiration timestamp
const refreshTokenBlacklist = new Map() // token -> expiration timestamp

// Clean up expired tokens periodically (every 5 minutes)
const cleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [token, expiration] of accessTokenBlacklist) {
    if (expiration < now) accessTokenBlacklist.delete(token)
  }
  for (const [token, expiration] of refreshTokenBlacklist) {
    if (expiration < now) refreshTokenBlacklist.delete(token)
  }
}, 5 * 60 * 1000)

// Add access token to blacklist
const addAccessTokenToBlacklist = (token, expiresIn = '24h') => {
  const expiration = Date.now() + parseExpiresIn(expiresIn)
  accessTokenBlacklist.set(token, expiration)
}

// Add refresh token to blacklist
const addRefreshTokenToBlacklist = (token, expiresIn = '7d') => {
  const expiration = Date.now() + parseExpiresIn(expiresIn)
  refreshTokenBlacklist.set(token, expiration)
}

// Check if access token is blacklisted
const isAccessTokenBlacklisted = (token) => {
  if (!accessTokenBlacklist.has(token)) return false
  if (accessTokenBlacklist.get(token) < Date.now()) {
    accessTokenBlacklist.delete(token)
    return false
  }
  return true
}

// Check if refresh token is blacklisted
const isRefreshTokenBlacklisted = (token) => {
  if (!refreshTokenBlacklist.has(token)) return false
  if (refreshTokenBlacklist.get(token) < Date.now()) {
    refreshTokenBlacklist.delete(token)
    return false
  }
  return true
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
    const authHeader = req.header('Authorization')
    
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
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    // Check if token is blacklisted
    if (isAccessTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please log in again.'
      })
    }
    
    // Verify token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password')
    
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

    // Attach user to request
    req.user = user
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
    if (isRefreshTokenBlacklisted(refreshToken)) {
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
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password')
    
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
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  // Admin can do anything
  if (req.user.role === 'admin') {
    return next()
  }
  
  // Check if promoter is verified
  if (req.user.role === 'promoter') {
    // In a real implementation, you'd have a separate verification status
    // For now, we'll assume all promoters are verified
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
    
    // Try to verify token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

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
  isRefreshTokenBlacklisted
}
