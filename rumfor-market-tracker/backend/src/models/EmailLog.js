const mongoose = require('mongoose')

const emailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  messageId: {
    type: String
  },
  error: {
    type: String
  },
  data: {
    type: Object,
    default: {}
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
})

emailLogSchema.index({ recipient: 1, createdAt: -1 })
emailLogSchema.index({ type: 1, createdAt: -1 })
emailLogSchema.index({ status: 1, createdAt: -1 })
emailLogSchema.index({ recipientId: 1 })

emailLogSchema.statics.getLogsWithFilters = async function(filters = {}, page = 1, limit = 50) {
  const query = {}
  
  if (filters.type) query.type = filters.type
  if (filters.status) query.status = filters.status
  if (filters.recipient) query.recipient = { $regex: filters.recipient, $options: 'i' }
  if (filters.recipientId) query.recipientId = filters.recipientId
  if (filters.startDate || filters.endDate) {
    query.createdAt = {}
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate)
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate)
  }
  
  const logs = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('recipientId', 'email profile.firstName profile.lastName')
  
  const total = await this.countDocuments(query)
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

emailLogSchema.statics.getStats = async function(days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { type: '$type', status: '$status' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        statuses: {
          $push: { status: '$_id.status', count: '$count' }
        },
        total: { $sum: '$count' }
      }
    }
  ])
  
  return stats
}

module.exports = mongoose.model('EmailLog', emailLogSchema)
