# VendorTrackedMarketsPage Redesign Documentation

## Overview

The VendorTrackedMarketsPage has been redesigned from a grid-based card layout to a mobile-first horizontal list layout with integrated task previews, status filters, and view toggles.

---

## Components

### 1. VendorTrackedMarketRow

**Location**: `src/components/VendorTrackedMarketRow.tsx`

**Purpose**: Mobile-first horizontal card component for displaying tracked markets with integrated task preview.

#### Props

```typescript
interface VendorTrackedMarketRowProps {
  market: Market                              // Market object with all details
  tracking?: VendorMarketTracking            // Tracking data (status, progress, expenses)
  onViewDetails?: (marketId: string) => void // Navigate to detail page
  onManage?: (marketId: string) => void      // Navigate to management view
  onUntrack?: (marketId: string) => void     // Remove from tracked markets
  onToggleTodo?: (todoId: string) => void    // Toggle todo completion
  className?: string                          // Additional CSS classes
}
```

#### Layout Structure

**Mobile (< 768px)**:
```
┌─────────────────────────────────┐
│ [Hero Image - Full Width]      │
├─────────────────────────────────┤
│ Market Name & Status            │
│ Location · Date                 │
│ Quick Stats                     │
│ [View] [Manage] [Untrack]       │
├─────────────────────────────────┤
│ Tasks (X/Y)        [+ Add Task] │
│ ☑ Completed task                │
│ ☐ Pending task                  │
│ ☐ Another task                  │
└─────────────────────────────────┘
```

**Desktop (≥ 768px)**:
```
┌──────────┬─────────────────┬──────────────────┐
│ [Image]  │ Market Info     │ Tasks (X/Y)      │
│ 256-320px│ - Name          │ ☑ Task 1         │
│          │ - Location      │ ☐ Task 2         │
│          │ - Date          │ ☐ Task 3         │
│ [Status] │ - Stats         │ ☐ Task 4         │
│          │ [View Details]  │ ☐ Task 5         │
│          │ [Manage]        │ [+ Add Task]     │
│          │ [Untrack]       │                  │
└──────────┴─────────────────┴──────────────────┘
```

#### Features

1. **Responsive Layout**:
   - Mobile: Stacks all content vertically
   - Tablet: Image + Info on left, Tasks on right
   - Desktop: 3-column layout (Image | Info | Tasks)

2. **Interactive Task Preview**:
   - Shows top 5 tasks (3 incomplete + 2 completed)
   - Checkboxes update completion status in real-time
   - Links to full task list on detail page

3. **Status Badge**:
   - Color-coded by tracking status
   - Positioned on image overlay
   - 8 status types supported

4. **Action Buttons**:
   - View Details: Navigate to full market view
   - Manage: Go to preparation/management tab
   - Untrack: Remove market (with confirmation)

---

### 2. VendorTrackedMarketsPage

**Location**: `src/pages/vendor/VendorTrackedMarketsPage.tsx`

**Route**: `/vendor/tracked-markets`

#### Features

##### Status Filter Badges
Clickable badges showing count for each status:
- **All**: Total tracked markets
- **Interested**: Watching/considering
- **Applied**: Application submitted
- **Approved**: Application approved
- **Attending**: Confirmed attendance
- **Completed**: Market finished

**Implementation**:
```typescript
const statusCounts = useMemo(() => {
  const counts = { all: trackedMarkets.length, ... }
  trackedMarkets.forEach(market => {
    const status = getTrackingStatus(market.id)?.status
    if (status && status in counts) counts[status]++
  })
  return counts
}, [trackedMarkets, getTrackingStatus])
```

##### View Toggle
Switch between different visualization modes:
- **List View** (default): Horizontal cards with task previews
- **Grid View**: Compact vertical cards (uses existing VendorMarketCard)

**Future**: Calendar view showing markets on timeline

##### Sort Options
- **By Date**: Upcoming markets first
- **By Name**: Alphabetical order
- **By Status**: Grouped by tracking status
- **By Progress**: Task completion percentage

##### Search Functionality
Real-time search filtering by:
- Market name
- City
- State

---

## Data Flow

