const crypto = require('crypto')
const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const User = require('../models/User')
const { generateTokens, addAccessTokenToBlacklist, addRefreshTokenToBlacklist, clearUserCache } = require('../middleware/auth')
const { validateUserRegistration, validateUserLogin, validateUserUpdate } = require('../middleware/validation')
const twoFactorService = require('../services/twoFactorService')
const { sendPasswordResetEmail, sendEmailVerification } = require('../services/emailService')

// Register new user
const register = catchAsync(async (req, res, next) => {
  const {
    email,
    password,
    firstName,
    lastName,
    bio,
    phone,
    role,
    preferences = {}
  } = req.body

  const userData = {
    email,
    password,
    firstName,
    lastName,
    bio,
    phone,
    role: role || 'visitor', // Default to visitor if not provided
    preferences,
    lastLogin: new Date()
  }

  const emailVerificationToken = crypto.randomBytes(32).toString('hex')
  const hashedVerificationToken = crypto.createHash('sha256').update(emailVerificationToken).digest('hex')

  // Check if user already exists
  const normalizedEmail = email?.toLowerCase().trim()
  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    return next(new AppError('Email already registered', 400))
  }

  // Create user with duplicate key error handling
  let user
  try {
    user = await User.create({
      ...userData,
      email: normalizedEmail,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    })
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return next(new AppError('Email already registered', 400))
    }
    throw error // Re-throw other errors
  }

  // Send email verification
  try {
    await sendEmailVerification(user.email, emailVerificationToken)
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
  }

  // Generate tokens
  const tokens = generateTokens(user._id, user.tokenVersion)

  // Remove password from response
  user.password = undefined

  sendSuccess(res, {
    user,
    tokens
  }, 'User registered successfully. Please verify your email.', 201)
})

// Login user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Find user and include password for comparison
  const normalizedEmail = email?.toLowerCase().trim()
  const user = await User.findOne({ email: normalizedEmail, isActive: true }).select('+password')

  if (!user) {
    return next(new AppError('Invalid email or password', 401))
  }

  if (!user.isActive) {
    return next(new AppError('Account is inactive. Please contact support.', 401))
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
  const tokens = generateTokens(user._id, user.tokenVersion)

  // Remove password from response
  user.password = undefined

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

  // Implement refresh token rotation: blacklist the old refresh token
  addRefreshTokenToBlacklist(refreshToken, process.env.JWT_REFRESH_EXPIRES_IN || '7d')

  // Generate new tokens
  const tokens = generateTokens(user._id, user.tokenVersion)

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
    'firstName',
    'lastName',
    'bio',
    'phone',
    'preferences'
  ]

  const updates = {}
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field]
    }
  })

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  )

  // Clear user cache since profile was updated
  await clearUserCache(req.user.id)

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
  user.tokenVersion += 1
  await user.save()

  // Clear user cache since token version changed
  await clearUserCache(req.user.id)

  // Generate new tokens
  const tokens = generateTokens(user._id, user.tokenVersion)

  sendSuccess(res, { tokens }, 'Password changed successfully')
})

// Forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  if (!email) {
    return next(new AppError('Email is required', 400))
  }

  const normalizedEmail = email?.toLowerCase().trim()
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    // Don't reveal if user exists or not for security
    return sendSuccess(res, null, 'If an account with that email exists, a password reset link has been sent')
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  await user.save({ validateBeforeSave: false })

  // Log password reset request for security audit
  console.log(`[PASSWORD RESET REQUEST] User ${user.email} requested password reset at ${new Date().toISOString()}`)

  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken)
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError)
    // Don't fail the request if email fails, but log it
  }

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

  if (!user.isActive) {
    return next(new AppError('Account is inactive. Please contact support.', 401))
  }

  // Update password
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  user.tokenVersion += 1

  await user.save()

  // Log token usage for security audit
  console.log(`[PASSWORD RESET] User ${user.email} successfully reset password at ${new Date().toISOString()}`)

  // Security: Do NOT automatically log user in after password reset
  // Return success message only - user must log in manually with new password
  sendSuccess(res, {
    message: 'Password has been reset successfully. Please log in with your new password.'
  }, 'Password reset successful')
})

// Verify email
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body

  if (!token) {
    return next(new AppError('Verification token is required', 400))
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  })

  if (!user) {
    return next(new AppError('Invalid verification token', 400))
  }

  // Mark email as verified
  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpires = undefined
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
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000
  await user.save({ validateBeforeSave: false })

  // Send email verification
  try {
    await sendEmailVerification(user.email, verificationToken)
  } catch (emailError) {
    console.error('Failed to send email verification:', emailError)
    // Don't fail the request if email fails, but log it
  }

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

  // Clear user cache
  await clearUserCache(req.user.id)

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

// Development helper endpoint - get password reset token (never expose in production!)
const getResetToken = catchAsync(async (req, res, next) => {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return next(new AppError('Endpoint not available in production', 404))
  }

  const { email } = req.body

  if (!email) {
    return next(new AppError('Email is required', 400))
  }

  const normalizedEmail = email?.toLowerCase().trim()
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  sendSuccess(res, {
    hasResetToken: !!user.passwordResetToken,
    resetExpires: user.passwordResetExpires,
    email: user.email
  }, 'Reset token status retrieved')
})

