// Image assets for the market tracker application

// Placeholder images
export { default as noImagePlaceholder } from './no-image-placeholder.svg';

// Image upload constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed market tags
export const ALLOWED_MARKET_TAGS = [
  'local-produce',
  'fresh-produce',
  'organic',
  'handmade',
  'artisan',
  'vintage',
  'antique',
  'crafts',
  'food',
  'live-music',
  'family-friendly',
  'pet-friendly',
  'outdoor',
  'indoor',
  'free-entry',
  'parking',
  'wheelchair-accessible',
  'wifi',
  'atm',
  'food-court'
];

// Category placeholder images
export { default as farmersMarketImage } from './farmermarket.png';
export { default as artsCraftsImage } from './artandcraft.png';
export { default as fleaMarketImage } from './fleamarket.png';
export { default as foodFestivalImage } from './foodfestival.png';
export { default as craftShowImage } from './craftshow.png';
export { default as communityEventImage } from './communityevent.png';
export { default as holidayMarketImage } from './holidaymarket.png';
export { default as nightMarketImage } from './nightmarket.png';
export { default as streetFairImage } from './streetfair.png';
export { default as vintageAntiqueImage } from './vintageandantique.jpeg';

// Helper to get image by category - returns relative URL for database storage
export const getCategoryImage = (category: string): string => {
  const imageMap: Record<string, string> = {
    'farmers-market': '/assets/images/farmermarket.png',
    'arts-crafts': '/assets/images/artandcraft.png',
    'flea-market': '/assets/images/fleamarket.png',
    'food-festival': '/assets/images/foodfestival.png',
    'craft-fair': '/assets/images/craftshow.png',
    'community-event': '/assets/images/communityevent.png',
    'holiday-market': '/assets/images/holidaymarket.png',
    'night-market': '/assets/images/nightmarket.png',
    'street-fair': '/assets/images/streetfair.png',
    'vintage-antique': '/assets/images/vintageandantique.jpeg',
  };
  return imageMap[category] || '/assets/images/no-image-placeholder.svg';
};
