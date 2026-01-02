const express = require('express')
const router = express.Router()

const {
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
} = require('../controllers/todosController')

const { verifyToken } = require('../middleware/auth')
const { validateTodoCreation, validateMongoId, validatePagination } = require('../middleware/validation')

// Protected routes
router.use(verifyToken)

router.get('/', validatePagination, getTodos)
router.get('/overdue', getOverdueTodos)
router.get('/templates', getTodoTemplates)
router.post('/', validateTodoCreation, createTodo)
router.post('/from-template', createFromTemplate)
router.get('/:id', validateMongoId('id'), getTodo)
router.patch('/:id', validateMongoId('id'), updateTodo)
router.delete('/:id', validateMongoId('id'), deleteTodo)
router.patch('/:id/complete', validateMongoId('id'), completeTodo)
router.patch('/:id/start', validateMongoId('id'), startTodo)
router.patch('/:id/note', validateMongoId('id'), addTodoNote)
router.patch('/:id/hours', validateMongoId('id'), updateTodoHours)
router.patch('/:id/cost', validateMongoId('id'), updateTodoCost)
router.get('/market/:marketId/stats', validateMongoId('marketId'), getTodoStats)

module.exports = router