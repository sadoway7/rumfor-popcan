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
    required: false,
    default: 'A great market for vendors and visitors.',
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

  // Whether the market accepts vendors (always true if they have vendors)
  acceptVendors: { type: Boolean, default: true },
  
  // Whether the application system is enabled for this market (false = not enabled yet)
  applicationsEnabled: { type: Boolean, default: false },
  
  // Who created this market (vendor, promoter, admin)
  createdByType: {
    type: String,
    enum: ['vendor', 'promoter', 'admin'],
    required: true,
    default: 'promoter'
  },

  // Location information
  location: {
    address: {
      street: { type: String, required: false, default: 'TBD' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: false, default: '00000' },
      country: { type: String, default: 'USA' }
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: false,
      default: [0, 0],
      validate: {
        validator: function(v) {
          return !v || (v.length === 2 && v.every(n => typeof n === 'number'))
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    },
    googlePlaceId: String,
    formattedAddress: String
  },

  // Market details
  category: {
    type: String,
    enum: ['farmers-market', 'arts-crafts', 'flea-market', 'food-festival', 'holiday-market', 'craft-show', 'community-event', 'night-market', 'street-fair', 'vintage-antique'],
    required: true
  },
  subcategory: {
    type: String,
    enum: ['produce', 'baked_goods', 'meat', 'dairy', 'crafts', 'art', 'jewelry', 'clothing', 'books', 'antiques', 'food_trucks', 'plants', 'mixed'],
    required: false
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
      required: false,
      default: '08:00'
    },
    endTime: {
      type: String, // "HH:MM" format
      required: false,
      default: '14:00'
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
    acceptVendors: { type: Boolean, default: true }, // Whether market accepts vendor applications
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
marketSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index
marketSchema.index({ category: 1 });
marketSchema.index({ createdByType: 1 }); // For marketType filtering via virtual
marketSchema.index({ status: 1 });
marketSchema.index({ isPublic: 1 });
marketSchema.index({ promoter: 1 });
marketSchema.index({ createdByType: 1 });
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

// Virtual for marketType based on createdByType
// Maps 'vendor' -> 'vendor-created', others -> 'promoter-managed'
marketSchema.virtual('marketType').get(function() {
  return this.createdByType === 'vendor' ? 'vendor-created' : 'promoter-managed';
});

// Virtual for accessibility features based on amenities
marketSchema.virtual('accessibility').get(function() {
  return {
    wheelchairAccessible: this.amenities?.includes('accessible') || false,
    parkingAvailable: this.amenities?.includes('parking') || false,
    restroomsAvailable: this.amenities?.includes('restrooms') || false,
    familyFriendly: this.amenities?.includes('playground') || false, // Assuming playground means family friendly
    petFriendly: this.amenities?.includes('pet_friendly') || false
  };
});

// Virtual for schedule as array of MarketSchedule objects
marketSchema.virtual('schedules').get(function() {
  const schedules = [];
  if (this.schedule) {
    if (this.schedule.recurring && this.schedule.daysOfWeek && this.schedule.daysOfWeek.length > 0) {
      this.schedule.daysOfWeek.forEach(day => {
        const dayMap = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0 };
        const dayOfWeek = dayMap[day.toLowerCase()];
        if (dayOfWeek !== undefined) {
          schedules.push({
            id: `${this._id}_${day}`,
            dayOfWeek,
            startTime: this.schedule.startTime,
            endTime: this.schedule.endTime,
            startDate: this.schedule.seasonStart || new Date().toISOString(),
            endDate: this.schedule.seasonEnd || new Date().toISOString(),
            isRecurring: true
          });
        }
      });
    } else if (this.schedule.specialDates && this.schedule.specialDates.length > 0) {
      this.schedule.specialDates.forEach(date => {
        schedules.push({
          id: `${this._id}_${date.date.getTime()}`,
          dayOfWeek: date.date.getDay(),
          startTime: date.startTime || this.schedule.startTime,
          endTime: date.endTime || this.schedule.endTime,
          startDate: date.date.toISOString(),
          endDate: date.date.toISOString(),
          isRecurring: false
        });
      });
    }
  }
  return schedules;
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