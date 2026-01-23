const express = require('express')
const router = express.Router()

const {
  getPresets,
  getPresetsByCategory,
  createPreset,
  updatePreset,
  deletePreset,
  createTodoFromPreset
} = require('../controllers/todoPresetsController')

const { verifyToken } = require('../middleware/auth')
const { validateMongoId } = require('../middleware/validation')

// Protected routes
router.use(verifyToken)

router.get('/', getPresets)
router.get('/:category', getPresetsByCategory)
router.post('/', createPreset)
router.post('/create-todo', createTodoFromPreset)
router.patch('/:id', validateMongoId('id'), updatePreset)
router.delete('/:id', validateMongoId('id'), deletePreset)

module.exports = router
