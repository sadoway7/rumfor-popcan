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

// Helper: build public vendor card data from a User document
const buildVendorCardData = (vendor) => ({
  id: vendor._id || vendor.id,
  firstName: vendor.firstName,
  lastName: vendor.lastName,
  businessName: vendor.businessName || '',
  tagline: vendor.vendorProfile?.tagline || vendor.businessDescription || '',
  blurb: vendor.vendorProfile?.blurb || vendor.bio || '',
  cardColor: vendor.vendorProfile?.cardColor || null,
  profileImage: vendor.vendorProfile?.profileImage || vendor.profileImage || '',
  productCategories: vendor.vendorProfile?.productCategories || [],
  website: vendor.vendorProfile?.website || '',
});

// List/search vendors (public, paginated)
const getVendors = catchAsync(async (req, res, _next) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50);

  // Build query: only active vendors
  const query = { role: 'vendor', isActive: true };

  // Search by businessName or tagline
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { businessName: searchRegex },
      { 'vendorProfile.tagline': searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
    ];
  }

  // Filter by product category
  if (category) {
    query['vendorProfile.productCategories'] = category;
  }

  // Build sort
  const allowedSorts = ['createdAt', 'businessName', 'firstName'];
  const sortField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const [vendors, total] = await Promise.all([
    User.find(query)
      .select('firstName lastName businessName businessDescription bio profileImage vendorProfile createdAt')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  const vendorCards = vendors.map(buildVendorCardData);

  sendSuccess(res, {
    vendors: vendorCards,
    pagination: {
      current: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      limit: limitNum,
    },
  }, 'Vendors retrieved successfully');
});

// Get vendor profile (public)
const getVendorProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const vendor = await User.findOne({
    _id: id,
    role: 'vendor',
    isActive: true,
  }).select('-password -twoFactorSecret -twoFactorBackupCodes -twoFactorTempSecret -loginAttempts -lockUntil -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

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
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
        },
        attendingMarkets: {
          $sum: { $cond: [{ $eq: ['$status', 'attending'] }, 1, 0] },
        },
      },
    },
  ]);

  // Get upcoming markets (approved or attending, with future dates)
  const upcomingTracking = await UserMarketTracking.find({
    user: vendor._id,
    status: { $in: ['approved', 'attending'] },
    isArchived: false,
  })
    .populate({
      path: 'market',
      select: 'name category description location schedule status images tags createdByType',
      match: { isActive: true },
    })
    .sort({ createdAt: -1 })
    .limit(20);

  const upcomingMarkets = upcomingTracking
    .filter((record) => record.market)
    .map((record) => ({
      id: record.market._id,
      name: record.market.name,
      category: record.market.category,
      description: record.market.description,
      location: record.market.location,
      schedule: record.market.schedule,
      status: record.status,
      images: record.market.images || [],
      tags: record.market.tags || [],
      marketType: record.market.createdByType === 'vendor' ? 'vendor-created' : 'promoter-managed',
      joinedAt: record.createdAt,
    }));

  const yearsActive = Math.max(0, new Date().getFullYear() - vendor.createdAt.getFullYear());

  const vendorData = {
    ...buildVendorCardData(vendor),
    bio: vendor.bio || '',
    stats: stats[0]
      ? {
          totalMarkets: stats[0].totalMarkets,
          approvedApplications: stats[0].approvedApplications,
          attendingMarkets: stats[0].attendingMarkets,
          yearsActive,
        }
      : {
          totalMarkets: 0,
          approvedApplications: 0,
          attendingMarkets: 0,
          yearsActive,
        },
    upcomingMarkets,
    createdAt: vendor.createdAt,
  };

  sendSuccess(res, { vendor: vendorData }, 'Vendor profile retrieved successfully');
});

// Get vendor with markets (authenticated)
const getVendorMarkets = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const vendor = await User.findOne({
    _id: id,
    role: 'vendor',
    isActive: true,
  }).select('firstName lastName businessName businessDescription bio profileImage vendorProfile createdAt');

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  const trackingRecords = await UserMarketTracking.find({ user: vendor._id })
    .populate({
      path: 'market',
      select: 'name category description location schedule status tags images',
      match: { isActive: true },
    })
    .sort({ createdAt: -1 });

  const vendorWithMarkets = {
    ...buildVendorCardData(vendor),
    markets: trackingRecords
      .filter((record) => record.market)
      .map((record) => ({
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
          totalExpenses: record.totalExpenses || 0,
        },
      })),
  };

  sendSuccess(res, { vendor: vendorWithMarkets }, 'Vendor markets retrieved successfully');
});

