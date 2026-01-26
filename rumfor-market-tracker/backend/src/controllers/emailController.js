const EmailConfig = require('../models/EmailConfig')
const EmailTemplate = require('../models/EmailTemplate')
const emailService = require('../services/emailService')
const emailTemplateService = require('../services/emailTemplateService')
const { encrypt, decrypt, mask } = require('../utils/encryption')

/**
 * Get current email configuration
 * GET /api/v1/admin/email/config
 */
const getEmailConfig = async (req, res) => {
  try {
    const config = await EmailConfig.getConfig()
    
    // Mask the password before sending to client
    const safeConfig = {
      ...config.toObject(),
      password: config.password ? mask(decrypt(config.password)) : ''
    }
    
    res.json({
      success: true,
      data: safeConfig
    })
  } catch (error) {
    console.error('Error getting email config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve email configuration'
    })
  }
}

/**
 * Update email configuration
 * POST /api/v1/admin/email/config
 */
const updateEmailConfig = async (req, res) => {
  try {
    const {
      host,
      port,
      secure,
      username,
      password,
      fromEmail,
      fromName,
      replyTo,
      isActive
    } = req.body
    
    // Validate required fields
    if (!host || !port || !username || !fromEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }
    
    // Prepare updates
    const updates = {
      host,
      port: parseInt(port),
      secure: secure === true || secure === 'true',
      username,
      fromEmail,
      fromName: fromName || 'RumFor Market Tracker',
      replyTo: replyTo || '',
      isActive: isActive !== false
    }
    
    // Only update password if provided (not masked)
    if (password && !password.includes('*')) {
      updates.password = encrypt(password)
    }
    
    // Update or create config
    const config = await EmailConfig.updateConfig(updates, req.user._id)
    
    // Return safe version
    const safeConfig = {
      ...config.toObject(),
      password: config.password ? mask(decrypt(config.password)) : ''
    }
    
    res.json({
      success: true,
      message: 'Email configuration updated successfully',
      data: safeConfig
    })
  } catch (error) {
    console.error('Error updating email config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update email configuration'
    })
  }
}

/**
 * Test email connection
 * POST /api/v1/admin/email/test-connection
 */
const testEmailConnection = async (req, res) => {
  try {
    const result = await emailService.testEmailConnection()
    
    // Update last test status in config
    const config = await EmailConfig.getConfig()
    if (config) {
      config.lastTestedAt = new Date()
      config.lastTestStatus = result.success ? 'success' : 'failed'
      config.lastTestError = result.success ? null : result.message
      await config.save()
    }
    
    res.json(result)
  } catch (error) {
    console.error('Error testing email connection:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Send test email
 * POST /api/v1/admin/email/send-test
 */
const sendTestEmail = async (req, res) => {
  try {
    const { to, testConfig } = req.body
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email is required'
      })
    }
    
    // If testConfig is provided, use it (for testing before saving)
    const config = testConfig ? {
      host: testConfig.host,
      port: testConfig.port,
      secure: testConfig.secure,
      username: testConfig.username,
      password: testConfig.password, // Not encrypted in test
      fromEmail: testConfig.fromEmail,
      fromName: testConfig.fromName
    } : null
    
    const result = await emailService.sendTestEmail(to, config)
    
    res.json(result)
  } catch (error) {
    console.error('Error sending test email:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get all email templates
 * GET /api/v1/admin/email/templates
 */
const getEmailTemplates = async (req, res) => {
  try {
    const { category, active } = req.query
    
    let query = {}
    if (category) query.category = category
    if (active !== undefined) query.isActive = active === 'true'
    
    const templates = await EmailTemplate.find(query)
      .sort({ category: 1, name: 1 })
      .select('-__v')
    
    res.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error getting email templates:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve email templates'
    })
  }
}

/**
 * Get single email template
 * GET /api/v1/admin/email/templates/:id
 */
const getEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params
    
    // Try by ID first, then by slug
    let template = await EmailTemplate.findById(id)
    if (!template) {
      template = await EmailTemplate.findOne({ slug: id })
    }
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      })
    }
    
    res.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Error getting email template:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve email template'
    })
  }
}

/**
 * Create new email template
 * POST /api/v1/admin/email/templates
 */
const createEmailTemplate = async (req, res) => {
  try {
    const {
      slug,
      name,
      description,
      subject,
      htmlContent,
      textContent,
      variables,
      category,
      isActive,
      isSystem
    } = req.body
    
    // Validate required fields
    if (!slug || !name || !subject || !htmlContent || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }
    
    // Check if slug already exists
    const existing = await EmailTemplate.findOne({ slug })
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Template with this slug already exists'
      })
    }
    
    const template = await EmailTemplate.create({
      slug,
      name,
      description,
      subject,
      htmlContent,
      textContent,
      variables: variables || [],
      category,
      isActive: isActive !== false,
      isSystem: isSystem === true,
      createdBy: req.user._id,
      updatedBy: req.user._id
    })
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    })
  } catch (error) {
    console.error('Error creating email template:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create email template'
    })
  }
}

/**
 * Update email template
 * PUT /api/v1/admin/email/templates/:id
 */
const updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      subject,
      htmlContent,
      textContent,
      variables,
      category,
      isActive
    } = req.body
    
    const template = await EmailTemplate.findById(id)
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      })
    }
    
    // Update fields
    if (name) template.name = name
    if (description !== undefined) template.description = description
    if (subject) template.subject = subject
    if (htmlContent) template.htmlContent = htmlContent
    if (textContent !== undefined) template.textContent = textContent
    if (variables) template.variables = variables
    if (category) template.category = category
    if (isActive !== undefined) template.isActive = isActive
    
    template.updatedBy = req.user._id
    
    await template.save()
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    })
  } catch (error) {
    console.error('Error updating email template:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update email template'
    })
  }
}

/**
 * Delete email template
 * DELETE /api/v1/admin/email/templates/:id
 */
const deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params
    
    const template = await EmailTemplate.findById(id)
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      })
    }
    
    // Prevent deletion of system templates
    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system templates'
      })
    }
    
    await EmailTemplate.findByIdAndDelete(id)
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting email template:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete email template'
    })
  }
}

/**
 * Preview email template
 * POST /api/v1/admin/email/templates/:id/preview
 */
const previewEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params
    const { sampleData } = req.body
    
    const preview = await emailTemplateService.previewTemplate(id, sampleData || {})
    
    res.json({
      success: true,
      data: preview
    })
  } catch (error) {
    console.error('Error previewing email template:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to preview email template'
    })
  }
}

module.exports = {
  getEmailConfig,
  updateEmailConfig,
  testEmailConnection,
  sendTestEmail,
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  previewEmailTemplate
}
