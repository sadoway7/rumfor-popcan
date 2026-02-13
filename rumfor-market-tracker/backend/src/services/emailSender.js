const EmailLog = require('../models/EmailLog')
const EmailTemplate = require('../models/EmailTemplate')
const EmailConfig = require('../models/EmailConfig')
const nodemailer = require('nodemailer')
const Handlebars = require('handlebars')
const { decrypt } = require('../utils/encryption')

const createTransporter = async () => {
  try {
    const config = await EmailConfig.getConfig()
    
    if (config && config.isActive) {
      const decryptedPassword = decrypt(config.password)
      const authConfig = {
        user: config.username,
        pass: decryptedPassword
      }
      
      if (config.authMethod && config.authMethod !== 'PLAIN') {
        authConfig.method = config.authMethod
      }
      
      return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: authConfig
      })
    }
  } catch (error) {
    console.warn('Could not load email config from database, using environment variables:', error.message)
  }
  
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
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
      }
    })
  }
}

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
    console.warn('Could not load from email from database')
  }
  
  return {
    email: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@rumfor.com',
    name: process.env.EMAIL_FROM_NAME || 'RumFor Market Tracker'
  }
}

const renderTemplate = (content, variables) => {
  try {
    const template = Handlebars.compile(content)
    return template(variables)
  } catch (error) {
    console.error('Template rendering error:', error)
    throw new Error('Failed to render email template')
  }
}

const stripHtml = (html) => {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<script[^>]*>.*<\/script>/gm, '')
    .replace(/<[^>]+>/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const sendEmail = async ({ to, type, userId = null, data = {} }) => {
  let logEntry = null
  
  try {
    logEntry = await EmailLog.create({
      recipient: to,
      recipientId: userId,
      type,
      status: 'pending',
      data
    })
    
    const template = await EmailTemplate.getBySlug(type)
    
    if (!template) {
      throw new Error(`Email template not found: ${type}`)
    }
    
    const defaultVariables = {
      currentYear: new Date().getFullYear(),
      appName: 'RumFor Market Tracker',
      appUrl: process.env.FRONTEND_URL || 'https://rumfor.com',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rumfor.com'
    }
    
    const allVariables = { ...defaultVariables, ...data }
    
    const subject = renderTemplate(template.subject, allVariables)
    const html = renderTemplate(template.htmlContent, allVariables)
    const text = template.textContent 
      ? renderTemplate(template.textContent, allVariables)
      : stripHtml(html)
    
    const from = await getFromEmail()
    const transporter = await createTransporter()
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
      text
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    logEntry.status = 'sent'
    logEntry.messageId = info.messageId
    logEntry.subject = subject
    logEntry.sentAt = new Date()
    await logEntry.save()
    
    console.log(`[EMAIL] Sent ${type} to ${to}: ${info.messageId}`)
    
    return {
      success: true,
      messageId: info.messageId,
      logId: logEntry._id
    }
    
  } catch (error) {
    console.error(`[EMAIL] Failed to send ${type} to ${to}:`, error.message)
    
    if (logEntry) {
      logEntry.status = 'failed'
      logEntry.error = error.message
      await logEntry.save()
    }
    
    return {
      success: false,
      error: error.message,
      logId: logEntry?._id
    }
  }
}

const sendBatch = async (emails) => {
  const results = []
  
  for (const email of emails) {
    const result = await sendEmail(email)
    results.push({
      to: email.to,
      type: email.type,
      ...result
    })
  }
  
  return results
}

module.exports = {
  sendEmail,
  sendBatch,
  createTransporter,
  getFromEmail
}
