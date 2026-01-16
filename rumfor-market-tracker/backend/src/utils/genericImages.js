// Generic market images for vendor-created markets (cycle through these)
const GENERIC_MARKET_IMAGES = [
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop', // Farmers market stalls
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop', // Market square
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop', // Craft fair
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop', // Local crafts
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop', // Weekend market
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=400&fit=crop', // Community market
];

// Function to get a generic image based on market ID for consistency
const getGenericMarketImage = (marketId) => {
  const index = marketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GENERIC_MARKET_IMAGES.length;
  return GENERIC_MARKET_IMAGES[index];
};

module.exports = getGenericMarketImage;