// Get vendor's market attendance (authenticated)
const getVendorAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const vendor = await User.findOne({
    _id: id,
    role: 'vendor',
    isActive: true,
  });

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  const trackingRecords = await UserMarketTracking.find({ user: vendor._id })
    .populate({
      path: 'market',
      select: 'name category description location schedule contact status images tags accessibility applicationFields',
      match: { isActive: true },
    })
    .sort({ createdAt: -1 });

  const attendance = trackingRecords
    .filter((record) => record.market)
    .map((record) => ({
      market: {
        id: record.market._id,
        name: record.market.name,
        category: record.market.category,
        description: record.market.description,
        location: record.market.location,
        schedule: record.market.schedule,
        status: record.market.status,
        marketType: record.market.createdByType === 'vendor' ? 'vendor-created' : 'promoter-managed',
        images: record.market.images || [],
        tags: record.market.tags || [],
      },
      tracking: {
        id: record._id,
        status: record.status,
        notes: record.notes || '',
        todoCount: record.todoCount || 0,
        todoProgress: record.todoProgress || 0,
        totalExpenses: record.totalExpenses || 0,
        createdAt: record.createdAt,
      },
      status: record.status,
      joinedAt: record.createdAt,
    }));

  sendSuccess(res, { attendance }, 'Vendor attendance retrieved successfully');
});

// Update vendor profile (vendor only, ownership enforced)
const updateVendorProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Ownership check: only the vendor themselves or an admin can update
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own profile', 403));
  }

  const {
    businessName,
    businessDescription,
    bio,
    tagline,
    blurb,
    website,
    productCategories,
    cardColor,
  } = req.body;

  // Build update object — only set fields that were provided
  const updates = {};

  if (businessName !== undefined) updates.businessName = businessName;
  if (businessDescription !== undefined) updates.businessDescription = businessDescription;
  if (bio !== undefined) updates.bio = bio;

  // vendorProfile sub-fields
  if (tagline !== undefined) updates['vendorProfile.tagline'] = tagline;
  if (blurb !== undefined) updates['vendorProfile.blurb'] = blurb;
  if (website !== undefined) updates['vendorProfile.website'] = website;
  if (productCategories !== undefined) updates['vendorProfile.productCategories'] = productCategories;
  if (cardColor !== undefined) updates['vendorProfile.cardColor'] = cardColor;

  const vendor = await User.findOneAndUpdate(
    {
      _id: id,
      role: 'vendor',
      isActive: true,
    },
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -twoFactorSecret -twoFactorBackupCodes -twoFactorTempSecret -loginAttempts -lockUntil');

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  sendSuccess(res, { vendor: buildVendorCardData(vendor) }, 'Vendor profile updated successfully');
});

// Upload vendor avatar
const uploadVendorAvatar = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Ownership check
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own profile', 403));
  }

  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  const fileExt = path.extname(req.file.originalname);
  const fileName = `vendor_avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`;

  const imageUrl = await saveFileLocally(req.file.buffer, fileName);

  // Store in vendorProfile.profileImage
  const vendor = await User.findByIdAndUpdate(
    id,
    { $set: { 'vendorProfile.profileImage': imageUrl } },
    { new: true }
  ).select('-password');

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  sendSuccess(res, { url: imageUrl }, 'Avatar uploaded successfully');
});

// Upload vendor cover image
const uploadVendorCover = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Ownership check
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own profile', 403));
  }

  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  const fileExt = path.extname(req.file.originalname);
  const fileName = `vendor_cover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`;

  const imageUrl = await saveFileLocally(req.file.buffer, fileName);

  sendSuccess(res, { url: imageUrl }, 'Cover image uploaded successfully');
});

module.exports = {
  getVendors,
  getVendorProfile,
  getVendorMarkets,
  getVendorAttendance,
  updateVendorProfile,
  uploadVendorAvatar,
  uploadVendorCover,
};
