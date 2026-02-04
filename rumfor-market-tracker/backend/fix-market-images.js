require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rumfor-market-tracker';

const imageMap = {
  'farmermarket.png': '/assets/images/farmermarket.png',
  'artandcraft.png': '/assets/images/artandcraft.png',
  'fleamarket.png': '/assets/images/fleamarket.png',
  'foodfestival.png': '/assets/images/foodfestival.png',
  'craftshow.png': '/assets/images/craftshow.png',
  'communityevent.png': '/assets/images/communityevent.png',
  'holidaymarket.png': '/assets/images/holidaymarket.png',
  'nightmarket.png': '/assets/images/nightmarket.png',
  'streetfair.png': '/assets/images/streetfair.png',
  'vintageandantique.jpeg': '/assets/images/vintageandantique.jpeg',
};

async function fixMarketImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Market = require('./src/models/Market');

    // Find all markets
    const markets = await Market.find({});
    let fixedCount = 0;

    for (const market of markets) {
      let needsUpdate = false;
      const newImages = market.images?.map(img => {
        if (!img || typeof img !== 'object') return img;

        const url = img.url;
        if (url && url.includes('localhost')) {
          // Extract filename from URL
          const match = url.match(/\/([^\/]+\.(?:png|jpeg|jpg|svg))$/);
          if (match) {
            const filename = match[1];
            if (imageMap[filename]) {
              needsUpdate = true;
              console.log(`  ${market.name}: ${url} -> ${imageMap[filename]}`);
              return { ...img, url: imageMap[filename] };
            }
          }
        }
        return img;
      });

      if (needsUpdate) {
        market.images = newImages;
        await market.save();
        fixedCount++;
      }
    }

    console.log(`\nFixed ${fixedCount} markets`);
    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixMarketImages();
