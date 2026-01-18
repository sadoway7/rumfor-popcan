/**
 * Transform MongoDB Market document to frontend-compatible format
 * This ensures consistent data shape regardless of database schema changes
 */
function serializeMarket(marketDoc) {
  if (!marketDoc) return null
  
  // Convert Mongoose doc to plain object if needed
  const market = marketDoc.toObject ? marketDoc.toObject() : marketDoc
  
  return {
    // Transform _id to id
    id: market._id?.toString() || market.id,
    
    // Basic fields (pass through)
    name: market.name,
    description: market.description,
    shortDescription: market.shortDescription,
    category: market.category,
    subcategory: market.subcategory,
    status: market.status,
    isPublic: market.isPublic,
    
    // Promoter transformation
    promoterId: market.promoter?._id?.toString() || market.promoter?.toString(),
    promoter: market.promoter?._id ? {
      id: market.promoter._id.toString(),
      username: market.promoter.username,
      email: market.promoter.email,
      firstName: market.promoter.profile?.firstName || market.promoter.firstName,
      lastName: market.promoter.profile?.lastName || market.promoter.lastName,
      role: market.promoter.role
    } : null,
    
    // Location transformation (keep nested structure but ensure consistency)
    location: market.location ? {
      address: market.location.address?.street || market.location.address || '',
      city: market.location.address?.city || market.location.city || '',
      state: market.location.address?.state || market.location.state || '',
      zipCode: market.location.address?.zipCode || market.location.zipCode || '',
      country: market.location.address?.country || market.location.country || 'USA',
      formattedAddress: market.location.formattedAddress || '',
      latitude: market.location.coordinates?.[1],
      longitude: market.location.coordinates?.[0],
      coordinates: market.location.coordinates
    } : null,
    
    // Dates/Schedule transformation - Frontend expects "dates", backend has "schedule"
    dates: market.schedule ? {
      type: market.schedule.recurring ? 'recurring' : 'one-time',
      recurring: market.schedule.recurring,
      daysOfWeek: market.schedule.daysOfWeek || [],
      startTime: market.schedule.startTime,
      endTime: market.schedule.endTime,
      events: market.schedule.specialDates?.map(d => ({
        startDate: d.date,
        endDate: d.date,
        startTime: d.startTime || market.schedule.startTime,
        endTime: d.endTime || market.schedule.endTime
      })) || [],
      seasonStart: market.schedule.seasonStart,
      seasonEnd: market.schedule.seasonEnd
    } : null,
    
    // Schedule transformation - Match frontend interface exactly
    schedule: market.schedule ? [{
      id: '1',
      dayOfWeek: market.schedule.daysOfWeek?.[0] === 'monday' ? 1 :
                 market.schedule.daysOfWeek?.[0] === 'saturday' ? 6 :
                 market.schedule.daysOfWeek?.[0] === 'sunday' ? 0 : 6, // Default to Saturday
      startTime: market.schedule.startTime,
      endTime: market.schedule.endTime,
      startDate: market.schedule.seasonStart || '2024-01-01',
      endDate: market.schedule.seasonEnd || '2024-12-31',
      isRecurring: market.schedule.recurring || false
    }] : [],
    
    // Application settings
    applicationSettings: market.applicationSettings,
    
    // Other fields
    marketType: market.createdByType === 'vendor' ? 'vendor-created' : 'promoter-managed',
    createdByType: market.createdByType,
    images: market.images?.map(img => typeof img === 'string' ? img : img.url) || [],
    tags: market.tags || [],
    keywords: market.keywords || [],
    contact: market.contact || {},
    amenities: market.amenities || [],
    accessibility: {
      wheelchairAccessible: market.amenities?.includes('accessible') || false,
      parkingAvailable: market.amenities?.includes('parking') || false,
      restroomsAvailable: market.amenities?.includes('restrooms') || false,
      familyFriendly: market.amenities?.includes('playground') || true,
      petFriendly: market.amenities?.includes('pet_friendly') || false
    },
    
    // Statistics
    statistics: market.stats || market.statistics,
    stats: market.stats,
    vendorCount: market.vendorCount,
    
    // Timestamps
    createdAt: market.createdAt,
    updatedAt: market.updatedAt
  }
}

module.exports = { serializeMarket }
