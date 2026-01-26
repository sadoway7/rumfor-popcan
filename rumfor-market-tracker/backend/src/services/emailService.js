const nodemailer = require('nodemailer')
const EmailConfig = require('../models/EmailConfig')
const emailTemplateService = require('./emailTemplateService')
const { decrypt } = require('../utils/encryption')

/**
 * Create email transporter with dynamic configuration
 * Uses database config if available, falls back to environment variables
 */
const createTransporter = async () => {
  try {
    // Try to get config from database
    const config = await EmailConfig.getConfig()
    
    if (config && config.isActive) {
      // Use database configuration
      return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: decrypt(config.password) // Decrypt the password
        }
      })
    }
  } catch (error) {
    console.warn('Could not load email config from database, using environment variables:', error.message)
  }
  
  // Fallback to environment variables
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'rumfor.com',
      port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      }
    })
  } else {
    // Development configuration
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
      }
    })
  }
}

/**
 * Get the "from" email configuration
 */
const getFromEmail = async () => {
  try {
    const config = await EmailConfig.getConfig()
    if (config && config.isActive) {
      return {
        email: config.fromEmail,
        name: config.fromName
      }
    }
  } catch (error) {
    console.warn('Could not load from email from database, using environment variables')
  }
  
  // Fallback
  return {
    email: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@rumfor.com',
    name: process.env.EMAIL_FROM_NAME || 'RumFor Market Tracker'
  }
}

/**
 * Send an email using a template
 * @param {string} to - Recipient email address
 * @param {string} templateSlug - Template slug to use
 * @param {object} variables - Variables to replace in template
 * @param {object} options - Additional email options (cc, bcc, attachments, etc.)
 */
const sendTemplatedEmail = async (to, templateSlug, variables = {}, options = {}) => {
  try {
    // Get and render template
    const { subject, html, text } = await emailTemplateService.getAndRenderTemplate(
      templateSlug,
      variables
    )
    
    // Get from email
    const from = await getFromEmail()
    
    // Create transporter
    const transporter = await createTransporter()
    
    // Prepare mail options
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
      text,
      ...options // Allow overriding with additional options
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}: ${info.messageId}`)
    
    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error(`Error sending templated email to ${to}:`, error)
    throw error
  }
}

/**
 * Send a custom email without using templates
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content
 * @param {object} options - Additional options
 */
const sendEmail = async (to, subject, html, text, options = {}) => {
  try {
    const from = await getFromEmail()
    const transporter = await createTransporter()
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
      ...options
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}: ${info.messageId}`)
    
    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error)
    throw error
  }
}

/**
 * Send password reset email using template
 */
const sendPasswordResetEmail = async (email, resetToken, user = {}) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
  
  try {
    await sendTemplatedEmail(email, 'password-reset', {
      firstName: user.firstName || 'User',
      resetUrl,
      expiresIn: '10 minutes'
    })
    
    console.log(`Password reset email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    
    // Fallback to hardcoded template if database template fails
    const from = await getFromEmail()
    const transporter = await createTransporter()
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to: email,
      subject: 'Password Reset - RumFor Market Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p>Hello ${user.firstName || ''},</p>
          <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the following link, or paste this into your browser to complete the process:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent by RumFor Market Tracker. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    }
    
    await transporter.sendMail(mailOptions)
    return true
  }
}

/**
 * Send email verification using template
 */
const sendEmailVerification = async (email, verificationToken, user = {}) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
  
  try {
    await sendTemplatedEmail(email, 'email-verification', {
      firstName: user.firstName || 'User',
      verificationUrl,
      expiresIn: '24 hours'
    })
    
    console.log(`Email verification sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending email verification:', error)
    
    // Fallback to hardcoded template
    const from = await getFromEmail()
    const transporter = await createTransporter()
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to: email,
      subject: 'Verify Your Email - RumFor Market Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
          <p>Hello ${user.firstName || ''},</p>
          <p>Thank you for registering with RumFor Market Tracker! Please verify your email address by clicking the link below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>If you did not create this account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent by RumFor Market Tracker.
          </p>
        </div>
      `
    }
    
    await transporter.sendMail(mailOptions)
    return true
  }
}

/**
 * Send welcome email to new users
 */
const sendWelcomeEmail = async (email, user) => {
  try {
    await sendTemplatedEmail(email, 'welcome', {
      firstName: user.firstName,
      lastName: user.lastName,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    })
    
    console.log(`Welcome email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    // Don't throw - welcome emails are not critical
    return false
  }
}

/**
 * Send application status notification
 */
const sendApplicationStatusEmail = async (email, status, data = {}) => {
  const templateMap = {
    submitted: 'application-submitted',
    'under-review': 'application-under-review',
    approved: 'application-approved',
    rejected: 'application-rejected'
  }
  
  const templateSlug = templateMap[status]
  if (!templateSlug) {
    console.warn(`No template found for application status: ${status}`)
    return false
  }
  
  try {
    await sendTemplatedEmail(email, templateSlug, data)
    console.log(`Application ${status} email sent to ${email}`)
    return true
  } catch (error) {
    console.error(`Error sending application ${status} email:`, error)
    return false
  }
}

/**
 * Send market alert notification
 */
const sendMarketAlertEmail = async (email, data = {}) => {
  try {
    await sendTemplatedEmail(email, 'new-market-alert', data)
    console.log(`Market alert email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending market alert email:', error)
    return false
  }
}

/**
 * Test email connection
 */
const testEmailConnection = async () => {
  try {
    const transporter = await createTransporter()
    await transporter.verify()
    console.log('✅ Email service connection successful')
    return { success: true, message: 'Email connection successful' }
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message)
    return { success: false, message: error.message }
  }
}

/**
 * Send a test email
 */
const sendTestEmail = async (to, config = null) => {
  try {
    let transporter
    
    if (config) {
      // Use provided config for testing
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password // Already decrypted
        }
      })
    } else {
      transporter = await createTransporter()
    }
    
    const from = config 
      ? { email: config.fromEmail, name: config.fromName }
      : await getFromEmail()
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to,
      subject: 'Test Email - RumFor Market Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email from RumFor Market Tracker.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: 'This is a test email from RumFor Market Tracker. If you received this email, your email configuration is working correctly!'
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(`Test email sent to ${to}: ${info.messageId}`)
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending test email:', error)
    return { success: false, message: error.message }
  }
}

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendWelcomeEmail,
  sendApplicationStatusEmail,
  sendMarketAlertEmail,
  testEmailConnection,
  sendTestEmail,
  createTransporter,
  getFromEmail
}