```
VendorTrackedMarketsPage
  ├→ useTrackedMarkets()           ← Get all tracked markets
  │   ├→ trackedMarkets[]          ← Array of Market objects
  │   ├→ trackingData[]            ← Status, progress, expenses
  │   └→ getTrackingStatus(id)     ← Get tracking for specific market
  │
  └→ VendorTrackedMarketRow (for each market)
      ├→ useTodos(market.id)       ← Fetch todos for this market
      │   ├→ todos[]               ← Array of Todo items
      │   └→ toggleTodo(id)        ← Update completion status
      │
      └→ useExpenses(market.id)    ← Get expense total
```

---

## Mobile-First Design Principles

### Touch Targets
- Buttons: `min-h-[44px]` (minimum touch target)
- Checkboxes: `w-4 h-4` with `p-2.5` clickable area
- Filter badges: `min-h-[36px]` (acceptable for secondary actions)

### Text Sizes
- Headings: `text-lg` (18px) minimum
- Body text: `text-sm` (14px)
- Labels: `text-xs` (12px) for metadata only

### Responsive Images
- Mobile: Full-width, `h-48`
- Tablet: `w-64`, full height
- Desktop: `w-80`, full height

### Spacing
- Mobile: `p-4` standard padding
- Desktop: `p-6` generous padding
- Gap between cards: `space-y-4`

---

## Status Color Mapping

```typescript
const statusColors = {
  interested: 'bg-blue-100 text-blue-800 border-blue-200',
  applied: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  attending: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  declined: 'bg-orange-100 text-orange-800 border-orange-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  archived: 'bg-slate-100 text-slate-800 border-slate-200'
}
```

---

## User Workflows

### Filtering Markets
1. Click status badge (e.g., "2 interested")
2. List updates to show only markets with that status
3. Count updates to show filtered results
4. Click "all" to clear filter

### Sorting Markets
1. Click sort dropdown
2. Select sort option (Date, Name, Status, Progress)
3. Markets reorder immediately
4. Sort persists until changed

### Managing Tasks
1. View task preview in card
2. Click checkbox to mark complete/incomplete
3. Status updates immediately via API
4. Progress percentage recalculated
5. Click "+ Add Task" to create new task
6. Click "View all X tasks" to see full list

### Navigating to Details
1. **View Details**: Go to overview tab
2. **Manage**: Go to preparation tab (full task list)
3. **Untrack**: Remove market (shows confirmation)

---

## Integration with Existing Pages

### VendorMarketDetailPage
**Route**: `/vendor/markets/:id`

**Tabs**:
- Overview: Market details, images, contact
- **Preparation**: Full VendorTodoList component
- **Expenses**: Full VendorExpenseTracker component
- Analytics: Performance metrics
- Logistics: Transportation planning
- Communication: Direct messaging

**Navigation**:
- From tracked markets → Click "View Details" or "Manage"
- Back to tracked markets → "Tracked Markets" breadcrumb

---

## Performance Optimizations

### Data Fetching
- Uses React Query for caching and optimistic updates
- Each market fetches its own todos independently
- Stale time: 5 minutes for todos
- Automatic refetch on window focus disabled

### Rendering
- List virtualization ready (for 100+ markets)
- Memoized filtering and sorting functions
- Lazy loading for grid/calendar views

### Bundle Size
- Shared components (VendorMarketCard) for grid view
- No duplicate code between views
- Icons from lucide-react (tree-shakeable)

---

## Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order: Filters → Sort → View Toggle → Market Cards
- Enter/Space activates buttons and checkboxes

### Screen Readers
- Semantic HTML structure
- ARIA labels on view toggle buttons
- Todo checkboxes have proper labels
- Status badges announce current selection

### Color Contrast
- All text meets WCAG AA standards
- Status colors have sufficient contrast
- Focus indicators clearly visible

---

## Future Enhancements

### Phase 2 (Planned)
- Calendar view integration
- Bulk actions (select multiple markets)
- Custom status tags
- Export to PDF/CSV
- Drag-to-reorder markets

### Phase 3 (Proposed)
- Virtual scrolling for large lists
- Pull-to-refresh on mobile
- Swipe gestures (swipe to untrack)
- Offline support
- Push notifications for upcoming markets

---

## Technical Notes

### Dependencies
- `@tanstack/react-query`: Data fetching and caching
- `lucide-react`: Icon library
- `tailwindcss`: Styling framework
- React Router: Navigation

