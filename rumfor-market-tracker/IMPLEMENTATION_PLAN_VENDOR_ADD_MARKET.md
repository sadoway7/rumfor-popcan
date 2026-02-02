# Vendor Add Market Form - Implementation Plan

## Overview

This plan outlines all changes needed to implement the requirements for the vendor add market form at `/vendor/add-market/vendor` while following existing architecture patterns.

---

## Requirements Summary

Based on user requirements and existing architecture analysis:

1. **Schedule dates**: Change from day-of-week to calendar date format (e.g., "Jun 3, 2026")
2. **Image upload**: Optional field with category-based fallback using existing system
3. **Remove payment methods**: Not needed for market information
4. **Booth fee display**: Add to MarketDetailPage (optional display)

---

## Changes Summary

| # | Change | Impact | Architecture Compliance |
|---|--------|---------|----------------------|
| 1 | Schedule: Day-of-Week → Calendar Date | Form state, submission logic | ✅ Uses existing `MarketSchedule` type |
| 2 | Add Image Upload (Optional + Fallback) | Form state, submission logic | ✅ Uses existing `getCategoryDefaultImage()` |
| 3 | Remove Payment Methods | Form cleanup | ✅ Simple removal, no backend impact |
| 4 | Add Booth Fee to Detail Page | Display only | ✅ Uses existing `formatCurrency()` utility |

---

## File Changes Required

### 1. VendorAddMarketForm.tsx

**Path**: `rumfor-market-tracker/src/pages/vendor/VendorAddMarketForm.tsx`

#### Change 1.1: Add Import for Image Upload
```typescript
// After line 12, add:
import { getCategoryDefaultImage, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/config/constants'
import { Upload } from 'lucide-react'
```

#### Change 1.2: Update MarketFormData Interface
```typescript
// Update interface (lines 27-68):
interface MarketFormData {
  name: string
  description: string
  category: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  schedule: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    startDate: string
    endDate: string
    isRecurring: boolean
    eventDate: string  // NEW: Calendar date for one-time events
  }>
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  accessibility: {
    wheelchairAccessible: boolean
    parkingAvailable: boolean
    restroomsAvailable: boolean
    familyFriendly: boolean
    petFriendly: boolean
  }
  pricing: {
    boothFee?: number
    isFree: boolean
  }
  additionalInfo: {
    tags: string[]
    vendorCount?: number
    attendanceEstimate?: string
    // REMOVE: paymentMethods: string[]
    // REMOVE: setupRequirements: string[]
    marketImage?: string  // NEW: Optional uploaded image URL
  }
}
```

#### Change 1.3: Add Image Upload Handler
```typescript
// Add after line 147 (before handleChange):
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    alert('Invalid file type. Please upload JPG, PNG, or WebP images.')
    return
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    alert('File too large. Maximum size is 10MB.')
    return
  }
  
  // Create upload preview
  const reader = new FileReader()
  reader.onloadend = () => {
    const dataUrl = reader.result as string
    setFormData(prev => ({ ...prev, marketImage: dataUrl }))
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  setFormData(prev => ({ ...prev, marketImage: undefined }))
}
```

#### Change 1.4: Update Initial State
```typescript
// Update formData initialization (lines 112-147):
const [formData, setFormData] = useState<MarketFormData>({
  name: '',
  description: '',
  category: '',
  location: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  },
  schedule: [{
    dayOfWeek: 6,
    startTime: '08:00',
    endTime: '14:00',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eventDate: new Date().toISOString().split('T')[0],  // NEW
    isRecurring: true
  }],
  contact: {},
  accessibility: {
    wheelchairAccessible: false,
    parkingAvailable: true,
    restroomsAvailable: true,
    familyFriendly: true,
    petFriendly: false
  },
  pricing: {
    isFree: false
  },
  additionalInfo: {
    tags: [],
    vendorCount: undefined,
    attendanceEstimate: undefined
    // paymentMethods removed
    // setupRequirements removed
    marketImage: undefined  // NEW
})
```

