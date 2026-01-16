const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const { verifyToken } = require('../middleware/auth')
const Market = require('../models/Market')

// Controller functions for hashtags
const hashtagController = {
  // Get hashtags for a market
  getMarketHashtags: async (req, res) => {
    try {
      const { marketId } = req.params
      const { sortBy = 'votes.up', order = 'desc' } = req.query

      // Validate marketId
      if (!mongoose.Types.ObjectId.isValid(marketId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market ID'
        })
      }

      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      let hashtags = market.hashtags || []

      // Sort hashtags
      const sortField = sortBy.replace('votes.', '') // 'up' or 'down'
      hashtags.sort((a, b) => {
        const aValue = a.votes?.[sortField] || 0
        const bValue = b.votes?.[sortField] || 0
        return order === 'desc' ? bValue - aValue : aValue - bValue
      })

      // Calculate vote scores
      const hashtagsWithScore = hashtags.map(h => ({
        ...h.toObject(),
        voteScore: (h.votes?.up || 0) - (h.votes?.down || 0)
      }))

      res.json({
        success: true,
        data: { hashtags: hashtagsWithScore },
        message: 'Hashtags retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting market hashtags:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve hashtags',
        error: error.message
      })
    }
  },

  // Create new hashtag
  createHashtag: async (req, res) => {
    try {
      const { marketId, text } = req.body
      const userId = req.user.id

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Hashtag text is required'
        })
      }

      // Clean and validate hashtag
      const cleanText = text.toLowerCase().replace(/^#/, '').trim()
      if (cleanText.length > 30 || cleanText.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Hashtag must be between 1 and 30 characters'
        })
      }

      if (!/^[a-z0-9-]+$/.test(cleanText)) {
        return res.status(400).json({
          success: false,
          message: 'Hashtag can only contain lowercase letters, numbers, and hyphens'
        })
      }

      // Rate limiting: Check user's hashtag creation rate (max 5 per day per market)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const marketDoc = await Market.findById(marketId)
      const userHashtagsToday = marketDoc.hashtags.filter(hashtag =>
        hashtag.suggestedBy && hashtag.suggestedBy.toString() === userId &&
        hashtag.createdAt && hashtag.createdAt >= today && hashtag.createdAt < tomorrow
      ).length

      if (userHashtagsToday >= 5) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded: Maximum 5 hashtags per day per market allowed'
        })
      }

      // Validate marketId
      if (!mongoose.Types.ObjectId.isValid(marketId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market ID'
        })
      }

      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      // Check if hashtag already exists in this market
      const existingHashtag = market.hashtags.find(
        h => h.text.toLowerCase() === cleanText
      )
      if (existingHashtag) {
        return res.status(400).json({
          success: false,
          message: 'Hashtag already exists in this market'
        })
      }

      // Add new hashtag
      market.hashtags.push({
        text: cleanText,
        votes: { up: 0, down: 0 },
        suggestedBy: userId,
        voters: [],
        createdAt: new Date()
      })

      await market.save()
      await market.populate('hashtags.suggestedBy', 'username profile.firstName profile.lastName')

      res.status(201).json({
        success: true,
        data: { hashtag: market.hashtags[market.hashtags.length - 1] },
        message: 'Hashtag created successfully'
      })
    } catch (error) {
      console.error('Error creating hashtag:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create hashtag',
        error: error.message
      })
    }
  },

  // Update hashtag
  updateHashtag: async (req, res) => {
    try {
      const { marketId, hashtagId } = req.params
      const { text } = req.body

      if (!mongoose.Types.ObjectId.isValid(marketId) || !mongoose.Types.ObjectId.isValid(hashtagId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market or hashtag ID'
        })
      }

      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      const hashtag = market.hashtags.id(hashtagId)
      if (!hashtag) {
        return res.status(404).json({
          success: false,
          message: 'Hashtag not found'
        })
      }

      // Update text if provided
      if (text) {
        const cleanText = text.toLowerCase().replace(/^#/, '').trim()
        if (cleanText.length > 30 || cleanText.length < 1) {
          return res.status(400).json({
            success: false,
            message: 'Hashtag must be between 1 and 30 characters'
          })
        }

        // Check for duplicate
        const existingHashtag = market.hashtags.find(
          h => h.text.toLowerCase() === cleanText && !h._id.equals(hashtagId)
        )
        if (existingHashtag) {
          return res.status(400).json({
            success: false,
            message: 'Hashtag already exists in this market'
          })
        }

        hashtag.text = cleanText
      }

      await market.save()
      await market.populate('hashtags.suggestedBy', 'username profile.firstName profile.lastName')

      res.json({
        success: true,
        data: { hashtag },
        message: 'Hashtag updated successfully'
      })
    } catch (error) {
      console.error('Error updating hashtag:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update hashtag',
        error: error.message
      })
    }
  },

  // Delete hashtag
  deleteHashtag: async (req, res) => {
    try {
      const { marketId, hashtagId } = req.params
      const userId = req.user.id

      if (!mongoose.Types.ObjectId.isValid(marketId) || !mongoose.Types.ObjectId.isValid(hashtagId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market or hashtag ID'
        })
      }

      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      const hashtag = market.hashtags.id(hashtagId)
      if (!hashtag) {
        return res.status(404).json({
          success: false,
          message: 'Hashtag not found'
        })
      }

      // Check ownership or admin
      if (hashtag.suggestedBy && hashtag.suggestedBy.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this hashtag'
        })
      }

      market.hashtags.pull(hashtagId)
      await market.save()

      res.json({
        success: true,
        data: null,
        message: 'Hashtag deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting hashtag:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete hashtag',
        error: error.message
      })
    }
  },

  // Vote on hashtag
  voteHashtag: async (req, res) => {
    try {
      const { marketId, hashtagId } = req.params
      const { voteType = 'up' } = req.body
      const userId = req.user.id

      if (!mongoose.Types.ObjectId.isValid(marketId) || !mongoose.Types.ObjectId.isValid(hashtagId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market or hashtag ID'
        })
      }

      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({
          success: false,
          message: 'Vote type must be "up" or "down"'
        })
      }

      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      const hashtag = market.hashtags.id(hashtagId)
      if (!hashtag) {
        return res.status(404).json({
          success: false,
          message: 'Hashtag not found'
        })
      }

      // Initialize voters array if not exists
      if (!hashtag.voters) hashtag.voters = []

      // Remove existing vote from this user
      hashtag.voters = hashtag.voters.filter(v => !v.userId || v.userId.toString() !== userId)

      // Add new vote
      hashtag.voters.push({
        userId,
        vote: voteType,
        timestamp: new Date()
      })

      // Recalculate votes
      hashtag.votes.up = hashtag.voters.filter(v => v.vote === 'up').length
      hashtag.votes.down = hashtag.voters.filter(v => v.vote === 'down').length

      await market.save()
      await market.populate('hashtags.suggestedBy', 'username profile.firstName profile.lastName')

      res.json({
        success: true,
        data: { 
          hashtag,
          voteScore: hashtag.votes.up - hashtag.votes.down
        },
        message: 'Vote recorded successfully'
      })
    } catch (error) {
      console.error('Error voting on hashtag:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: error.message
      })
    }
  },

  // Remove vote from hashtag
  removeHashtagVote: async (req, res) => {
    try {
      const { marketId, hashtagId } = req.params
      const userId = req.user.id

      if (!mongoose.Types.ObjectId.isValid(marketId) || !mongoose.Types.ObjectId.isValid(hashtagId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid market or hashtag ID'
        })
      }

      const market = await Market.findById(marketId)
      if (!market) {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        })
      }

      const hashtag = market.hashtags.id(hashtagId)
      if (!hashtag) {
        return res.status(404).json({
          success: false,
          message: 'Hashtag not found'
        })
      }

      // Remove user's vote
      if (hashtag.voters) {
        hashtag.voters = hashtag.voters.filter(v => !v.userId || v.userId.toString() !== userId)
      }

      // Recalculate votes
      hashtag.votes.up = hashtag.voters?.filter(v => v.vote === 'up').length || 0
      hashtag.votes.down = hashtag.voters?.filter(v => v.vote === 'down').length || 0

      await market.save()

      res.json({
        success: true,
        data: { 
          hashtag,
          voteScore: hashtag.votes.up - hashtag.votes.down
        },
        message: 'Vote removed successfully'
      })
    } catch (error) {
      console.error('Error removing hashtag vote:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to remove vote',
        error: error.message
      })
    }
  },

  // Get trending hashtags across all markets
  getTrendingHashtags: async (req, res) => {
    try {
      const { limit = 20 } = req.query

      // Aggregate hashtags from all markets
      const trending = await Market.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$hashtags' },
        {
          $group: {
            _id: '$hashtags.text',
            totalUpVotes: { $sum: '$hashtags.votes.up' },
            totalDownVotes: { $sum: '$hashtags.votes.down' },
            marketCount: { $sum: 1 }
          }
        },
        {
          $project: {
            text: '$_id',
            voteScore: { $subtract: ['$totalUpVotes', '$totalDownVotes'] },
            totalUpVotes: 1,
            totalDownVotes: 1,
            marketCount: 1
          }
        },
        { $sort: { voteScore: -1, marketCount: -1 } },
        { $limit: parseInt(limit) }
      ])

      res.json({
        success: true,
        data: { hashtags: trending },
        message: 'Trending hashtags retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting trending hashtags:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trending hashtags',
        error: error.message
      })
    }
  }
}

