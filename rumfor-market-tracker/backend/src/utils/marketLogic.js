const Market = require('../models/Market')
const Application = require('../models/Application')
const UserMarketTracking = require('../models/UserMarketTracking')

/**
 * Market Status Transition Logic
 * Based on business rules defined from user discussion
 */

// Valid status transitions
const MARKET_STATUS_TRANSITIONS = {
  'draft': ['pending_approval', 'cancelled'],
  'pending_approval': ['active', 'draft', 'cancelled', 'suspended'],
  'active': ['inactive', 'suspended', 'cancelled', 'completed'],
  'inactive': ['active', 'cancelled'],
  'suspended': ['active', 'cancelled'],
  'cancelled': [], // Terminal state
  'completed': [] // Terminal state
}

// Application status transitions
const APPLICATION_STATUS_TRANSITIONS = {
  'draft': ['submitted', 'withdrawn'],
  'submitted': ['under-review', 'draft', 'withdrawn'],
  'under-review': ['approved', 'rejected', 'withdrawn'],
  'approved': ['withdrawn'], // Can still withdraw after approval
  'rejected': ['draft', 'withdrawn'], // Allow re-application after rejection
  'withdrawn': [] // Terminal state
}

/**
 * Validate market status transition
 */
function isValidMarketStatusTransition(currentStatus, newStatus) {
  return MARKET_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false
}

/**
 * Validate application status transition
 */
function isValidApplicationStatusTransition(currentStatus, newStatus) {
  return APPLICATION_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false
}

/**
 * Check if market allows new applications
 */
function canMarketAcceptApplications(market) {
  const allowedStatuses = ['active', 'pending_approval']

  if (!allowedStatuses.includes(market.status)) {
    return false
  }

  // Check capacity
  if (market.applicationSettings?.maxVendors &&
      market.vendorCount >= market.applicationSettings.maxVendors) {
    return false
  }

  // Check deadline
  if (market.applicationSettings?.applicationDeadline) {
    const deadline = new Date(market.applicationSettings.applicationDeadline)
    if (new Date() > deadline) {
      return false
    }
  }

  return true
}

/**
 * Check if vendor can apply to market (one application per vendor per market rule)
 */
async function canVendorApplyToMarket(vendorId, marketId) {
  const existingApplication = await Application.findOne({
    vendor: vendorId,
    market: marketId,
    isDeleted: false
  })

  if (existingApplication) {
    // Check if they can re-apply (only if rejected or withdrawn)
    const reapplyStatuses = ['rejected', 'withdrawn']
    return reapplyStatuses.includes(existingApplication.status)
  }

  return true
}

/**
 * Auto-approve logic for returning vendors with good track record
 */
async function shouldAutoApproveApplication(vendorId, marketId) {
  try {
    // Count previous completed markets for this vendor
    const completedTrackings = await UserMarketTracking.countDocuments({
      user: vendorId,
      status: 'completed'
    })

    // Auto-approve if vendor has 3+ completed markets
    if (completedTrackings >= 3) {
      // Additional check: no recent rejections
      const recentRejections = await Application.countDocuments({
        vendor: vendorId,
        status: 'rejected',
        updatedAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } // Last 6 months
      })

      return recentRejections === 0
    }

    return false
  } catch (error) {
    console.error('Error checking auto-approval:', error)
    return false
  }
}

/**
 * Calculate next market date with special date priority
 */