#### Change 1.5: Add Image Upload Section in Step 1
```typescript
// Add after Category select (around line 372), before Description:
{/* Market Image Upload - Optional */}
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">Market Image (Optional)</label>
  <div className="flex items-start gap-4">
    <input
      type="file"
      id="market-image-upload"
      accept={ALLOWED_IMAGE_TYPES.join(',')}
      onChange={handleImageUpload}
      className="hidden"
    />
    <label
      htmlFor="market-image-upload"
      className={cn(
        "flex-1 cursor-pointer",
        !formData.marketImage && "w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50"
      )}
    >
      {formData.marketImage ? (
        <img 
          src={formData.marketImage} 
          alt="Market preview" 
          className="w-full h-40 object-cover rounded-lg" 
        />
      ) : (
        <div className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground ml-2">Click to upload image</span>
        </div>
      )}
    </label>
    {formData.marketImage && (
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={removeImage}
        className="text-destructive"
      >
        <X className="w-4 h-4" />
        Remove Image
      </Button>
    )}
  </div>
</div>
```

#### Change 1.6: Update Step 2 - Change Schedule to Calendar Dates
```typescript
// Replace "Day" dropdown with "Date" input (around line 493):
// Find the schedule item rendering section and update:

<div className="space-y-2">
  <label className="text-sm font-medium mb-1">Date</label>
  <Input
    type="date"
    value={item.eventDate || ''}
    onChange={(e) => updateScheduleItem(index, 'eventDate', e.target.value)}
    min={new Date().toISOString().split('T')[0]}
    required
  />
</div>
```

**Note**: Keep the existing `dayOfWeek` dropdown and `isRecurring` checkbox for backward compatibility with markets that use recurring schedules.

#### Change 1.7: Remove Payment Methods Section
```typescript
// Delete entire payment methods card section (lines 774-809):
// REMOVE THIS ENTIRE CARD SECTION
```

#### Change 1.8: Update Submit Handler
```typescript
// Update handleSubmit function (lines 180-229):
const handleSubmit = async () => {
  if (!validateStep(3)) return
  
  setIsSubmitting(true)
  
  try {
    // Transform schedule items with calendar dates
    const events = formData.schedule.map(item => {
      const eventDate = item.eventDate || item.startDate
      return {
        startDate: new Date(eventDate).toISOString(),
        endDate: item.isRecurring 
          ? formData.schedule.find(s => s.dayOfWeek === item.dayOfWeek)?.endDate || eventDate
          : new Date(eventDate).toISOString(),
        time: {
          start: item.startTime,
          end: item.endTime
        }
      }
    })
    
    // Handle image: use uploaded or category fallback
    const finalImages = formData.marketImage 
      ? [formData.marketImage] 
      : [getCategoryDefaultImage(formData.category)]
    
    const marketData: CreateMarketData = {
      name: formData.name,
      description: formData.description,
      category: formData.category as MarketCategory,
      promoterId: user?.id || '',
      location: formData.location,
      dates: {
        type: 'one-time' as const,
        events
      },
      contact: formData.contact,
      accessibility: formData.accessibility,
      applicationFields: [],
      images: finalImages,
      tags: formData.additionalInfo.tags,
      schedule: formData.schedule.map(s => ({
        ...s,
        id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      vendorAttendance: 'attending',
      marketType: 'vendor-created',
      status: 'active',
      editableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        viewCount: 0,
        favoriteCount: 0,
        applicationCount: 0,
        commentCount: 0,
        rating: 0,
        reviewCount: 0
      }
    }
    
    const response = await marketsApi.createMarket(marketData)
    if (response.success && response.data) {
      navigate('/my-markets', {
        state: {
          message: 'Market added successfully! You can now track this market and plan your participation.',
          marketId: response.data.id
        }
      })
    } else {
      throw new Error(response.error || 'Failed to create market')
    }
  } catch (error) {
    console.error('Failed to create market:', error)
    alert('Failed to submit market. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}
```

### 2. MarketDetailPage.tsx

**Path**: `rumfor-market-tracker/src/pages/markets/MarketDetailPage.tsx`

#### Change 2.1: Add Import for Currency Formatting
```typescript
// Add to existing imports (line 16):
import { formatCurrency } from '@/utils/formatCurrency'
```

