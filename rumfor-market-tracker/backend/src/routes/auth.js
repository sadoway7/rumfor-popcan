const express = require('express')
const router = express.Router()

const {
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
} = require('../controllers/authController')

const { verifyToken, verifyRefreshToken } = require('../middleware/auth')
const { validateUserRegistration, validateUserLogin, validateUserUpdate } = require('../middleware/validation')

// Public routes
router.post('/register', validateUserRegistration, register)
router.post('/login', validateUserLogin, login)
router.post('/refresh-token', verifyRefreshToken, refreshToken)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify-email', verifyEmail)

// Development helper - never expose in production!
if (process.env.NODE_ENV === 'development') {
  router.post('/reset-token', getResetToken)
}

// Two-factor authentication routes (some public, some protected)
const { verifyTwoFactorToken } = require('../middleware/auth') // We'll need to implement this
router.post('/2fa/login', verifyTwoFactorToken, verifyTwoFactorLogin) // Public but requires 2FA session

// Protected routes
router.use(verifyToken) // All routes below require authentication

router.get('/me', getMe)
router.patch('/me', validateUserUpdate, updateMe)
router.patch('/change-password', changePassword)
router.post('/resend-verification', resendVerification)
router.post('/logout', logout)
router.delete('/account', deleteAccount)

// Two-factor authentication protected routes
router.post('/2fa/setup', setupTwoFactor)
router.post('/2fa/verify-setup', verifyTwoFactorSetup)
router.post('/2fa/disable', disableTwoFactor)
router.get('/2fa/status', getTwoFactorStatus)
router.post('/2fa/regenerate-codes', regenerateBackupCodes)

module.exports = router