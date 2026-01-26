const express = require('express')
const router = express.Router()
const emailController = require('../controllers/emailController')
const { verifyToken, requireAdmin } = require('../middleware/auth')

// All email routes require admin authentication
router.use(verifyToken)
router.use(requireAdmin)

// Email Configuration Routes
router.get('/config', emailController.getEmailConfig)
router.post('/config', emailController.updateEmailConfig)
router.post('/test-connection', emailController.testEmailConnection)
router.post('/send-test', emailController.sendTestEmail)

// Email Template Routes
router.get('/templates', emailController.getEmailTemplates)
router.post('/templates', emailController.createEmailTemplate)
router.get('/templates/:id', emailController.getEmailTemplate)
router.put('/templates/:id', emailController.updateEmailTemplate)
router.delete('/templates/:id', emailController.deleteEmailTemplate)
router.post('/templates/:id/preview', emailController.previewEmailTemplate)

module.exports = router
