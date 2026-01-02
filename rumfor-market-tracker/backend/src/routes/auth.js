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
  deleteAccount
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

// Protected routes
router.use(verifyToken) // All routes below require authentication

router.get('/me', getMe)
router.patch('/me', validateUserUpdate, updateMe)
router.patch('/change-password', changePassword)
router.post('/resend-verification', resendVerification)
router.post('/logout', logout)
router.delete('/account', deleteAccount)

module.exports = router