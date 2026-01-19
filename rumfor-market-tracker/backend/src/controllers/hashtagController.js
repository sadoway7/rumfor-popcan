const { catchAsync, AppError, sendSuccess } = require('../middleware/errorHandler')
const Market = require('../models/Market')

// Get hashtags for a specific market
const getMarketHashtags = catchAsync(async (req, res, next) => {
  const { marketId } = req.params

  // Verify market exists
  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Get hashtags from market
  const hashtags = market.tags || []

  sendSuccess(res, { hashtags }, 'Market hashtags retrieved successfully')
})

// Get trending hashtags across all markets
const getTrendingHashtags = catchAsync(async (req, res, next) => {
  // Aggregate hashtags from all active markets
  const trendingHashtags = await Market.aggregate([
    { $match: { status: 'active', isPublic: true, tags: { $exists: true, $ne: [] } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
    { $project: { hashtag: '$_id', count: 1, _id: 0 } }
  ])

  sendSuccess(res, { trendingHashtags }, 'Trending hashtags retrieved successfully')
})

module.exports = {
  getMarketHashtags,
  getTrendingHashtags
}