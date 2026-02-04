# Market Date Display Issues - Known Problems

## Summary
Vendors can add multiple dates when creating markets. The backend now stores these in `schedule.specialDates` and the serializer transforms them into an array format. However, not all display locations have been updated to handle the new format.

## SOLUTION THAT WORKED

### Problem
Vendors add multiple dates in the form, but only 1 date was showing on market cards and detail pages.

### Root Cause
The frontend form was sending dates in a format the backend didn't expect, and the backend serializer wasn't transforming the `specialDates` field into the schedule array format the frontend expected.

### What Fixed It

1. **Updated VendorAddMarketForm to send `specialDates` array**:
```javascript
schedule: {
  recurring: false,
  daysOfWeek: [],
  startTime: formData.schedule[0]?.startTime || '08:00',
  endTime: formData.schedule[0]?.endTime || '14:00',
  seasonStart: formatLocalDate(formData.schedule[0]?.eventDate || new Date().toISOString()),
  seasonEnd: formatLocalDate(formData.schedule[formData.schedule.length - 1]?.eventDate || ...),
  specialDates: formData.schedule.map(s => ({
    date: new Date(s.eventDate || s.startDate || new Date()).toISOString().split('T')[0],
    startTime: s.startTime || '08:00',
    endTime: s.endTime || '14:00'
  }))
}
```

2. **Updated backend serializer to handle `specialDates`**:
- Added logic to transform `specialDates` array into schedule array format
- Used for-loop instead of .map() to avoid potential memory issues with Zone.js
- Each specialDate is converted to a schedule item with:
  - `id`: index number
  - `dayOfWeek`: derived from the date
  - `startTime`/`endTime`: from the specialDate or fallback to schedule defaults
  - `startDate`/`endDate`: the date string from specialDate
  - `isRecurring`: false

### Key Files Modified
- `src/pages/vendor/VendorAddMarketForm.tsx` - Form now sends specialDates
- `backend/src/utils/serializers.js` - Serializer handles specialDates transformation
- `backend/src/models/Market.js` - Already had specialDates field (no changes needed)

## Current Working Locations
- Market cards on search page - ✓ Working (transformScheduleToArray handles specialDates)
- Market detail page - ✓ Working (uses schedule array from API)

## Locations Needing Verification/Fixes

### 1. Market Search Page (MarketGrid)
- **File**: `src/components/MarketGrid.tsx`
- **Status**: Should work via `transformScheduleToArray` in marketsApi.ts
- **Action**: Verify dates display correctly with multiple entries

### 2. Market Cards (MarketCard)
- **File**: `src/components/MarketCard.tsx`
- **Status**: Should work via `transformScheduleToArray` in marketsApi.ts
- **Action**: Verify dates display correctly with multiple entries

### 3. Market Detail Page
- **File**: `src/pages/markets/MarketDetailPage.tsx`
- **Status**: Should work via serializer
- **Action**: Verify dates display correctly with multiple entries

### 4. Vendor Tracked Markets Page
- **File**: `src/pages/vendor/VendorTrackedMarketsPage.tsx`
- **Status**: Unknown - may need verification
- **Action**: Check if dates display correctly

### 5. My Markets Page
- **File**: `src/pages/MyMarketsPage.tsx`
- **Status**: Unknown - may need verification
- **Action**: Check if dates display correctly

### 6. Market Calendar View
- **File**: `src/components/MarketCalendar.tsx` (or similar)
- **Status**: Unknown
- **Action**: Verify calendar displays all dates

### 7. Admin Market Oversight Pages
- **Files**: `src/pages/admin/AdminMarketsPage.tsx`, `AdminEditMarketPage.tsx`
- **Status**: May need updates for editing markets with multiple dates
- **Action**: Verify schedule editing works with multiple dates

## Testing Checklist
- [ ] Submit market with 3+ dates
- [ ] Check Market Search page shows all dates
- [ ] Check Market Detail page shows all dates
- [ ] Check Market Cards show all dates
- [ ] Check Vendor Tracked Markets page shows all dates
- [ ] Check My Markets page shows all dates
- [ ] Check Calendar view shows all dates
- [ ] Verify admin can edit schedule with multiple dates

## Backend Changes Made
1. **Serializer** (`backend/src/utils/serializers.js`): Added support for `specialDates` array transformation to schedule array format
2. **Model** (`backend/src/models/Market.js`): Already had `specialDates` field in schedule schema

## Frontend Changes Made
1. **VendorAddMarketForm** (`src/pages/vendor/VendorAddMarketForm.tsx`): Now sends `specialDates` array in schedule object
2. **marketsApi** (`src/features/markets/marketsApi.ts`): `transformScheduleToArray` function handles `specialDates` format

## Date Format Expected by Frontend
```typescript
interface MarketScheduleItem {
  id: string
  dayOfWeek: number  // 0-6 (Sunday = 0)
  startTime: string // "HH:MM" format
  endTime: string   // "HH:MM" format
  startDate: string // "YYYY-MM-DD" format
  endDate: string   // "YYYY-MM-DD" format
  isRecurring: boolean
}
```

## Notes
- The "Schedule TBD" message appears when schedule is null/empty/undefined
- All date parsing should use `parseLocalDate()` from `@/utils/formatDate` to avoid timezone issues
- All date storage should use `formatLocalDate()` to store as "YYYY-MM-DD" strings
- When debugging, check browser console for API response to verify data format
