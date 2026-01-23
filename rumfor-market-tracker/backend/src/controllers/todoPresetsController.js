const { catchAsync, AppError, sendSuccess } = require('../middleware/errorHandler')
const TodoPreset = require('../models/TodoPreset')

// System presets data
const systemPresetsData = {
  setup: [
    'Complete vendor application',
    'Review market rules and regulations',
    'Design booth layout',
    'Obtain necessary permits and licenses',
    'Set up payment processing system'
  ],
  products: [
    'Prepare product inventory',
    'Price all products',
    'Organize display materials',
    'Prepare product samples',
    'Update product descriptions'
  ],
  marketing: [
    'Create marketing materials',
    'Post on social media',
    'Design promotional flyers',
    'Contact local media',
    'Update business website'
  ],
  logistics: [
    'Arrange transportation',
    'Prepare equipment and tools',
    'Pack display materials',
    'Plan booth setup/breakdown',
    'Confirm accommodation if needed'
  ],
  'post-event': [
    'Clean up booth area',
    'Process payments',
    'Follow up with customers',
    'Review sales performance',
    'Plan for next market'
  ]
}

// Initialize system presets (run once on startup)
const initializeSystemPresets = async () => {
  try {
    for (const [category, titles] of Object.entries(systemPresetsData)) {
      for (const title of titles) {
        const exists = await TodoPreset.findOne({ isSystem: true, title, category })
        if (!exists) {
          await TodoPreset.create({
            user: null, // System presets have no user
            title,
            category,
            priority: 'medium',
            isSystem: true,
            usageCount: 0
          })
        }
      }
    }
    console.log('System presets initialized')
  } catch (error) {
    console.error('Failed to initialize system presets:', error)
  }
}

// Get presets for user (system + user presets)
const getPresets = catchAsync(async (req, res, next) => {
  const { category } = req.query
  const userId = req.user._id

  let result

  if (category) {
    // Get presets for specific category
    result = await TodoPreset.getPresetsForCategory(userId, category)
  } else {
    // Get all presets grouped by category
    const categories = ['custom', 'setup', 'products', 'marketing', 'logistics', 'post-event']
    result = {}
    for (const cat of categories) {
      result[cat] = await TodoPreset.getPresetsForCategory(userId, cat)
    }
  }

  sendSuccess(res, {
    presets: result
  }, 'Presets retrieved successfully')
})

// Get presets for a specific category (simplified for modal)
const getPresetsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params

  const systemPresets = await TodoPreset.getSystemPresets(category)
  const userPresets = await TodoPreset.getUserPresets(req.user._id, { category })

  sendSuccess(res, {
    category,
    system: systemPresets,
    user: userPresets
  }, 'Presets retrieved successfully')
})

// Create new user preset
const createPreset = catchAsync(async (req, res, next) => {
  const { title, description, category, priority } = req.body

  if (!title || !category) {
    return next(new AppError('Title and category are required', 400))
  }

  const preset = await TodoPreset.create({
    user: req.user._id,
    title,
    description,
    category,
    priority: priority || 'medium',
    isSystem: false
  })

  sendSuccess(res, {
    preset
  }, 'Preset created successfully', 201)
})

// Update preset
const updatePreset = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const preset = await TodoPreset.findById(id)

  if (!preset) {
    return next(new AppError('Preset not found', 404))
  }

  // Check ownership (system presets can't be edited)
  if (preset.isSystem) {
    return next(new AppError('Cannot edit system presets', 403))
  }

  if (preset.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  const updatedPreset = await TodoPreset.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  )

  sendSuccess(res, {
    preset: updatedPreset
  }, 'Preset updated successfully')
})

// Delete preset (soft delete)
const deletePreset = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const preset = await TodoPreset.findById(id)

  if (!preset) {
    return next(new AppError('Preset not found', 404))
  }

  // Can't delete system presets
  if (preset.isSystem) {
    return next(new AppError('Cannot delete system presets', 403))
  }

  if (preset.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await preset.softDelete()

  sendSuccess(res, null, 'Preset deleted successfully')
})

// Create todo from preset
const createTodoFromPreset = catchAsync(async (req, res, next) => {
  const { presetId, marketId, customizations } = req.body

  const preset = await TodoPreset.findById(presetId)

  if (!preset) {
    return next(new AppError('Preset not found', 404))
  }

  // Increment usage count
  await preset.incrementUsage()

  const todoData = {
    title: customizations?.title || preset.title,
    description: customizations?.description || preset.description,
    category: customizations?.category || preset.category,
    priority: customizations?.priority || preset.priority,
    dueDate: customizations?.dueDate,
    completed: false
  }

  // Create todo through the existing create flow
  const Todo = require('../models/Todo')
  const Market = require('../models/Market')
  const UserMarketTracking = require('../models/UserMarketTracking')

  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const { checkMarketAccess } = require('../controllers/todosController')
  const hasAccess = req.user.role === 'admin' || await checkMarketAccess(req.user._id, marketId, market)

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const todo = await Todo.create({
    ...todoData,
    vendor: req.user._id,
    market: marketId
  })

  const populatedTodo = await Todo.findById(todo._id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: populatedTodo
  }, 'Todo created from preset successfully', 201)
})

module.exports = {
  initializeSystemPresets,
  getPresets,
  getPresetsByCategory,
  createPreset,
  updatePreset,
  deletePreset,
  createTodoFromPreset
}