### Hooks Used
- `useTrackedMarkets()`: Main data hook for tracked markets
- `useTodos(marketId)`: Fetch todos for specific market
- `useVendorApplications()`: Get application status
- `useMemo()`: Optimize filtering/sorting

### State Management
- Local component state for UI (viewMode, statusFilter, sortBy)
- React Query for server state (markets, todos, tracking)
- No global state needed (self-contained page)

---

## Troubleshooting

### Markets not showing
- Check if user is logged in
- Verify tracked markets exist in database
- Check network tab for API errors

### Tasks not updating
- Verify `useTodos` hook is fetching correctly
- Check API endpoint `/api/todos`
- Ensure marketId is passed correctly

### Layout issues on mobile
- Test on actual device (not just browser DevTools)
- Check responsive breakpoints in component
- Verify Tailwind classes are applied

---

## Screenshots

### Desktop View
- Horizontal cards with 3-column layout
- Filter badges and controls at top
- Task preview panel on right side

### Mobile View
- Stacked vertical layout
- Full-width hero image
- Compact task list
- Touch-friendly buttons

### Grid View
- Falls back to existing VendorMarketCard
- 3-column grid on desktop
- 1-column on mobile

---

## Maintenance

### Adding New Status Types
1. Update status colors in `VendorTrackedMarketRow.tsx`
2. Add to STATUS_COLORS object in page
3. Add badge to filter bar
4. Update statusCounts calculation

### Modifying Task Preview
- Change max tasks shown: Edit `slice(0, 5)` in component
- Adjust task display: Modify task map function
- Add new task fields: Update Todo interface and display

### Changing Sort Logic
- Add new sort option to Select dropdown
- Implement sort logic in sortedMarkets useMemo
- Test with various data sets

---

## API Endpoints Used

- `GET /api/markets/tracked` - Get user's tracked markets
- `DELETE /api/markets/:id/track` - Untrack market
- `GET /api/todos?marketId=:id` - Get todos for market
- `PATCH /api/todos/:id` - Update todo (toggle completion)

---

## Component Files Modified

1. **Created**: `src/components/VendorTrackedMarketRow.tsx`
   - New horizontal card component with task preview

2. **Updated**: `src/pages/vendor/VendorTrackedMarketsPage.tsx`
   - Added status filters
   - Added view toggle (list/grid)
   - Added sort dropdown
   - Changed from grid to list layout
   - Added filtering and sorting logic

3. **Preserved**: `src/components/VendorMarketCard.tsx`
   - Kept for grid view option
   - No changes needed

---

## Testing Checklist

- [x] Renders correctly on mobile (< 640px)
- [x] Renders correctly on tablet (768px - 1024px)
- [x] Renders correctly on desktop (≥ 1024px)
- [x] Status filters work correctly
- [x] Sort dropdown reorders markets
- [x] View toggle switches layouts
- [x] Search filters markets
- [x] Todo checkboxes update completion
- [x] Navigation buttons work
- [x] Untrack shows confirmation
- [x] Empty states display properly
- [x] Loading states show spinner
- [x] Error states handled gracefully

---

## Usage Example

```tsx
import { VendorTrackedMarketRow } from '@/components/VendorTrackedMarketRow'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const { trackedMarkets, getTrackingStatus, untrackMarket } = useTrackedMarkets()
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      {trackedMarkets.map(market => (
        <VendorTrackedMarketRow
          key={market.id}
          market={market}
          tracking={getTrackingStatus(market.id)}
          onViewDetails={(id) => navigate(`/vendor/markets/${id}`)}
          onManage={(id) => navigate(`/vendor/markets/${id}?tab=preparation`)}
          onUntrack={untrackMarket}
        />
      ))}
    </div>
  )
}
```

---

## Conclusion

The redesigned VendorTrackedMarketsPage provides:
- ✅ Mobile-first, responsive layout
- ✅ Efficient data density for phone screens
- ✅ Integrated task preview with checkboxes
- ✅ Status filtering and sorting
- ✅ Multiple view modes (list/grid)
- ✅ Clean navigation to detail pages
- ✅ Touch-friendly interface

The implementation reuses existing hooks and components where possible while adding new features requested in the redesign specification.
