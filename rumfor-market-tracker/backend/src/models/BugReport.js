const mongoose = require('mongoose')

const bugReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    maxlength: 2000
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

bugReportSchema.index({ status: 1, createdAt: -1 })
bugReportSchema.index({ severity: 1 })
bugReportSchema.index({ reporter: 1 })

bugReportSchema.statics.getOpenReports = function() {
  return this.find({ status: { $in: ['open', 'in-progress'] } })
    .populate('reporter', 'email firstName lastName username')
    .populate('assignedTo', 'email firstName lastName username')
    .sort({ severity: -1, createdAt: -1 })
}

bugReportSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])
  
  const severityStats = await this.aggregate([
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }
    }
  ])
  
  return {
    byStatus: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    bySeverity: severityStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
  }
}

module.exports = mongoose.model('BugReport', bugReportSchema)
