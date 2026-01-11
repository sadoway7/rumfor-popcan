const crypto = require('crypto')
const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const User = require('../models/User')
const { generateTokens, addAccessTokenToBlacklist, addRefreshTokenToBlacklist } = require('../middleware/auth')
const { validateUserRegistration, validateUserLogin, validateUserUpdate } = require('../middleware/validation')

// Register new user
const register = catchAsync(async (req, res, next) => {
  const {
    username,
    email,
    password,
    profile = {},
    preferences = {}
  } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (existingUser) {
    if (existingUser.email === email) {
      return next(new AppError('Email already registered', 400))
    }
    if (existingUser.username === username) {
      return next(new AppError('Username already taken', 400))
    }
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    profile,
    preferences
  })

  // Generate tokens
  const tokens = generateTokens(user._id)

  // Remove password from response
  user.password = undefined

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  sendSuccess(res, {
    user,
    tokens
  }, 'User registered successfully', 201)
})

// Login user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new AppError('Invalid email or password', 401))
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(new AppError('Account is temporarily locked due to too many failed login attempts', 423))
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts()
    return next(new AppError('Invalid email or password', 401))
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts()
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  // Generate tokens
  const tokens = generateTokens(user._id)

  // Remove password from response
  user.password = undefined

  // Auto-verify user if not already verified (development mode)
  if (!user.isEmailVerified) {
    user.isEmailVerified = true
    await user.save()
  }

  sendSuccess(res, {
    user,
    tokens
  }, 'Login successful')
})

// Refresh token
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400))
  }

  // The verifyRefreshToken middleware will handle token validation
  const user = req.user

  // Generate new tokens
  const tokens = generateTokens(user._id)

  sendSuccess(res, {
    tokens
  }, 'Token refreshed successfully')
})

// Get current user
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  sendSuccess(res, { user }, 'User retrieved successfully')
})

// Update current user
const updateMe = catchAsync(async (req, res, next) => {
  const allowedUpdates = [
    'username',
    'profile',
    'preferences'
  ]

  const updates = {}
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field]
    }
  })

  // If updating username, check uniqueness
  if (updates.username) {
    const existingUser = await User.findOne({
      username: updates.username,
      _id: { $ne: req.user.id }
    })

    if (existingUser) {
      return next(new AppError('Username already taken', 400))
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  )

  sendSuccess(res, { user }, 'Profile updated successfully')
})

// Change password
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return next(new AppError('Current password and new password are required', 400))
  }

  if (newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters long', 400))
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password')

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword)

  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400))
  }

  // Update password
  user.password = newPassword
  await user.save()

  // Generate new tokens
  const tokens = generateTokens(user._id)

  sendSuccess(res, { tokens }, 'Password changed successfully')
})

// Forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  if (!email) {
    return next(new AppError('Email is required', 400))
  }

  const user = await User.findOne({ email })

  if (!user) {
    // Don't reveal if user exists or not for security
    return sendSuccess(res, null, 'If an account with that email exists, a password reset link has been sent')
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  await user.save({ validateBeforeSave: false })

  // In a real application, you would send an email here
  // For now, we'll just return success
  // await sendPasswordResetEmail(user.email, resetToken)

  sendSuccess(res, null, 'Password reset link sent to your email')
})

// Reset password
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body

  if (!token || !password) {
    return next(new AppError('Token and new password are required', 400))
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400))
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  // Update password
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()

  // Generate tokens
  const tokens = generateTokens(user._id)

  sendSuccess(res, {
    user,
    tokens
  }, 'Password reset successful')
})

// Verify email
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body

  if (!token) {
    return next(new AppError('Verification token is required', 400))
  }

  const user = await User.findOne({
    emailVerificationToken: token
  })

  if (!user) {
    return next(new AppError('Invalid verification token', 400))
  }

  // Mark email as verified
  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  await user.save()

  sendSuccess(res, null, 'Email verified successfully')
})

// Resend email verification
const resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400))
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
  await user.save({ validateBeforeSave: false })

  // In a real application, send email here
  // await sendVerificationEmail(user.email, verificationToken)

  sendSuccess(res, null, 'Verification email sent')
})

// Logout
const logout = catchAsync(async (req, res, next) => {
  // Get the access token from Authorization header
  const authHeader = req.header('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.substring(7)
    addAccessTokenToBlacklist(accessToken, process.env.JWT_EXPIRES_IN || '24h')
  }
  
  // Get the refresh token from body (client should send it)
  const { refreshToken } = req.body
  if (refreshToken) {
    addRefreshTokenToBlacklist(refreshToken, process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  }
  
  sendSuccess(res, null, 'Logged out successfully')
})

// Delete account
const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body

  if (!password) {
    return next(new AppError('Password is required to delete account', 400))
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password')

  // Verify password
  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    return next(new AppError('Password is incorrect', 401))
  }

  // In a real application, you might want to:
  // 1. Soft delete the user
  // 2. Anonymize their data
  // 3. Remove personal information
  
  await User.findByIdAndDelete(req.user.id)

  sendSuccess(res, null, 'Account deleted successfully')
})

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout,
  deleteAccount
}