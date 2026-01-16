const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  // Basic market information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },

  // Promoter/Admin who created the market
  promoter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Location information
  location: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'USA' }
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    googlePlaceId: String,
    formattedAddress: String
  },

  // Market details
  marketType: {
    type: String,
    enum: ['farmers', 'flea', 'artisan', 'food_truck', 'craft', 'antique', 'specialty'],
    required: true
  },
  category: {
    type: String,
    enum: ['produce', 'baked_goods', 'meat', 'dairy', 'crafts', 'art', 'jewelry', 'clothing', 'books', 'antiques', 'food_trucks', 'plants', 'mixed'],
    required: true
  },

  // Schedule information
  schedule: {
    recurring: {
      type: Boolean,
      default: false
    },
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: {
      type: String, // "HH:MM" format
      required: true
    },
    endTime: {
      type: String, // "HH:MM" format
      required: true
    },
    specialDates: [{
      date: { type: Date, required: true },
      startTime: String,
      endTime: String,
      notes: String
    }],
    seasonStart: Date,
    seasonEnd: Date
  },

  // Application settings
  applicationSettings: {
    acceptVendors: { type: Boolean, default: true },
    maxVendors: Number,
    applicationFee: { type: Number, default: 0 },
    boothFee: { type: Number, default: 0 },
    requirements: {
      businessLicense: { type: Boolean, default: false },
      insurance: { type: Boolean, default: false },
      healthPermit: { type: Boolean, default: false },
      liabilityInsurance: { type: Boolean, default: false }
    },
    customRequirements: [String]
  },

  // Images and media
  images: [{
    url: { type: String, required: true },
    alt: String,
    isHero: { type: Boolean, default: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Contact information
  contact: {
    email: String,
    phone: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },

  // Amenities and features
  amenities: [{
    type: String,
    enum: ['restrooms', 'parking', 'wifi', 'atm', 'food_court', 'playground', 'pet_friendly', 'accessible', 'covered_area', 'electricity', 'water']
  }],

  // Vendor information (populated from applications)
  vendorCount: { type: Number, default: 0 },
  vendors: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    businessName: String,
    boothNumber: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active'
    },
    joinedAt: { type: Date, default: Date.now }
  }],

  // Market statistics and engagement
  stats: {
    viewCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
  },

  // Moderation and status
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'active', 'inactive', 'suspended', 'cancelled'],
    default: 'draft'
  },
  isPublic: { type: Boolean, default: false },
  moderationNotes: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,

  // Tags and search
  tags: [String],
  keywords: [String],

  // Audit fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Indexes for performance
marketSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index
marketSchema.index({ marketType: 1 });
marketSchema.index({ category: 1 });
marketSchema.index({ status: 1 });
marketSchema.index({ isPublic: 1 });
marketSchema.index({ promoter: 1 });
marketSchema.index({ 'location.address.city': 1 });
marketSchema.index({ 'location.address.state': 1 });
marketSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search
marketSchema.index({ createdAt: -1 });
marketSchema.index({ 'stats.rating': -1 });
marketSchema.index({ 'stats.favoriteCount': -1 });

// Virtual for full address
marketSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Virtual for next market date
marketSchema.virtual('nextMarketDate').get(function() {
  if (!this.schedule.recurring) return null;

  const now = new Date();
  const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const marketDays = this.schedule.daysOfWeek.map(day => {
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    return dayMap[day.toLowerCase()];
  });

  // Find next market day
  let daysUntilNext = 7; // Max 7 days ahead
  for (const marketDay of marketDays) {
    const daysDiff = (marketDay - today + 7) % 7;
    if (daysDiff > 0 || (daysDiff === 0 && now.getHours() < parseInt(this.schedule.endTime.split(':')[0]))) {
      daysUntilNext = Math.min(daysUntilNext, daysDiff);
      break;
    }
  }

  if (daysUntilNext < 7) {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntilNext);
    return nextDate;
  }

  return null;
});

// Calculate distance from coordinates (instance method)
marketSchema.methods.getDistanceFrom = function(lat, lng) {
  // Haversine formula for distance calculation
  const R = 3959; // Earth's radius in miles
  const dLat = (lat - this.location.coordinates.lat) * Math.PI / 180;
  const dLng = (lng - this.location.coordinates.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.coordinates.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Update statistics (instance method)
marketSchema.methods.updateStats = async function() {
  try {
    const [
      applicationCount,
      vendorCount,
      commentCount,
      favoriteCount
    ] = await Promise.all([
      mongoose.model('Application').countDocuments({ market: this._id }),
      mongoose.model('Application').countDocuments({ market: this._id, status: 'approved' }),
      mongoose.model('Comment').countDocuments({ market: this._id, targetType: 'market' }),
      mongoose.model('UserMarketTracking').countDocuments({ market: this._id })
    ]);

    this.vendorCount = vendorCount;
    this.stats.applicationCount = applicationCount;
    this.stats.commentCount = commentCount;
    this.stats.favoriteCount = favoriteCount;

    await this.save();
  } catch (error) {
    console.error('Error updating market stats:', error);
  }
};

// Static method to find nearby markets
marketSchema.statics.findNearby = function(lat, lng, maxDistance = 25) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance * 1609.34 // Convert miles to meters
      }
    },
    status: 'active',
    isPublic: true
  });
};

module.exports = mongoose.model('Market', marketSchema);