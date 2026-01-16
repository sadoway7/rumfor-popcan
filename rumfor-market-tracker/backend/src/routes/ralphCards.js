const express = require('express')
const fs = require('fs/promises')
const path = require('path')

const router = express.Router()

const CARDS_DIR = path.resolve(__dirname, '../../../cards')
const INDEX_PATH = path.join(CARDS_DIR, 'index.json')

const slugify = (value) => value.replace(/[^a-z0-9-_]/gi, '_').toLowerCase()

const safeFileName = (name, ext) => {
  const base = slugify(name || 'card')
  const suffix = ext.startsWith('.') ? ext : `.${ext}`
  return `${base}${suffix}`
}

const ensureCardsDir = async () => {
  await fs.mkdir(CARDS_DIR, { recursive: true })
}

const readIndex = async () => {
  try {
    const raw = await fs.readFile(INDEX_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.cards)) {
      return parsed
    }
  } catch (error) {
    // ignore
  }
  return { cards: [] }
}

const writeIndex = async (data) => {
  await fs.writeFile(INDEX_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

const buildDot = (card) => {
  const cardId = card.id || 'Card.New'
  const label = card.label || cardId
  const type = card.type || 'card'
  const prompt = (card.prompt || '').replace(/"/g, '\\"')
  return (
    'digraph WorldModel {\n' +
    `  "ROOT" [label="Rumfor Market Tracker", type="root"];\n` +
    `  "ROOT" -> "${cardId}";\n` +
    `  "${cardId}" [label="${label}", type="${type}", prompt="${prompt}"];\n` +
    '}'
  )
}

router.get('/index', async (req, res) => {
  try {
    const data = await readIndex()
    res.json(data)
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to read index' })
  }
})

router.get('/notes/:filename', async (req, res) => {
  try {
    const filename = req.params.filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' })
    }
    const notesPath = path.join(CARDS_DIR, filename)
    const content = await fs.readFile(notesPath, 'utf-8')
    res.type('text/plain').send(content)
  } catch (error) {
    res.status(404).json({ success: false, message: 'Notes file not found' })
  }
})

router.post('/save', async (req, res) => {
  try {
    await ensureCardsDir()
    const { card, notesContent } = req.body || {}
    if (!card || !card.id) {
      return res.status(400).json({ success: false, message: 'Card id is required' })
    }

    const dotFile = card.file || safeFileName(card.id, '.dot')
    const notesFile = card.notes || safeFileName(card.id, '.md')
    const dotPath = path.join(CARDS_DIR, dotFile)
    const notesPath = path.join(CARDS_DIR, notesFile)

    const dotContent = buildDot(card)
    await fs.writeFile(dotPath, dotContent, 'utf-8')

    if (typeof notesContent === 'string') {
      const payload = notesContent.trim() || '# Notes\n'
      await fs.writeFile(notesPath, payload, 'utf-8')
    }

    const index = await readIndex()
    const updatedCard = {
      id: card.id,
      label: card.label || card.id,
      type: card.type || 'card',
      prompt: card.prompt || '',
      file: dotFile,
      notes: notesFile
    }

    const existingIndex = index.cards.findIndex((entry) => entry.id === card.id)
    if (existingIndex >= 0) {
      index.cards[existingIndex] = updatedCard
    } else {
      index.cards.unshift(updatedCard)
    }

    await writeIndex(index)

    res.json({ success: true, card: updatedCard })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save card' })
  }
})

module.exports = router
