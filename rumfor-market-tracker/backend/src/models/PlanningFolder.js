const mongoose = require('mongoose')

const folderColors = [
  'gray', 'red', 'orange', 'amber', 'yellow', 
  'lime', 'green', 'emerald', 'teal', 'cyan', 
  'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink'
]

const folderIcons = [
  'folder', 'briefcase', 'package', 'truck', 'dollar-sign',
  'calendar', 'star', 'tag', 'bookmark', 'flag',
  'shopping-cart', 'gift', 'home', 'map-pin', 'clock'
]

const planningFolderSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [50, 'Folder name must be less than 50 characters']
  },
  color: {
    type: String,
    enum: folderColors,
    default: 'blue'
  },
  icon: {
    type: String,
    enum: folderIcons,
    default: 'folder'
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isCollapsed: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

planningFolderSchema.virtual('itemCount').get(function() {
  return this._itemCount || 0
})

planningFolderSchema.index({ vendor: 1, market: 1 })
planningFolderSchema.index({ vendor: 1, sortOrder: 1 })
planningFolderSchema.index({ market: 1, sortOrder: 1 })

planningFolderSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

planningFolderSchema.statics.getVendorMarketFolders = function(vendorId, marketId) {
  return this.find({
    vendor: vendorId,
    market: marketId,
    isDeleted: false
  }).sort({ sortOrder: 1, createdAt: 1 })
}

module.exports = mongoose.model('PlanningFolder', planningFolderSchema)
