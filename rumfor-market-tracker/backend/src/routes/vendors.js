const express = require('express');
const multer = require('multer');
const router = express.Router();
const { verifyToken, requireVendor, optionalAuth } = require('../middleware/auth');
const {
  getVendors,
  getVendorProfile,
  updateVendorProfile,
  getVendorMarkets,
  getVendorAttendance,
  uploadVendorAvatar,
  uploadVendorCover
} = require('../controllers/vendorController');
const { validateMongoId, validateVendorProfileUpdate, validatePagination, validateSearch } = require('../middleware/validation');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'))
    }
  }
});

// === Public routes ===

// List/search vendors (public)
router.get('/', validatePagination, validateSearch, getVendors);

// Get vendor profile (public)
router.get('/:id/profile', validateMongoId('id'), getVendorProfile);

// === Protected routes ===
router.use(verifyToken);

// Get vendor with markets (authenticated)
router.get('/:id/markets', validateMongoId('id'), getVendorMarkets);

// Get vendor's market attendance (authenticated)
router.get('/:id/attendance', validateMongoId('id'), getVendorAttendance);

// Update vendor profile (vendor only, ownership checked in controller)
router.patch('/:id/profile', validateMongoId('id'), requireVendor, validateVendorProfileUpdate, updateVendorProfile);

// Upload vendor avatar (vendor only, ownership checked in controller)
router.post('/:id/avatar', validateMongoId('id'), requireVendor, upload.single('avatar'), uploadVendorAvatar);

// Upload vendor cover image (vendor only, ownership checked in controller)
router.post('/:id/cover', validateMongoId('id'), requireVendor, upload.single('cover'), uploadVendorCover);

module.exports = router;