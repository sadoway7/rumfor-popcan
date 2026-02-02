/**
 * Update existing markets in database to use new placeholder images
 * Run this with: cd backend && node update-market-images.cjs
 */

require('dotenv').config()
const mongoose = require('mongoose')
const Market = require('./src/models/Market')

// Mapping of categories to new placeholder images
const CATEGORY_IMAGES = {
  'farmers-market': '/assets/images/farmermarket.png',
  'arts-crafts': '/assets/images/artandcraft.png',
  'flea-market': '/assets/images/fleamarket.png',
  'food-festival': '/assets/images/foodfestival.png',
  'craft-show': '/assets/images/craftshow.png',
  'community-event': '/assets/images/communityevent.png',
  'holiday-market': '/assets/images/holidaymarket.png',
  'night-market': '/assets/images/nightmarket.png',
  'street-fair': '/assets/images/streetfair.png',
  'vintage-antique': '/assets/images/vintageandantique.jpeg',
}

async function updateMarketImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find all markets with Unsplash URLs
    const markets = await Market.find({
      $or: [
        { 'images.url': { $regex: /images\.unsplash\.com/ } },
        { 'images.0.url': { $regex: /images\.unsplash\.com/ } }
      ]
    })

    console.log(`Found ${markets.length} markets with Unsplash images`)

    // Update each market
    for (const market of markets) {
      const category = market.category

      // Get new image path
      const newImagePath = CATEGORY_IMAGES[category] || '/assets/images/no-image-placeholder.svg'

      // Update the market
      market.images = [{
        url: newImagePath,
        isHero: true,
        uploadedBy: market.promoter
      }]

      await market.save()
      console.log(`✅ Updated: ${market.name} -> ${newImagePath}`)
    }

    console.log('✅ All markets updated successfully!')
  } catch (error) {
    console.error('❌ Error updating markets:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

updateMarketImages()
