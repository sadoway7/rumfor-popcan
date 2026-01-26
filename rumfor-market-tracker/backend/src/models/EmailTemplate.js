const mongoose = require('mongoose')

const emailTemplateSchema = new mongoose.Schema({
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    enum: [
      'welcome',
      'email-verification',
      'password-reset',
      'application-submitted',
      'application-approved',
      'application-rejected',
      'application-under-review',
      'market-update',
      'new-market-alert',
      'reminder',
      'admin-notification'
    ]
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  subject: { 
    type: String, 
    required: true 
  },
  htmlContent: { 
    type: String, 
    required: true 
  },
  textContent: { 
    type: String 
  }, // Plain text fallback
  
  // Template Variables
  variables: [{
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    example: { 
      type: String 
    },
    required: { 
      type: Boolean, 
      default: false 
    }
  }],
  
  // Categorization
  category: { 
    type: String, 
    enum: ['authentication', 'application', 'notification', 'marketing', 'system'],
    required: true 
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isSystem: { 
    type: Boolean, 
    default: false 
  }, // System templates cannot be deleted
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
})

// Index for faster lookups by slug
emailTemplateSchema.index({ slug: 1 })
emailTemplateSchema.index({ category: 1, isActive: 1 })

// Static method to get template by slug
emailTemplateSchema.statics.getBySlug = async function(slug) {
  return await this.findOne({ slug, isActive: true })
}

// Static method to get all active templates
emailTemplateSchema.statics.getActive = async function() {
  return await this.find({ isActive: true }).sort({ category: 1, name: 1 })
}

// Static method to get templates by category
emailTemplateSchema.statics.getByCategory = async function(category) {
  return await this.find({ category, isActive: true }).sort({ name: 1 })
}

// Prevent deletion of system templates
emailTemplateSchema.pre('remove', function(next) {
  if (this.isSystem) {
    next(new Error('Cannot delete system templates'))
  } else {
    next()
  }
})

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema)
