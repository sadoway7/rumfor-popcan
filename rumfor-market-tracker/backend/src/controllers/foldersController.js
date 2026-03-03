const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const PlanningFolder = require('../models/PlanningFolder')
const Todo = require('../models/Todo')
const Expense = require('../models/Expense')
const Market = require('../models/Market')

const getFolders = catchAsync(async (req, res, next) => {
  const { marketId } = req.query

  if (!marketId) {
    return next(new AppError('Market ID is required', 400))
  }

  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const folders = await PlanningFolder.getVendorMarketFolders(req.user._id, marketId)

  const foldersWithCounts = await Promise.all(folders.map(async (folder) => {
    const todoCount = await Todo.countDocuments({
      vendor: req.user._id,
      market: marketId,
      folderId: folder._id,
      isDeleted: false
    })
    const expenseCount = await Expense.countDocuments({
      vendor: req.user._id,
      market: marketId,
      folderId: folder._id,
      isDeleted: false
    })
    return {
      ...folder.toObject(),
      id: folder._id.toString(),
      itemCount: todoCount + expenseCount
    }
  }))

  sendSuccess(res, { folders: foldersWithCounts }, 'Folders retrieved successfully')
})

const getFolder = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const folder = await PlanningFolder.findById(id)

  if (!folder) {
    return next(new AppError('Folder not found', 404))
  }

  if (folder.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  sendSuccess(res, { folder: { ...folder.toObject(), id: folder._id.toString() } }, 'Folder retrieved successfully')
})

const createFolder = catchAsync(async (req, res, next) => {
  const { marketId, name, color, icon } = req.body

  if (!marketId || !name) {
    return next(new AppError('Market ID and name are required', 400))
  }

  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const maxSortOrder = await PlanningFolder.findOne({
    vendor: req.user._id,
    market: marketId,
    isDeleted: false
  }).sort({ sortOrder: -1 }).select('sortOrder')

  const folder = await PlanningFolder.create({
    vendor: req.user._id,
    market: marketId,
    name,
    color: color || 'blue',
    icon: icon || 'folder',
    sortOrder: (maxSortOrder?.sortOrder || 0) + 1
  })

  sendSuccess(res, { folder: { ...folder.toObject(), id: folder._id.toString() } }, 'Folder created successfully', 201)
})

const updateFolder = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { name, color, icon, isCollapsed, sortOrder } = req.body

  const folder = await PlanningFolder.findById(id)

  if (!folder) {
    return next(new AppError('Folder not found', 404))
  }

  if (folder.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  if (name !== undefined) folder.name = name
  if (color !== undefined) folder.color = color
  if (icon !== undefined) folder.icon = icon
  if (isCollapsed !== undefined) folder.isCollapsed = isCollapsed
  if (sortOrder !== undefined) folder.sortOrder = sortOrder

  await folder.save()

  sendSuccess(res, { folder: { ...folder.toObject(), id: folder._id.toString() } }, 'Folder updated successfully')
})

const deleteFolder = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { moveItemsTo } = req.query

  const folder = await PlanningFolder.findById(id)

  if (!folder) {
    return next(new AppError('Folder not found', 404))
  }

  if (folder.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  if (moveItemsTo === 'root' || moveItemsTo === null) {
    await Todo.updateMany(
      { vendor: req.user._id, folderId: id },
      { $set: { folderId: null } }
    )
    await Expense.updateMany(
      { vendor: req.user._id, folderId: id },
      { $set: { folderId: null } }
    )
  } else if (moveItemsTo) {
    const targetFolder = await PlanningFolder.findById(moveItemsTo)
    if (!targetFolder) {
      return next(new AppError('Target folder not found', 404))
    }
    await Todo.updateMany(
      { vendor: req.user._id, folderId: id },
      { $set: { folderId: moveItemsTo } }
    )
    await Expense.updateMany(
      { vendor: req.user._id, folderId: id },
      { $set: { folderId: moveItemsTo } }
    )
  }

  await folder.softDelete()

  sendSuccess(res, { deleted: true }, 'Folder deleted successfully')
})

const reorderFolders = catchAsync(async (req, res, next) => {
  const { marketId, folderIds } = req.body

  if (!marketId || !Array.isArray(folderIds)) {
    return next(new AppError('Market ID and folder IDs array are required', 400))
  }

  const updates = folderIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, vendor: req.user._id },
      update: { sortOrder: index }
    }
  }))

  await PlanningFolder.bulkWrite(updates)

  sendSuccess(res, { reordered: true }, 'Folders reordered successfully')
})

const moveItemToFolder = catchAsync(async (req, res, next) => {
  const { itemId, itemType, folderId } = req.body

  if (!itemId || !itemType) {
    return next(new AppError('Item ID and type are required', 400))
  }

  const Model = itemType === 'todo' ? Todo : Expense
  const item = await Model.findById(itemId)

  if (!item) {
    return next(new AppError('Item not found', 404))
  }

  if (item.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  if (folderId) {
    const folder = await PlanningFolder.findById(folderId)
    if (!folder) {
      return next(new AppError('Folder not found', 404))
    }
    if (folder.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Access denied to folder', 403))
    }
  }

  item.folderId = folderId || null
  await item.save()

  sendSuccess(res, { moved: true }, 'Item moved successfully')
})

module.exports = {
  getFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  reorderFolders,
  moveItemToFolder
}
