const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect, requireVendor } = require('../middleware/auth');
const {
  getVendorProfile,
  updateVendorProfile,
  getVendorMarkets,
  getVendorAttendance,
  uploadVendorAvatar,
  uploadVendorCover
} = require('../controllers/vendorController');
const { validateMongoId } = require('../middleware/validation');

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

// Get vendor profile
router.get('/:id/profile', validateMongoId('id'), protect, getVendorProfile);

// Update vendor profile
router.patch('/:id/profile', validateMongoId('id'), protect, requireVendor, updateVendorProfile);

// Get vendor with markets
router.get('/:id/markets', validateMongoId('id'), protect, getVendorMarkets);

// Get vendor's market attendance
router.get('/:id/attendance', validateMongoId('id'), protect, getVendorAttendance);

// Upload vendor avatar
router.post('/:id/avatar', validateMongoId('id'), protect, requireVendor, upload.single('avatar'), uploadVendorAvatar);

// Upload vendor cover image
router.post('/:id/cover', validateMongoId('id'), protect, requireVendor, upload.single('cover'), uploadVendorCover);

module.exports = router;