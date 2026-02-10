const User = require('../models/User');
const UserMarketTracking = require('../models/UserMarketTracking');
const Market = require('../models/Market');
const fs = require('fs/promises');
const path = require('path');
const { catchAsync, AppError, sendSuccess } = require('../middleware/errorHandler');

// Helper function to save file locally
const saveFileLocally = async (fileBuffer, filename) => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, fileBuffer);
  return `/uploads/${filename}`;
};

// Get vendor profile
exports.getVendorProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Find vendor user
  const vendor = await User.findOne({ 
    _id: id, 
    role: 'vendor',
    isActive: true 
  }).select('-password');
  
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }
  
  // Get vendor's market statistics
  const stats = await UserMarketTracking.aggregate([
    { $match: { user: vendor._id } },
    {
      $group: {
        _id: null,
        totalMarkets: { $sum: 1 },
        approvedApplications: {
          $sum: {
            $cond: [{ $eq: ['$status', 'approved'] }, 1, 0]
          }
        },
        yearsActive: {
          $dateDiff: {
            startDate: { $min: '$createdAt' },
            endDate: new Date(),
            unit: 'year'
          }
        },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  
  // Format vendor profile data
  const vendorProfile = {
    id: vendor._id,
    userId: vendor._id,
    businessName: vendor.businessName || '',
    businessDescription: vendor.businessDescription || '',
    blurb: vendor.bio || '',
    specialties: [], // TODO: Add specialties field to User model
    avatar: vendor.profileImage || '',
    coverImage: '', // TODO: Add coverImage field to User model
    website: '', // TODO: Add website field to User model
    socialMedia: {}, // TODO: Add socialMedia field to User model
    stats: stats[0] || {
      totalMarkets: 0,
      approvedApplications: 0,
      yearsActive: 0,
      averageRating: 0
    },
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt
  };
  
  res.status(200).json({
    success: true,
    data: vendorProfile
  });
});

// Get vendor with markets
exports.getVendorMarkets = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Find vendor user
  const vendor = await User.findOne({ 
    _id: id, 
    role: 'vendor',
    isActive: true 
  }).select('-password');
  
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }
  
  // Get vendor's market tracking records
  const trackingRecords = await UserMarketTracking.find({ 
    user: vendor._id 
  })
  .populate({
    path: 'market',
    select: 'name category description location schedule status tags images',
    match: { isActive: true }
  })
  .sort({ createdAt: -1 });
  
  // Format vendor with markets data
  const vendorWithMarkets = {
    id: vendor._id,
    userId: vendor._id,
    businessName: vendor.businessName || '',
    businessDescription: vendor.businessDescription || '',
    blurb: vendor.bio || '',
    specialties: [], // TODO: Add specialties field to User model
    avatar: vendor.profileImage || '',
    coverImage: '', // TODO: Add coverImage field to User model
    website: '', // TODO: Add website field to User model
    socialMedia: {}, // TODO: Add socialMedia field to User model
    stats: {
      totalMarkets: trackingRecords.length,
      approvedApplications: trackingRecords.filter(r => r.status === 'approved').length,
      yearsActive: new Date().getFullYear() - vendor.createdAt.getFullYear(),
      averageRating: 0 // TODO: Calculate from ratings
    },
    user: {
      id: vendor._id,
      email: vendor.email,
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      role: vendor.role,
      avatar: vendor.profileImage || '',
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      isEmailVerified: vendor.isEmailVerified,
      isActive: vendor.isActive
    },
    markets: trackingRecords
      .filter(record => record.market) // Filter out null markets
      .map(record => ({
        id: record.market._id,
        name: record.market.name,
        category: record.market.category,
        status: record.status,
        joinedAt: record.createdAt,
        tracking: {
          id: record._id,
          status: record.status,
          notes: record.notes,
          todoCount: record.todoCount || 0,
          todoProgress: record.todoProgress || 0,
          totalExpenses: record.totalExpenses || 0
        }
      }))
  };
  
  res.status(200).json({
    success: true,
    data: vendorWithMarkets
  });
});

