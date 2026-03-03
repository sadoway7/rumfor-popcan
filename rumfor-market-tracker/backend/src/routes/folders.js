const express = require('express')
const router = express.Router()

const {
  getFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  reorderFolders,
  moveItemToFolder
} = require('../controllers/foldersController')

const { verifyToken } = require('../middleware/auth')
const { validateMongoId } = require('../middleware/validation')

router.use(verifyToken)

router.get('/', getFolders)
router.post('/', createFolder)
router.post('/reorder', reorderFolders)
router.post('/move-item', moveItemToFolder)
router.get('/:id', validateMongoId('id'), getFolder)
router.patch('/:id', validateMongoId('id'), updateFolder)
router.delete('/:id', validateMongoId('id'), deleteFolder)

module.exports = router