// Two-Factor Authentication

// Setup 2FA - Generate secret and QR code
const setupTwoFactor = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  // Generate secret
  const secret = twoFactorService.generateSecret()

  // Generate QR code
  const qrCode = await twoFactorService.generateQRCode(secret, user.username)

  // Store temporary secret (not persisted)
  user.twoFactorTempSecret = secret.base32
  await user.save()

  sendSuccess(res, {
    secret: secret.base32,
    qrCode,
    message: 'Scan the QR code with your authenticator app'
  }, 'Two-factor authentication setup initiated')
})

// Verify 2FA setup token and enable 2FA
const verifyTwoFactorSetup = catchAsync(async (req, res, next) => {
  const { token } = req.body

  if (!token) {
    return next(new AppError('Verification token is required', 400))
  }

  const user = await User.findById(req.user.id)

  if (!user || !user.twoFactorTempSecret) {
    return next(new AppError('Two-factor setup not initiated', 400))
  }

  // Verify the token
  const isValid = twoFactorService.verifyToken(user.twoFactorTempSecret, token)

  if (!isValid) {
    return next(new AppError('Invalid verification token', 400))
  }

  // Generate backup codes
  const backupCodes = twoFactorService.generateBackupCodes()

  // Enable 2FA
  user.twoFactorEnabled = true
  user.twoFactorSecret = twoFactorService.encryptSecret(user.twoFactorTempSecret)
  user.twoFactorBackupCodes = twoFactorService.encryptBackupCodes(backupCodes)
  user.twoFactorTempSecret = undefined // Clear temporary secret

  await user.save()

  sendSuccess(res, {
    backupCodes,
    message: 'Two-factor authentication enabled. Save your backup codes securely.'
  }, 'Two-factor authentication enabled successfully')
})

// Verify 2FA token during login
const verifyTwoFactorLogin = catchAsync(async (req, res, next) => {
  const { token, backupCode } = req.body

  // Either token or backup code is required
  if (!token && !backupCode) {
    return next(new AppError('Two-factor token or backup code is required', 400))
  }

  const user = req.user

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return next(new AppError('Two-factor authentication not enabled', 400))
  }

  let isValid = false

  if (token) {
    // Decrypt secret and verify token
    const decryptedSecret = twoFactorService.decryptSecret(user.twoFactorSecret)
    isValid = twoFactorService.verifyToken(decryptedSecret, token)
  } else if (backupCode) {
    // Verify backup code (consumes it)
    isValid = twoFactorService.verifyAndConsumeBackupCode(user, backupCode)
    if (isValid) {
      await user.save() // Save to persist backup code consumption
    }
  }

  if (!isValid) {
    return next(new AppError('Invalid two-factor token or backup code', 401))
  }

  // Generate tokens and complete login
  const tokens = generateTokens(user._id, user.tokenVersion)

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  // Remove password from response
  user.password = undefined

  sendSuccess(res, {
    user,
    tokens
  }, 'Login successful')
})

// Disable 2FA
const disableTwoFactor = catchAsync(async (req, res, next) => {
  const { password } = req.body

  if (!password) {
    return next(new AppError('Password is required to disable 2FA', 400))
  }

  const user = await User.findById(req.user.id).select('+password')

  // Verify current password
  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    return next(new AppError('Invalid password', 400))
  }

  // Disable 2FA
  user.twoFactorEnabled = false
  user.twoFactorSecret = undefined
  user.twoFactorBackupCodes = undefined
  user.twoFactorTempSecret = undefined

  await user.save()

  sendSuccess(res, null, 'Two-factor authentication disabled successfully')
})

// Get 2FA status
const getTwoFactorStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  sendSuccess(res, {
    enabled: user.twoFactorEnabled || false,
    hasBackupCodes: twoFactorService.hasBackupCodes(user)
  }, 'Two-factor authentication status retrieved')
})

// Regenerate backup codes
const regenerateBackupCodes = catchAsync(async (req, res, next) => {
  const { password } = req.body

  if (!password) {
    return next(new AppError('Password is required to regenerate backup codes', 400))
  }

  const user = await User.findById(req.user.id).select('+password')

  if (!user.twoFactorEnabled) {
    return next(new AppError('Two-factor authentication is not enabled', 400))
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    return next(new AppError('Invalid password', 400))
  }

  // Generate new backup codes
  const backupCodes = twoFactorService.generateBackupCodes()
  user.twoFactorBackupCodes = twoFactorService.encryptBackupCodes(backupCodes)

  await user.save()

  sendSuccess(res, {
    backupCodes,
    message: 'Backup codes regenerated. Previous codes are no longer valid.'
  }, 'Backup codes regenerated successfully')
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
  deleteAccount,
  getResetToken,
  // Two-factor authentication
  setupTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactorLogin,
  disableTwoFactor,
  getTwoFactorStatus,
  regenerateBackupCodes
}