// Public routes
router.get('/market/:marketId', hashtagController.getMarketHashtags)
router.get('/trending', hashtagController.getTrendingHashtags)
router.get('/predefined', (req, res) => {
  const predefinedHashtags = [
    'organic', 'local', 'fresh', 'handmade', 'artisan', 'seasonal',
    'sustainable', 'eco-friendly', 'family-friendly', 'pet-friendly',
    'food-truck', 'live-music', 'outdoor', 'indoor', 'weekend',
    'farm-fresh', 'crafts', 'produce', 'baked-goods', 'homegrown',
    'artisan', 'vintage', 'antique', 'handcrafted', 'natural',
    'gluten-free', 'vegan', 'vegetarian', 'keto', 'organic-produce'
  ]

  res.json({
    success: true,
    data: predefinedHashtags,
    message: 'Predefined hashtags retrieved successfully'
  })
})

// Protected routes
router.use(verifyToken)

// Create new hashtag
router.post('/', hashtagController.createHashtag)

// Update hashtag
router.patch('/:hashtagId', hashtagController.updateHashtag)

// Delete hashtag
router.delete('/:hashtagId', hashtagController.deleteHashtag)

// Vote on hashtag
router.post('/:hashtagId/vote', hashtagController.voteHashtag)

// Remove vote from hashtag
router.delete('/:hashtagId/vote', hashtagController.removeHashtagVote)


module.exports = router
