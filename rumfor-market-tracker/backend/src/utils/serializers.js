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
    
    // Location transformation - handle both nested objects and formatted strings
    location: (() => {
      if (!market.location) return null

      // If location is already in the expected flat format, use it
      if (market.location.city && market.location.state) {
        return {
          address: market.location.address || market.location.street || '',
          city: market.location.city,
          state: market.location.state,
          zipCode: market.location.zipCode || market.location.zip || '',
          country: market.location.country || 'USA',
          formattedAddress: market.location.formattedAddress || '',
          latitude: market.location.latitude || market.location.coordinates?.[1],
          longitude: market.location.longitude || market.location.coordinates?.[0],
          coordinates: market.location.coordinates
        }
      }

      // Try to parse formatted address string (e.g., "123 Main St, Test City, TX 75001")
      const addressStr = market.location.address || market.location.formattedAddress || ''
      if (typeof addressStr === 'string' && addressStr.includes(',')) {
        const parts = addressStr.split(',').map(p => p.trim())
        if (parts.length >= 3) {
          // Assume format: "street, city, state zip"
          const street = parts[0]
          const city = parts[1]
          const stateZip = parts[2].split(' ')
          const state = stateZip[0]
          const zipCode = stateZip.slice(1).join(' ')

          return {
            address: street,
            city: city,
            state: state,
            zipCode: zipCode,
            country: 'USA',
            formattedAddress: addressStr,
            latitude: market.location.coordinates?.[1],
            longitude: market.location.coordinates?.[0],
            coordinates: market.location.coordinates
          }
        }
      }

      // Fallback - try nested structure
      return {
        address: market.location.address?.street || market.location.address || '',
        city: market.location.address?.city || market.location.city || '',
        state: market.location.address?.state || market.location.state || '',
        zipCode: market.location.address?.zipCode || market.location.zipCode || '',
        country: market.location.address?.country || market.location.country || 'USA',
        formattedAddress: market.location.formattedAddress || addressStr,
        latitude: market.location.coordinates?.[1],
        longitude: market.location.coordinates?.[0],
        coordinates: market.location.coordinates
      }
    })(),
    
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
    
    // Schedule transformation - Handle different backend formats
    schedule: (() => {
      if (!market.schedule) return []

      // If schedule is already an array (frontend format), return as-is
      if (Array.isArray(market.schedule)) {
        return market.schedule.map(s => ({
          id: s.id || '1',
          dayOfWeek: s.dayOfWeek ?? 6, // Default Saturday
          startTime: s.startTime,
          endTime: s.endTime,
          startDate: s.startDate || '2024-01-01',
          endDate: s.endDate || '2024-12-31',
          isRecurring: s.isRecurring ?? true
        }))
      }

      // Handle backend object format with daysOfWeek array
      if (market.schedule.daysOfWeek && Array.isArray(market.schedule.daysOfWeek)) {
        return market.schedule.daysOfWeek.map((day, index) => ({
          id: (index + 1).toString(),
          dayOfWeek: day === 'monday' ? 1 :
                    day === 'tuesday' ? 2 :
                    day === 'wednesday' ? 3 :
                    day === 'thursday' ? 4 :
                    day === 'friday' ? 5 :
                    day === 'saturday' ? 6 :
                    day === 'sunday' ? 0 : 6, // Default Saturday
          startTime: market.schedule.startTime,
          endTime: market.schedule.endTime,
          startDate: market.schedule.seasonStart || '2024-01-01',
          endDate: market.schedule.seasonEnd || '2024-12-31',
          isRecurring: market.schedule.recurring ?? true
        }))
      }

      // Handle single schedule object
      return [{
        id: '1',
        dayOfWeek: typeof market.schedule.dayOfWeek === 'string' ?
          (market.schedule.dayOfWeek === 'monday' ? 1 :
           market.schedule.dayOfWeek === 'saturday' ? 6 :
           market.schedule.dayOfWeek === 'sunday' ? 0 : 6) :
          (market.schedule.dayOfWeek ?? 6),
        startTime: market.schedule.startTime,
        endTime: market.schedule.endTime,
        startDate: market.schedule.startDate || market.schedule.seasonStart || '2024-01-01',
        endDate: market.schedule.endDate || market.schedule.seasonEnd || '2024-12-31',
        isRecurring: market.schedule.isRecurring ?? market.schedule.recurring ?? true
      }]
    })(),
    
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
