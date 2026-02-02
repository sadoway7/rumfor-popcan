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

// Helper to get image by category
export const getCategoryImage = (category: string): string => {
  const imageMap: Record<string, string> = {
    'farmers-market': new URL('./farmermarket.png', import.meta.url).href,
    'arts-crafts': new URL('./artandcraft.png', import.meta.url).href,
    'flea-market': new URL('./fleamarket.png', import.meta.url).href,
    'food-festival': new URL('./foodfestival.png', import.meta.url).href,
    'craft-fair': new URL('./craftshow.png', import.meta.url).href,
    'community-event': new URL('./communityevent.png', import.meta.url).href,
    'holiday-market': new URL('./holidaymarket.png', import.meta.url).href,
    'night-market': new URL('./nightmarket.png', import.meta.url).href,
    'street-fair': new URL('./streetfair.png', import.meta.url).href,
    'vintage-antique': new URL('./vintageandantique.jpeg', import.meta.url).href,
  };
  return imageMap[category] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
};
