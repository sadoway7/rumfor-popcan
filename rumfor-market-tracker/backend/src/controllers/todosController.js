const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const Todo = require('../models/Todo')
const Market = require('../models/Market')
const UserMarketTracking = require('../models/UserMarketTracking')
const { validateTodoCreation, validateMongoId, validatePagination } = require('../middleware/validation')

// Helper function to check access to a market
const checkMarketAccess = async (userId, marketId, market) => {
  if (market.promoter.toString() === userId.toString()) return true
  if (await UserMarketTracking.findOne({ user: userId, market: marketId })) return true
  return false
}

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

  // If marketId is provided, verify it exists
  let market = null
  if (marketId) {
    market = await Market.findById(marketId)
    
    if (!market) {
      return next(new AppError('Market not found', 404))
    }
    
    // Verify user has access to this market
    const hasAccess = req.user.role === 'admin' || req.method === 'GET' || await checkMarketAccess(req.user._id.toString(), marketId, market)
    
    if (!hasAccess) {
      return next(new AppError('Access denied to this market', 403))
    }
  }

  const options = {
    status,
    category,
    priority,
    sortBy,
    sortOrder
  }

  const todos = await Todo.getVendorMarketTodos(req.user._id.toString(), marketId, options)

  const totalQuery = {
    vendor: req.user._id.toString(),
    isDeleted: false,
    ...(marketId && { market: marketId }),
    ...(status && { status }),
    ...(category && { category }),
    ...(priority && { priority })
  }

  const total = await Todo.countDocuments(totalQuery)

  // Add marketId and id string to each todo for frontend compatibility
  const todosWithMarketId = todos.map(todo => ({
    ...todo.toObject(),
    id: todo._id.toString(),
    completed: todo.status === 'completed',
    marketId: todo.market?._id?.toString() || todo.market?.toString()
  }))

  sendSuccess(res, {
    todos: todosWithMarketId,
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
  if (todo.vendor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...todo.toObject(),
    id: todo._id.toString(),
    completed: todo.status === 'completed',
    marketId: todo.market?._id?.toString() || todo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
  }, 'Todo retrieved successfully')
})

// Create new todo
const createTodo = catchAsync(async (req, res, next) => {
  const { market, ...todoData } = req.body

  // Verify market exists
  const foundMarket = await Market.findById(market)

  if (!foundMarket) {
    return next(new AppError('Market not found', 404))
  }

  // Any authenticated user can create todos for a market they're viewing
  const todo = await Todo.create({
    ...todoData,
    vendor: req.user._id,
    market: market
  })

  const populatedTodo = await Todo.findById(todo._id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...populatedTodo.toObject(),
    id: populatedTodo._id.toString(),
    completed: populatedTodo.status === 'completed',
    marketId: populatedTodo.market?._id?.toString() || populatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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
  console.log('[DEBUG] Update access check:', {
    todoVendor: todo.vendor.toString(),
    reqUserId: req.user._id.toString(),
    isMatch: todo.vendor.toString() === req.user._id.toString()
  })
  if (todo.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  // Handle completed boolean from frontend - map to status
  let updates = { ...req.body }
  if (updates.completed !== undefined) {
    updates.status = updates.completed ? 'completed' : 'pending'
    delete updates.completed
  }

  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  )
  .populate('vendor', 'username profile.firstName profile.lastName')
  .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...updatedTodo.toObject(),
    id: updatedTodo._id.toString(),
    completed: updatedTodo.status === 'completed',
    marketId: updatedTodo.market?._id?.toString() || updatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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
  if (todo.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    console.log('[DEBUG] Delete access denied:', {
      todoVendor: todo.vendor.toString(),
      reqUserId: req.user._id.toString(),
      todoVendorType: typeof todo.vendor,
      reqUserIdType: typeof req.user._id
    })
    return next(new AppError('Access denied', 403))
  }

  console.log('[DEBUG] Delete access granted, proceeding with hard delete')
  // Hard delete the todo
  const result = await Todo.deleteOne({ _id: id })
  console.log('[DEBUG] Delete result:', result)

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
  if (todo.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.complete(req.user._id)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...updatedTodo.toObject(),
    id: updatedTodo._id.toString(),
    completed: updatedTodo.status === 'completed',
    marketId: updatedTodo.market?._id?.toString() || updatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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
  if (todo.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.start()

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...updatedTodo.toObject(),
    id: updatedTodo._id.toString(),
    completed: updatedTodo.status === 'completed',
    marketId: updatedTodo.market?._id?.toString() || updatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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
  if (todo.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.addNote(content, req.user._id)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...updatedTodo.toObject(),
    id: updatedTodo._id.toString(),
    completed: updatedTodo.status === 'completed',
    marketId: updatedTodo.market?._id?.toString() || updatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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
  if (todo.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.updateHours(actualHours)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...updatedTodo.toObject(),
    id: updatedTodo._id.toString(),
    completed: updatedTodo.status === 'completed',
    marketId: updatedTodo.market?._id?.toString() || updatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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
  if (todo.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await todo.updateCost(cost)

  const updatedTodo = await Todo.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...updatedTodo.toObject(),
    id: updatedTodo._id.toString(),
    completed: updatedTodo.status === 'completed',
    marketId: updatedTodo.market?._id?.toString() || updatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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

  const hasAccess = req.user.role === 'admin' || await checkMarketAccess(req.user._id.toString(), marketId, market)

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const stats = await Todo.getVendorMarketStats(req.user._id.toString(), marketId)

  sendSuccess(res, {
    marketId,
    statistics: stats
  }, 'Todo statistics retrieved successfully')
})

// Get overdue todos
const getOverdueTodos = catchAsync(async (req, res, next) => {
  const overdueTodos = await Todo.getOverdueTodos(req.user._id.toString())

  // Add id, completed, and marketId for frontend compatibility
  const todosWithMarketId = overdueTodos.map(todo => ({
    ...todo.toObject(),
    id: todo._id.toString(),
    completed: todo.status === 'completed',
    marketId: todo.market?._id?.toString() || todo.market?.toString()
  }))

  sendSuccess(res, {
    todos: todosWithMarketId
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

  const hasAccess = req.user.role === 'admin' || await checkMarketAccess(req.user._id.toString(), marketId, market)

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const todo = await Todo.createFromTemplate(templateId, req.user._id, marketId, customizations)

  const populatedTodo = await Todo.findById(todo._id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Add id, completed, and marketId for frontend compatibility
  const todoWithMarketId = {
    ...populatedTodo.toObject(),
    id: populatedTodo._id.toString(),
    completed: populatedTodo.status === 'completed',
    marketId: populatedTodo.market?._id?.toString() || populatedTodo.market?.toString()
  }

  sendSuccess(res, {
    todo: todoWithMarketId
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
