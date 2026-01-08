const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const Todo = require('../models/Todo')
const Market = require('../models/Market')
const { validateTodoCreation, validateMongoId, validatePagination } = require('../middleware/validation')

// Get todos for vendor and market
const getTodos = catchAsync(async (req, res, next) => {
  const { marketId } = req.query
  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    sortBy = 'dueDate',
    sortOrder = 'asc'
  } = req.query

  // Verify market exists
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Verify user has access to this market (either owns it or is tracking it)
  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Todo.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const options = {
    status,
    category,
    priority,
    sortBy,
    sortOrder
  }

  const todos = await Todo.getVendorMarketTodos(req.user.id, marketId, options)

  const total = await Todo.countDocuments({
    vendor: req.user.id,
    market: marketId,
    isDeleted: false,
    ...(status && { status }),
    ...(category && { category }),
    ...(priority && { priority })
  })

  sendSuccess(res, {
    todos,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  }, 'Todos retrieved successfully')
})

// Get single todo
const getTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const todo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  sendSuccess(res, {
    todo
  }, 'Todo retrieved successfully')
})

// Create new todo
const createTodo = catchAsync(async (req, res, next) => {
  const { marketId, ...todoData } = req.body

  // Verify market exists
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Verify user has access to this market
  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Todo.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const todo = await Todo.create({
    ...todoData,
    vendor: req.user.id,
    market: marketId
  })

  const populatedTodo = await Todo.findById(todo._id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: populatedTodo
  }, 'Todo created successfully', 201)
})

// Update todo
const updateTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const todo = await Todo.findById(id)

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  // Cannot update deleted todos
  if (todo.isDeleted) {
    return next(new AppError('Cannot update deleted todo', 400))
  }

  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  )
  .populate('vendor', 'username profile.firstName profile.lastName')
  .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: updatedTodo
  }, 'Todo updated successfully')
})

// Delete todo (soft delete)
const deleteTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const todo = await Todo.findById(id)

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.softDelete()

  sendSuccess(res, null, 'Todo deleted successfully')
})

// Mark todo as completed
const completeTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const todo = await Todo.findById(id)

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.complete(req.user.id)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: updatedTodo
  }, 'Todo marked as completed')
})

// Mark todo as in progress
const startTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const todo = await Todo.findById(id)

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.start()

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: updatedTodo
  }, 'Todo marked as in progress')
})

// Add note to todo
const addTodoNote = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { content } = req.body

  if (!content || content.trim().length === 0) {
    return next(new AppError('Note content is required', 400))
  }

  const todo = await Todo.findById(id)

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.addNote(content, req.user.id)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: updatedTodo
  }, 'Note added successfully')
})

// Update todo hours
const updateTodoHours = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { actualHours } = req.body

  if (actualHours === undefined || actualHours < 0) {
    return next(new AppError('Valid actual hours is required', 400))
  }

  const todo = await Todo.findById(id)

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.updateHours(actualHours)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: updatedTodo
  }, 'Todo hours updated successfully')
})

// Update todo cost
const updateTodoCost = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { cost } = req.body

  if (cost === undefined || cost < 0) {
    return next(new AppError('Valid cost is required', 400))
  }

  const todo = await Todo.findById(id)

  if (!todo) {
    return next(new AppError('Todo not found', 404))
  }

  // Check access
  if (todo.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.updateCost(cost)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: updatedTodo
  }, 'Todo cost updated successfully')
})

// Get todo statistics
const getTodoStats = catchAsync(async (req, res, next) => {
  const { marketId } = req.params

  // Verify market exists and user has access
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Todo.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const stats = await Todo.getVendorMarketStats(req.user.id, marketId)

  sendSuccess(res, {
    marketId,
    statistics: stats
  }, 'Todo statistics retrieved successfully')
})

// Get overdue todos
const getOverdueTodos = catchAsync(async (req, res, next) => {
  const overdueTodos = await Todo.getOverdueTodos(req.user.id)

  sendSuccess(res, {
    todos: overdueTodos
  }, 'Overdue todos retrieved successfully')
})

// Get todo templates
const getTodoTemplates = catchAsync(async (req, res, next) => {
  const { category } = req.query

  const templates = await Todo.getTemplates(category)

  sendSuccess(res, {
    templates
  }, 'Todo templates retrieved successfully')
})

// Create todo from template
const createFromTemplate = catchAsync(async (req, res, next) => {
  const { templateId, marketId, ...customizations } = req.body

  // Verify market exists and user has access
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Todo.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const todo = await Todo.createFromTemplate(templateId, req.user.id, marketId, customizations)

  const populatedTodo = await Todo.findById(todo._id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    todo: populatedTodo
  }, 'Todo created from template successfully', 201)
})

module.exports = {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  startTodo,
  addTodoNote,
  updateTodoHours,
  updateTodoCost,
  getTodoStats,
  getOverdueTodos,
  getTodoTemplates,
  createFromTemplate
}