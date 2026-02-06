const express = require('express')
const router = express.Router()

const { verifyToken } = require('../middleware/auth')
const hashtagController = require('../controllers/hashtagController')

// Shared predefined tags list - used by both GET /predefined and POST /add endpoints
const predefinedTags = [
  // Market Types & Categories
  'farmers-market', 'flea-market', 'craft-fair', 'art-market', 'vintage-market',
  'antique-market', 'night-market', 'street-market', 'community-market', 'holiday-market',
  'seasonal-market', 'weekend-market', 'food-market', 'produce-market', 'bake-sale',

  // Product Categories
  'fresh-produce', 'organic-food', 'local-food', 'homemade-goods', 'handmade-crafts',
  'jewelry', 'pottery', 'textiles', 'woodworking', 'metalwork', 'glass-art',
  'photography', 'paintings', 'sculptures', 'prints', 'books', 'music',
  'clothing', 'accessories', 'home-decor', 'furniture', 'plants', 'flowers',
  'baked-goods', 'jams-preserves', 'honey', 'cheese', 'wine', 'beer',
  'coffee', 'tea', 'spices', 'herbs', 'nuts', 'dried-fruits',

  // Styles & Aesthetics
  'vintage', 'retro', 'modern', 'rustic', 'industrial', 'bohemian', 'eclectic',
  'minimalist', 'maximalist', 'colorful', 'monochrome', 'pastel', 'bright',
  'natural', 'organic-style', 'handcrafted', 'artisanal', 'unique', 'one-of-a-kind',
  'custom-made', 'heirloom', 'traditional', 'contemporary', 'abstract',
  'figurative', 'geometric', 'floral', 'nature-inspired',

  // Target Audience & Themes
  'family-friendly', 'kids', 'children', 'teens', 'adults', 'seniors', 'pets',
  'dog-friendly', 'cat-friendly', 'eco-friendly', 'sustainable', 'green',
  'recycled', 'upcycled', 'zero-waste', 'vegan', 'vegetarian', 'gluten-free',
  'keto', 'paleo', 'halal', 'kosher', 'organic', 'non-gmo', 'fair-trade',

  // Seasonal & Holiday
  'christmas', 'halloween', 'thanksgiving', 'easter', 'valentines', 'mothers-day',
  'fathers-day', 'summer', 'winter', 'spring', 'fall', 'autumn', 'holiday-season',
  'back-to-school', 'new-years', 'st-patricks-day', 'fourth-of-july', 'labor-day',
  'memorial-day', 'independence-day', 'harvest-season', 'flower-season',

  // Special Features & Activities
  'live-music', 'food-trucks', 'pop-up', 'temporary', 'year-round', 'weekly',
  'monthly', 'annual', 'special-event', 'celebration', 'festival', 'fair',
  'exhibition', 'showcase', 'demonstrations', 'workshops', 'classes', 'tutorials',
  'meet-artists', 'meet-vendors', 'networking', 'social', 'community-building',

  // Price Levels & Quality
  'luxury', 'premium', 'high-end', 'affordable', 'budget-friendly', 'bargain',
  'discount', 'clearance', 'sale', 'wholesale', 'bulk', 'artisanal-quality',
  'handmade-quality', 'small-batch', 'limited-edition', 'collectible', 'rare',

  // Cultural & Ethnic Themes
  'italian', 'french', 'mexican', 'asian', 'mediterranean', 'middle-eastern',
  'indian', 'thai', 'japanese', 'chinese', 'greek', 'spanish', 'german',
  'irish', 'scottish', 'african', 'caribbean', 'latin-american', 'fusion',
  'international', 'global', 'local-culture', 'indigenous', 'heritage',

  // Location & Environment
  'outdoor', 'indoor', 'covered', 'open-air', 'heated', 'air-conditioned',
  'parking-available', 'public-transport', 'wheelchair-accessible', 'pet-friendly',
  'smoking-allowed', 'alcohol-served', 'food-available', 'restrooms-available',
  'changing-rooms', 'storage-locks', 'security', 'clean', 'well-maintained',

  // Market Atmosphere & Vibe
  'casual', 'relaxed', 'lively', 'energetic', 'peaceful', 'quiet', 'crowded',
  'intimate', 'cozy', 'welcoming', 'friendly', 'professional', 'trendy',
  'hipster', 'bohemian', 'artsy', 'creative', 'inspirational', 'fun', 'joyful',
  'celebratory', 'nostalgic', 'timeless', 'modern-vibe', 'traditional-vibe',

  // Additional Categories
  'antiques', 'collectibles', 'memorabilia', 'vintage-clothing', 'thrift',
  'consignment', 'second-hand', 'pre-owned', 'refurbished', 'restored',
  'custom-orders', 'commissions', 'made-to-order', 'personalized', 'monogrammed',
  'engraved', 'embroidery', 'quilting', 'knitting', 'crochet', 'sewing',
  'leatherwork', 'ceramics', 'mosaic', 'stained-glass', 'calligraphy',
  'stationery', 'greeting-cards', 'invitations', 'party-supplies', 'decorations',
  'balloons', 'costumes', 'masks', 'props', 'theater', 'performance', 'dance',
  'yoga', 'meditation', 'wellness', 'health', 'fitness', 'sports', 'outdoor-gear',
  'camping', 'hiking', 'biking', 'running', 'swimming', 'winter-sports',

  // LGBTQ+ and Diversity
  'lgbtq', 'lgbtq-friendly', 'gay-owned', 'lesbian-owned', 'transgender',
  'non-binary', 'trans-owned', 'queer-owned', 'pride', 'rainbow', 'inclusive',
  'diversity', 'ally', 'women-owned', 'black-owned', 'indigenous-owned',
  'poc-owned', 'minority-owned', 'immigrant-owned', 'refugee-owned',
  'disability-owned', 'accessible', 'universal-design', 'adaptive'
]

// Public routes
router.get('/market/:marketId', hashtagController.getMarketHashtags)
router.get('/trending', hashtagController.getTrendingHashtags)

// Protected routes
router.use(verifyToken)

// Add tag to market
router.post('/market/:marketId/add', async (req, res) => {
  try {
    const { marketId } = req.params
    const { tagName } = req.body
    const userId = req.user.id

    if (!tagName || typeof tagName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      })
    }

    // Validate tag is in predefined list (using shared constant)
    if (!predefinedTags.includes(tagName.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Tag not in predefined list'
      })
    }

    // Find the market
    const Market = require('../models/Market')
    const market = await Market.findById(marketId)
    if (!market) {
      return res.status(404).json({
        success: false,
        message: 'Market not found'
      })
    }

    // Add tag to market's tags array if not already there
    const normalizedTag = tagName.toLowerCase()
    if (!market.tags) {
      market.tags = []
    }
    
    if (!market.tags.includes(normalizedTag)) {
      market.tags.push(normalizedTag)
      await market.save()
    }

    // Return the updated market with hashtags
    res.json({
      success: true,
      data: {
        hashtags: market.tags
      },
      message: 'Tag added to market successfully'
    })
  } catch (error) {
    console.error('Error adding tag to market:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add tag to market',
      error: error.message
    })
  }
})

router.get('/predefined', (req, res) => {
  res.json({
    success: true,
    data: predefinedTags,
    message: 'Predefined tags retrieved successfully'
  })
})

module.exports = router