// Get vendor's market attendance
exports.getVendorAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Find vendor user
  const vendor = await User.findOne({ 
    _id: id, 
    role: 'vendor',
    isActive: true 
  });
  
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }
  
  // Get vendor's market tracking records with full market details
  const trackingRecords = await UserMarketTracking.find({ 
    user: vendor._id 
  })
  .populate({
    path: 'market',
    select: 'name category description location schedule contact status images tags accessibility applicationFields',
    match: { isActive: true }
  })
  .sort({ createdAt: -1 });
  
  // Format attendance data
  const attendance = trackingRecords
    .filter(record => record.market) // Filter out null markets
    .map(record => ({
      market: {
        id: record.market._id,
        name: record.market.name,
        category: record.market.category,
        description: record.market.description,
        location: record.market.location,
        schedule: record.market.schedule,
        status: record.market.status,
        marketType: record.market.createdByType === 'vendor' ? 'vendor-created' : 'promoter-managed',
        applicationsEnabled: record.market.applicationFields && record.market.applicationFields.length > 0,
        stats: {
          viewCount: record.market.viewCount || 0,
          favoriteCount: record.market.favoriteCount || 0,
          applicationCount: record.market.applicationCount || 0,
          commentCount: record.market.commentCount || 0,
          rating: record.market.rating || 0,
          reviewCount: record.market.reviewCount || 0
        },
        images: record.market.images || [],
        tags: record.market.tags || [],
        accessibility: record.market.accessibility || {},
        contact: record.market.contact || {},
        applicationFields: record.market.applicationFields || [],
        createdAt: record.market.createdAt,
        updatedAt: record.market.updatedAt
      },
      tracking: {
        id: record._id,
        userId: record.user,
        marketId: record.market._id,
        status: record.status,
        notes: record.notes || '',
        todoCount: record.todoCount || 0,
        todoProgress: record.todoProgress || 0,
        totalExpenses: record.totalExpenses || 0,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      },
      status: record.status,
      joinedAt: record.createdAt
    }));
  
  res.status(200).json({
    success: true,
    data: attendance
  });
});

// Update vendor profile
exports.updateVendorProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    businessName,
    businessDescription,
    blurb,
    specialties,
    website,
    socialMedia
  } = req.body;
  
  // Find and update vendor
  const vendor = await User.findOneAndUpdate(
    { 
      _id: id, 
      role: 'vendor',
      isActive: true 
    },
    {
      businessName,
      businessDescription,
      bio: blurb,
      // TODO: Add specialties, website, socialMedia fields to User model
    },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }
  
  // Format updated profile
  const updatedProfile = {
    id: vendor._id,
    userId: vendor._id,
    businessName: vendor.businessName || '',
    businessDescription: vendor.businessDescription || '',
    blurb: vendor.bio || '',
    specialties: specialties || [],
    avatar: vendor.profileImage || '',
    coverImage: '', // TODO: Add coverImage field to User model
    website: website || '',
    socialMedia: socialMedia || {},
    stats: {
      totalMarkets: 0,
      approvedApplications: 0,
      yearsActive: new Date().getFullYear() - vendor.createdAt.getFullYear(),
      averageRating: 0
    },
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt
  };
  
  res.status(200).json({
    success: true,
    data: updatedProfile
  });
});

// Upload vendor avatar
exports.uploadVendorAvatar = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }
  
  // Generate unique filename
  const fileExt = path.extname(req.file.originalname);
  const fileName = `vendor_avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`;
  
  // Save file locally
  const imageUrl = await saveFileLocally(req.file.buffer, fileName);
  
  // Update user's profile image
  const vendor = await User.findByIdAndUpdate(
    id,
    { profileImage: imageUrl },
    { new: true }
  ).select('-password');
  
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      url: imageUrl
    }
  });
});

// Upload vendor cover image
exports.uploadVendorCover = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }
  
  // Generate unique filename
  const fileExt = path.extname(req.file.originalname);
  const fileName = `vendor_cover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`;
  
  // Save file locally
  const imageUrl = await saveFileLocally(req.file.buffer, fileName);
  
  // TODO: Add coverImage field to User model
  // For now, we'll store it in a temporary way or return the URL
  
  res.status(200).json({
    success: true,
    data: {
      url: imageUrl
    }
  });
});