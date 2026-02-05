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
export { default as farmersMarketImage } from './farmermarket.webp';
export { default as artsCraftsImage } from './artandcraft.webp';
export { default as fleaMarketImage } from './fleamarket.webp';
export { default as foodFestivalImage } from './foodfestival.webp';
export { default as craftShowImage } from './craftshow.webp';
export { default as communityEventImage } from './communityevent.webp';
export { default as holidayMarketImage } from './holidaymarket.webp';
export { default as nightMarketImage } from './nightmarket.webp';
export { default as streetFairImage } from './streetfair.webp';
export { default as vintageAntiqueImage } from './vintageandantique.webp';

// Helper to get image by category - returns relative URL for database storage
export const getCategoryImage = (category: string): string => {
  const imageMap: Record<string, string> = {
    'farmers-market': '/assets/images/farmermarket.webp',
    'arts-crafts': '/assets/images/artandcraft.webp',
    'flea-market': '/assets/images/fleamarket.webp',
    'food-festival': '/assets/images/foodfestival.webp',
    'craft-fair': '/assets/images/craftshow.webp',
    'community-event': '/assets/images/communityevent.webp',
    'holiday-market': '/assets/images/holidaymarket.webp',
    'night-market': '/assets/images/nightmarket.webp',
    'street-fair': '/assets/images/streetfair.webp',
    'vintage-antique': '/assets/images/vintageandantique.webp',
  };
  return imageMap[category] || '/assets/images/no-image-placeholder.svg';
};
