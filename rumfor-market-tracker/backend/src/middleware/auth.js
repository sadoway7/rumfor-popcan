const jwt = require('jsonwebtoken')
const User = require('../models/User')

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
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.'
      })
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts.'
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
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token - user not found.'
      })
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked.'
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    
    if (user && !user.isLocked) {
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
const generateToken = (userId, expiresIn = '24h') => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

// Generate refresh token
const generateRefreshToken = (userId, expiresIn = '7d') => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn }
  )
}

// Generate tokens pair
const generateTokens = (userId) => {
  const accessToken = generateToken(userId, process.env.JWT_EXPIRES_IN || '24h')
  const refreshToken = generateRefreshToken(userId, process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  
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
  requireVerifiedPromoter,
  requireOwnershipOrAdmin,
  optionalAuth,
  requireEmailVerification,
  generateToken,
  generateRefreshToken,
  generateTokens
}