function calculateNextMarketDate(market) {
  const now = new Date()

  // For one-time markets, return the event date if in future
  if (!market.schedule?.recurring && market.dates?.events?.length > 0) {
    const futureEvents = market.dates.events.filter(event =>
      new Date(event.startDate) > now
    )
    return futureEvents.length > 0 ? new Date(futureEvents[0].startDate) : null
  }

  // For recurring markets
  if (market.schedule?.recurring && market.schedule.daysOfWeek?.length > 0) {
    // Check special dates first (they take priority)
    if (market.schedule.specialDates?.length > 0) {
      const futureSpecialDates = market.schedule.specialDates
        .filter(special => new Date(special.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      if (futureSpecialDates.length > 0) {
        return new Date(futureSpecialDates[0].date)
      }
    }

    // Find next regular scheduled date
    const dayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
                     friday: 5, saturday: 6, sunday: 0 }
    const marketDayNumbers = market.schedule.daysOfWeek.map(day =>
      dayMap[day.toLowerCase()]
    )

    let daysToAdd = 7 // Max look ahead
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(now)
      checkDate.setDate(now.getDate() + i)
      const checkDay = checkDate.getDay()

      if (marketDayNumbers.includes(checkDay)) {
        // Check if within season
        const seasonStart = market.schedule.seasonStart ? new Date(market.schedule.seasonStart) : null
        const seasonEnd = market.schedule.seasonEnd ? new Date(market.schedule.seasonEnd) : null

        if ((!seasonStart || checkDate >= seasonStart) &&
            (!seasonEnd || checkDate <= seasonEnd)) {
          daysToAdd = i
          break
        }
      }
    }

    if (daysToAdd < 7) {
      const nextDate = new Date(now)
      nextDate.setDate(now.getDate() + daysToAdd)
      return nextDate
    }
  }

  return null
}

/**
 * Check if market should auto-complete
 */
async function shouldMarketComplete(market) {
  const nextDate = calculateNextMarketDate(market)

  if (!nextDate) return false

  const now = new Date()
  const marketEnd = new Date(nextDate)

  // Add market duration (assume 8 hours if not specified)
  if (market.schedule?.endTime) {
    const [hours] = market.schedule.endTime.split(':')
    marketEnd.setHours(parseInt(hours), 0, 0, 0)
  } else {
    marketEnd.setHours(marketEnd.getHours() + 8)
  }

  // Complete 24 hours after market end
  const completionTime = new Date(marketEnd.getTime() + 24 * 60 * 60 * 1000)

  return now > completionTime
}

/**
 * Process refund for cancelled applications
 */
function calculateRefund(amount, feeType, cancelledAt, marketDate) {
  if (feeType === 'application') {
    // Application fees are non-refundable
    return 0
  }

  if (feeType === 'booth') {
    // Booth fees: refundable if cancelled early
    const daysUntilMarket = Math.ceil((marketDate - cancelledAt) / (1000 * 60 * 60 * 24))

    if (daysUntilMarket >= 14) {
      // Full refund if 2+ weeks before
      return amount
    } else if (daysUntilMarket >= 7) {
      // Partial refund if 1 week before
      return amount * 0.5
    } else {
      // No refund if less than 1 week
      return 0
    }
  }

  return 0
}

/**
 * Validate market data completeness
 */
function validateMarketData(marketData) {
  const errors = []

  // Required fields
  const required = ['name', 'description', 'category', 'location']
  required.forEach(field => {
    if (!marketData[field]) {
      errors.push(`${field} is required`)
    }
  })

  // Location validation
  if (marketData.location) {
    const locRequired = ['street', 'city', 'state', 'zipCode']
    locRequired.forEach(field => {
      if (!marketData.location[field]) {
        errors.push(`location.${field} is required`)
      }
    })
  }

  // Schedule validation for recurring markets
  if (marketData.schedule?.recurring) {
    if (!marketData.schedule.daysOfWeek?.length) {
      errors.push('daysOfWeek is required for recurring markets')
    }
    if (!marketData.schedule.startTime || !marketData.schedule.endTime) {
      errors.push('startTime and endTime are required for recurring markets')
    }
  }

  return errors
}

module.exports = {
  isValidMarketStatusTransition,
  isValidApplicationStatusTransition,
  canMarketAcceptApplications,
  canVendorApplyToMarket,
  shouldAutoApproveApplication,
  calculateNextMarketDate,
  shouldMarketComplete,
  calculateRefund,
  validateMarketData,
  MARKET_STATUS_TRANSITIONS,
  APPLICATION_STATUS_TRANSITIONS
}