#### Change 2.2: Add Booth Fee Display Section
```typescript
// Add after Accessibility & Amenities card (around line 453):
{/* Booth Fee - Optional Display */}
{market.pricing?.boothFee !== undefined && market.pricing?.boothFee !== 0 && (
  <Card className="p-2">
    <div className="flex items-center gap-2 mb-2">
      <DollarSign className="w-4 h-4 text-accent" />
      <h2 className="font-medium text-sm">Pricing Information</h2>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Booth Fee</span>
      <span className="text-sm font-medium text-foreground">
        {market.pricing.isFree ? 'Free' : formatCurrency(market.pricing.boothFee)}
      </span>
    </div>
  </Card>
)}
```

### 3. Types (No Changes Needed)

The [`Market`](rumfor-market-tracker/src/types/index.ts:81-134) type already has `pricing` field defined with `boothFee`. No changes needed to [`src/types/index.ts`](rumfor-market-tracker/src/types/index.ts).

---

## Implementation Order

### Phase 1: Form Updates (VendorAddMarketForm.tsx)

1. Add image upload imports
2. Update `MarketFormData` interface with `marketImage` and `eventDate`
3. Remove `paymentMethods` from interface
4. Add image upload handler functions
5. Add image upload section in Step 1
6. Update schedule section to use calendar dates
7. Remove payment methods card section
8. Update submit handler for image and date transformation

### Phase 2: Detail Page Updates (MarketDetailPage.tsx)

1. Add `formatCurrency` import
2. Add booth fee display section after Accessibility card

---

## Testing Checklist

- [ ] Form validates that schedule dates are not in the past
- [ ] Form validates that at least one schedule item is added
- [ ] Image upload rejects invalid file types (only JPG, PNG, WebP)
- [ ] Image upload rejects files larger than 10MB
- [ ] Category fallback images display correctly when no image uploaded
- [ ] Booth fee displays as "Free" when not set or is 0
- [ ] Booth fee displays with currency formatting when set
- [ ] Mobile responsiveness verified for all new inputs
- [ ] Form submission creates market with correct data structure
- [ ] Market detail page shows booth fee when populated

---

## Mobile Considerations

- **Date picker**: Use native date input (`type="date"`) for best mobile experience across all platforms
- **Image upload**: Ensure touch-friendly upload area (minimum 44x44px for touch targets)
- **Multi-step form**: Existing 3-step structure is already mobile-friendly
- **Progress indicators**: Keep existing step-by-step navigation for clear user flow

---

## Architecture Compliance Notes

1. **Uses existing type system**: No new types needed - `Market`, `MarketSchedule`, `AccessibilityFeatures`, `ContactInfo` already defined
2. **Uses existing API patterns**: `marketsApi.createMarket()` already exists and handles the data structure
3. **Uses existing hooks**: `useCreateMarketMutation()` already exists with proper invalidation
4. **Uses existing utilities**: `getCategoryDefaultImage()`, `formatCurrency()` already available
5. **Uses existing constants**: `ALLOWED_IMAGE_TYPES`, `MAX_FILE_SIZE`, `CATEGORY_DEFAULT_IMAGES` already configured
6. **Maintains backward compatibility**: Keeps `dayOfWeek` and `isRecurring` for recurring market support

---

## Data Flow

### Image Upload Flow

```
User uploads image 
  → FileReader converts to DataURL 
    → Set in form state as marketImage
      → On submit: Check if marketImage exists
        → Yes: Use uploaded image URL
        → No: Call getCategoryDefaultImage(category)
    → Final images array = [imageUrl]
```

### Schedule Date Flow

```
User enters calendar date (eventDate)
  → Stored in form state
    → On submit: Transform to ISO date string
      → Create event object with startDate/endDate
        → Set dates.type = 'one-time'
          → Backend stores with proper date format
```

---

## Files Modified

| File | Lines Changed | Type of Change |
|-------|----------------|----------------|
| `VendorAddMarketForm.tsx` | 10-15, 27-68, 112-147, ~372, ~493, ~774-809, 180-229 | Multiple sections |
| `MarketDetailPage.tsx` | ~16, ~453 | Add display section |

---

## Estimated Effort

| Task | Estimated Time |
|-------|---------------|
| Add image upload functionality | 30-45 min |
| Update schedule to calendar dates | 20-30 min |
| Remove payment methods | 5 min |
| Update submit handler | 30-45 min |
| Add booth fee display | 15-20 min |
| Testing & validation | 30-45 min |
| **Total** | **~2.5-3 hours** |
