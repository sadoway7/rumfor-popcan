const mongoose = require('mongoose')

const emailConfigSchema = new mongoose.Schema({
  // SMTP Settings
  host: { 
    type: String, 
    required: true,
    default: 'rumfor.com'
  },
  port: { 
    type: Number, 
    required: true, 
    default: 465 
  },
  secure: {
    type: Boolean,
    default: true
  },
  authMethod: {
    type: String,
    enum: ['PLAIN', 'LOGIN', 'CRAM-MD5'],
    default: 'PLAIN'
  },
  username: {
    type: String,
    required: true,
    default: 'noreply@rumfor.com'
  },
  password: {
    type: String,
    required: true
  }, // Encrypted password
  
  // Sender Settings
  fromEmail: { 
    type: String, 
    required: true,
    default: 'noreply@rumfor.com'
  },
  fromName: { 
    type: String, 
    default: 'RumFor Market Tracker' 
  },
  replyTo: { 
    type: String 
  },
  
  // Status and Testing
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastTestedAt: { 
    type: Date 
  },
  lastTestStatus: { 
    type: String, 
    enum: ['success', 'failed', null],
    default: null
  },
  lastTestError: { 
    type: String 
  },
  
  // Metadata
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
})

// Only allow one configuration document (singleton)
emailConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne()
  
  // If no config exists, create default one from environment variables
  if (!config) {
    config = await this.create({
      host: process.env.SMTP_HOST || 'rumfor.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      username: process.env.SMTP_USER || 'noreply@rumfor.com',
      password: process.env.SMTP_PASS || '', // Will need to be encrypted
      fromEmail: process.env.EMAIL_FROM || 'noreply@rumfor.com',
      fromName: process.env.EMAIL_FROM_NAME || 'RumFor Market Tracker',
      replyTo: process.env.EMAIL_REPLY_TO || ''
    })
  }
  
  return config
}

// Update the configuration (only one should exist)
emailConfigSchema.statics.updateConfig = async function(updates, userId) {
  let config = await this.findOne()
  
  if (!config) {
    // Create if doesn't exist
    updates.updatedBy = userId
    config = await this.create(updates)
  } else {
    // Update existing
    Object.assign(config, updates)
    config.updatedBy = userId
    await config.save()
  }
  
  return config
}

module.exports = mongoose.model('EmailConfig', emailConfigSchema)
