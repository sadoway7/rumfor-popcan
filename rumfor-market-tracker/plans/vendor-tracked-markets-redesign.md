# VendorTrackedMarketsPage Redesign - Architecture Plan

## Executive Summary

Redesign the VendorTrackedMarketsPage from a grid-based card layout to a mobile-first, efficient horizontal list layout with integrated todo previews and enhanced filtering capabilities.

**Key Goals**:
- Mobile-first design with optimal data density
- Horizontal list layout showing essential market info + todo preview
- Status filters, view toggles, and sorting options
- Link to VendorMarketDetailPage for full market management
- Touch-friendly interface (≥44px touch targets)

---

## Current State Analysis

### Existing Page
**File**: `src/pages/vendor/VendorTrackedMarketsPage.tsx`
**Route**: `/vendor/tracked-markets`

**Current Layout**:
```tsx
// Grid layout (3 columns on desktop)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {trackedMarkets.map(market => (
    <VendorMarketCard key={market.id} market={market} />
  ))}
</div>
```

**Features Present**:
- ✅ Tabs: "Tracked" vs "Applied To"
- ✅ Search functionality
- ✅ Summary stats at bottom
- ✅ Uses VendorMarketCard (vertical cards)

**Missing Features**:
- ❌ Status filter badges (all, interested, applied, approved, etc.)
- ❌ View toggle (list/grid/calendar)
- ❌ Sort dropdown
- ❌ Horizontal list layout
- ❌ Todo preview with checkboxes in cards
- ❌ Mobile-optimized layout

### Related Pages
**VendorMarketDetailPage**: `src/pages/vendor/VendorMarketDetailPage.tsx`
- Route: `/vendor/markets/:id`
- Full management page for ONE market
- Tabs: Overview, Preparation (full todos), Expenses, Analytics, Logistics, Communication
- This is where users go for complete market management

### Available Components

#### 1. VendorMarketCard (Current)
**File**: `src/components/VendorMarketCard.tsx`
- Vertical card design
- Small image (h-32)
- Status badges, progress bar
- Quick stats (todo count, expense total)
- **Issue**: Not suitable for horizontal list layout

#### 2. VendorMarketRow (Best Starting Point)
**File**: `src/components/VendorMarketRow.tsx`
- 3-column grid layout
- Column 1: Market details + image
- Column 2: Todo list preview (max 3 items)
- Column 3: Expenses preview
- ✅ Already uses `useTodos(market.id)`
- ✅ Already uses `useExpenses(market.id)`
- ✅ Interactive todo checkboxes
- **Perfect foundation to build upon!**

---

## Architecture Design

### 1. Component Hierarchy

```
VendorTrackedMarketsPage (Enhanced)
├── Page Header
│   ├── Title & Description
│   └── "Back to Dashboard" Link
│
├── Control Bar (NEW)
│   ├── Status Filter Badges
│   │   ├── Badge: "2 all"
│   │   ├── Badge: "1 interested"
│   │   ├── Badge: "0 applied"
│   │   ├── Badge: "0 approved"
│   │   ├── Badge: "1 attending"
│   │   └── Badge: "0 completed"
│   │
│   └── Right Actions
│       ├── Sort Dropdown (By Date, Name, Status)
│       └── View Toggle (List, Grid, Calendar)
│
├── Markets List Container
│   ├── List View (viewMode === 'list')
│   │   └── VendorTrackedMarketRow[] (NEW component)
│   │       ├── Market Image Section
│   │       ├── Market Info Section
│   │       │   ├── Name + Status Badge
│   │       │   ├── Location + Date
│   │       │   └── Action Buttons
│   │       └── Tasks Preview Section
│   │           ├── Top 3-5 Todos with Checkboxes
│   │           └── Quick Stats (todos, expenses)
│   │
│   ├── Grid View (viewMode === 'grid')
│   │   └── VendorMarketCard[] (existing)
│   │
│   └── Calendar View (viewMode === 'calendar')
│       └── MarketCalendar (existing)
│
└── Summary Stats (existing)
```

### 2. New Component: VendorTrackedMarketRow

**Purpose**: Mobile-first horizontal card for tracked markets list with todo preview

**File**: `src/components/VendorTrackedMarketRow.tsx`

**Props Interface**:
```typescript
interface VendorTrackedMarketRowProps {
  market: Market
  tracking?: TrackingData
  onViewDetails: (marketId: string) => void
  onManage: (marketId: string) => void
  onUntrack: (marketId: string) => void
  onToggleTodo: (todoId: string) => void
  className?: string
}
```

**Layout Strategy**:

**Mobile (< 768px)**: Single column stack
```
┌─────────────────────────────────────┐
│ [Hero Image - Full Width, h-48]    │
├─────────────────────────────────────┤
│ Holiday Craft Fair      [Completed] │
│ 📍 Denver, CO                       │
│ 📅 Dec 15, 2024 · 10:00 AM         │
├─────────────────────────────────────┤
│ Tasks (3/5)                         │
│ ☑ Prepare press kit                │
│ ☐ Create video content              │
│ ☐ Plan equipment transport          │
│ [+ Add Task]                        │
├─────────────────────────────────────┤
│ [View Details] [Manage] [Untrack]  │
│ 5 todos · $250 spent                │
└─────────────────────────────────────┘
```

**Tablet (768px - 1024px)**: 2-column
```
┌──────────────┬──────────────────────┐
│ [Image]      │ Holiday Craft Fair   │
│ h-full       │ 📍 Denver, CO        │
│ w-40%        │ 📅 Dec 15, 2024      │
│              │ [Status Badge]       │
│              │                      │
│              │ Tasks (3/5)          │
│              │ ☑ Prepare press kit  │
│              │ ☐ Create video       │
│              │ ☐ Plan transport     │
│              │                      │
│              │ [Actions] [Stats]    │
└──────────────┴──────────────────────┘
```

**Desktop (≥1024px)**: 3-column
```
┌──────────┬──────────────────┬────────────────┐
│ [Image]  │ Market Info      │ Tasks Panel    │
│ h-full   │ Name + Status    │ ☑ Press kit    │
│ w-30%    │ Location         │ ☐ Video        │
│          │ Date/Time        │ ☐ Transport    │
│          │                  │ ☐ Booth setup  │
│          │ Actions:         │ ☐ Signage      │
│          │ [View Details]   │                │
│          │ [Manage]         │ [+ Add Task]   │
│          │ [Untrack]        │                │
│          │                  │ 5 todos        │
│          │ Quick Stats:     │ $250 spent     │
└──────────┴──────────────────┴────────────────┘
```

**Key Features**:
- Uses `useTodos(market.id)` hook
- Shows top 5 todos (3 on mobile, 5 on desktop)
- Interactive checkboxes call `onToggleTodo`
- Hero image: 200px desktop, 150px tablet, full-width mobile
- Touch targets: 44px minimum height
- Smooth hover states and transitions

---

## 3. Control Bar Component

**Component**: Part of VendorTrackedMarketsPage (inline or extracted)

**Mobile Layout** (< 640px):
```
┌─────────────────────────────────┐
│ Status Filters (wrap):          │
│ [2 all] [1 interested]          │
│ [0 applied] [0 approved]        │
│                                 │
│ [Sort ▼] [List] [Grid] [Cal]   │
└─────────────────────────────────┘
```

**Desktop Layout** (≥640px):
```
┌─────────────────────────────────────────────────┐
│ [2 all][1 interested][0 applied][0 approved]   │
│                         [Sort ▼][List][Grid][Cal]│
└─────────────────────────────────────────────────┘
```

**Features**:
- Status badges show count for each status
- Active badge highlighted with primary color
- View toggle buttons with icons
- Sort dropdown with options: Date, Name, Status, Progress

---

## 4. Data Flow & State Management

### Page State
```typescript
const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list')
const [statusFilter, setStatusFilter] = useState<string>('all')
const [sortBy, setSortBy] = useState<'date' | 'name' | 'status' | 'progress'>('date')
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
const [searchQuery, setSearchQuery] = useState('')
```

### Data Hooks
```typescript
// Get tracked markets with tracking data
const {
  trackedMarkets,
  trackingData,
  getTrackingStatus,
  untrackMarket,
  isLoading
} = useTrackedMarkets()

// Get applications (for tab filtering)
const { myApplications } = useVendorApplications()
```

### Computed Data
```typescript
// Filter by status
const filteredMarkets = useMemo(() => {
  return trackedMarkets.filter(market => {
    const tracking = getTrackingStatus(market.id)
    if (statusFilter === 'all') return true
    return tracking?.status === statusFilter
  })
}, [trackedMarkets, statusFilter, getTrackingStatus])

// Filter by search
const searchedMarkets = useMemo(() => {
  if (!searchQuery) return filteredMarkets
  return filteredMarkets.filter(market =>
    market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  )
}, [filteredMarkets, searchQuery])

// Sort markets
const sortedMarkets = useMemo(() => {
  return [...searchedMarkets].sort((a, b) => {
    const trackingA = getTrackingStatus(a.id)
    const trackingB = getTrackingStatus(b.id)
    
    let comparison = 0
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.schedule[0]?.startDate).getTime() - 
                     new Date(b.schedule[0]?.startDate).getTime()
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'status':
        comparison = (trackingA?.status || '').localeCompare(trackingB?.status || '')
        break
      case 'progress':
        comparison = (trackingA?.todoProgress || 0) - (trackingB?.todoProgress || 0)
        break
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })
}, [searchedMarkets, sortBy, sortDirection, getTrackingStatus])

// Count by status for badges
const statusCounts = useMemo(() => {
  const counts: Record<string, number> = {
    all: trackedMarkets.length,
    interested: 0,
    applied: 0,
    approved: 0,
    attending: 0,
    completed: 0,
  }
  
  trackedMarkets.forEach(market => {
    const status = getTrackingStatus(market.id)?.status
    if (status && status in counts) {
      counts[status]++
    }
  })
  
  return counts
}, [trackedMarkets, getTrackingStatus])
```

---

## 5. Responsive Breakpoints

Using Tailwind CSS breakpoints:

| Breakpoint | Size | Layout Strategy |
|------------|------|-----------------|
| Mobile | < 640px | Single column, image full-width, stack all content |
| SM | 640px - 768px | Single column, image full-width, larger text |
| MD | 768px - 1024px | 2-column (40% image/info, 60% tasks) |
| LG | 1024px - 1280px | 3-column (30% image, 40% info, 30% tasks) |
| XL | ≥ 1280px | 3-column with more padding/spacing |

**Touch Targets**:
- Buttons: min-h-[44px]
- Checkboxes: w-5 h-5 (20px) with p-3 clickable area = 44px
- Badges (filter): min-h-[36px] (acceptable for secondary actions)

---

## 6. Status Badge Design

```typescript
const STATUS_COLORS = {
  interested: 'bg-blue-500 text-white hover:bg-blue-600',
  applied: 'bg-yellow-500 text-white hover:bg-yellow-600',
  approved: 'bg-green-500 text-white hover:bg-green-600',
  attending: 'bg-emerald-500 text-white hover:bg-emerald-600',
  declined: 'bg-orange-500 text-white hover:bg-orange-600',
  cancelled: 'bg-red-500 text-white hover:bg-red-600',
  completed: 'bg-gray-400 text-white hover:bg-gray-500',
  archived: 'bg-slate-400 text-white hover:bg-slate-500',
}

const STATUS_LABELS = {
  interested: 'Interested',
  applied: 'Applied',
  approved: 'Approved',
  attending: 'Attending',
  completed: 'Completed',
}
```

**Filter Badge Display**:
```tsx
<button
  onClick={() => setStatusFilter('interested')}
  className={cn(
    'px-4 py-2 rounded-full text-sm font-medium transition-all',
    statusFilter === 'interested'
      ? STATUS_COLORS.interested
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  )}
>
  {statusCounts.interested} interested
</button>
```

---

## 7. Performance Optimizations

### Lazy Loading
```tsx
// Load MarketCalendar only when needed
const MarketCalendar = lazy(() => 
  import('@/components/MarketCalendar').then(m => ({ default: m.MarketCalendar }))
)
```

### Virtualization (Future Enhancement)
For users with 100+ tracked markets, implement virtual scrolling:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: sortedMarkets.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200, // estimated row height
  overscan: 5
})
```

### Memoization
```tsx
// Memoize expensive renders
const MemoizedVendorTrackedMarketRow = memo(VendorTrackedMarketRow, (prev, next) => {
  return (
    prev.market.id === next.market.id &&
    prev.tracking?.status === next.tracking?.status &&
    prev.tracking?.todoProgress === next.tracking?.todoProgress
  )
})
```

---

## 8. Accessibility Considerations

### Keyboard Navigation
- Filter badges: `role="button"` `tabIndex={0}`
- Todo checkboxes: Native `<input type="checkbox">` (keyboard accessible)
- View toggles: `<button>` elements with aria-labels

### Screen Readers
```tsx
<button aria-label={`Filter by ${status} status, ${count} markets`}>
  {count} {status}
</button>

<input
  type="checkbox"
  aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
  checked={todo.completed}
  onChange={() => onToggleTodo(todo.id)}
/>
```

### Focus Management
- Tab order: Filters → Sort → View Toggle → Market Cards
- Focus visible indicators for all interactive elements
- Skip to content link for screen reader users

---

## 9. Error Handling & Loading States

### Loading State
```tsx
{isLoading ? (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <Card className="h-48 bg-gray-200" />
      </div>
    ))}
  </div>
) : (
  // Render markets
)}
```

### Empty States
```tsx
// No tracked markets
<EmptyState
  icon={<Heart className="w-12 h-12" />}
  title="No tracked markets yet"
  description="Start exploring markets and track ones you're interested in"
  action={<Button onClick={() => navigate('/markets')}>Browse Markets</Button>}
/>

// No markets match filter
<EmptyState
  icon={<Search className="w-12 h-12" />}
  title="No markets found"
  description={`No markets with status "${statusFilter}"`}
  action={<Button onClick={() => setStatusFilter('all')}>Clear Filter</Button>}
/>
```

---

## 10. Mobile UX Enhancements

### Pull to Refresh (Future)
```tsx
const { isRefreshing, handleRefresh } = usePullToRefresh(refetch)
```

### Swipe Actions (Future)
```tsx
// Swipe left on market card to untrack
// Swipe right to view details
```

### Bottom Sheet for Filters (Mobile)
Instead of inline filter badges on mobile, use bottom sheet:
```tsx
<BottomSheet
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  title="Filter Markets"
>
  {/* Filter options */}
</BottomSheet>
```

---

## 11. Integration Points

### Navigation Flow
```
VendorTrackedMarketsPage
  ├─→ [View Details] → VendorMarketDetailPage (Overview tab)
  ├─→ [Manage] → VendorMarketDetailPage (Preparation tab)
  ├─→ [Untrack] → Remove from tracking (with confirmation)
  └─→ [Add Task] → Create todo modal
```

### Deep Links
```typescript
// Support status filter via URL
// /vendor/tracked-markets?status=interested
// /vendor/tracked-markets?status=approved&view=list
```

---

## 12. Testing Strategy

### Unit Tests
- Filter logic correctness
- Sort logic correctness
- Status count calculations
- Empty state rendering

### Integration Tests
- Filter → updates displayed markets
- Sort → reorders markets correctly
- View toggle → switches layouts
- Todo checkbox → updates progress

### E2E Tests
- User can filter markets by status
- User can toggle todo completion
- User can navigate to detail page
- Mobile responsive layout works
- Touch interactions work on mobile

---

## 13. Migration Strategy

### Phase 1: Component Development
1. Create `VendorTrackedMarketRow.tsx`
2. Add tests for new component
3. Create control bar components (filters, sort, view toggle)

### Phase 2: Page Integration
1. Update `VendorTrackedMarketsPage.tsx`
2. Add state management (viewMode, filters, sort)
3. Implement filtering and sorting logic
4. Add control bar to page

### Phase 3: Polish & Testing
1. Test on real devices (iOS, Android)
2. Optimize performance
3. Fix any responsive issues
4. Add loading states and error handling

### Phase 4: Optional Enhancements
1. Virtual scrolling for large lists
2. Pull to refresh
3. Swipe gestures
4. Bottom sheet filters on mobile

---

## 14. File Structure

```
rumfor-market-tracker/
├── src/
│   ├── components/
│   │   ├── VendorTrackedMarketRow.tsx (NEW)
│   │   ├── VendorTrackedMarketRow.test.tsx (NEW)
│   │   ├── VendorMarketCard.tsx (existing - keep for grid view)
│   │   └── VendorMarketRow.tsx (existing - reference)
│   │
│   ├── pages/
│   │   └── vendor/
│   │       ├── VendorTrackedMarketsPage.tsx (UPDATE)
│   │       └── VendorMarketDetailPage.tsx (existing)
│   │
│   └── features/
│       └── markets/
│           └── hooks/
│               └── useMarkets.ts (existing - no changes needed)
```

---

## 15. Code Snippets

### Filter Bar Component
```tsx
interface StatusFilterBarProps {
  statusFilter: string
  statusCounts: Record<string, number>
  onFilterChange: (status: string) => void
}

const StatusFilterBar: FC<StatusFilterBarProps> = ({
  statusFilter,
  statusCounts,
  onFilterChange
}) => {
  const filters = [
    { key: 'all', label: 'all' },
    { key: 'interested', label: 'interested' },
    { key: 'applied', label: 'applied' },
    { key: 'approved', label: 'approved' },
    { key: 'attending', label: 'attending' },
    { key: 'completed', label: 'completed' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <Badge
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={cn(
            'cursor-pointer transition-all',
            statusFilter === filter.key
              ? 'bg-accent text-accent-foreground'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {statusCounts[filter.key]} {filter.label}
        </Badge>
      ))}
    </div>
  )
}
```

### View Toggle Component
```tsx
interface ViewToggleProps {
  viewMode: 'list' | 'grid' | 'calendar'
  onViewChange: (mode: 'list' | 'grid' | 'calendar') => void
}

const ViewToggle: FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex gap-1 border rounded-lg p-1">
      <Button
        variant={viewMode === 'list' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('calendar')}
        aria-label="Calendar view"
      >
        <Calendar className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

---

## 16. Success Criteria

### Functionality
- ✅ Status filters work correctly
- ✅ Sort options reorder markets as expected
- ✅ View toggle switches between list/grid/calendar
- ✅ Todo checkboxes update completion state
- ✅ "View Details" navigates to VendorMarketDetailPage
- ✅ "Untrack" removes market from list

### Performance
- ✅ Page loads in < 2 seconds
- ✅ Filter/sort updates feel instant (< 100ms)
- ✅ Smooth scrolling on mobile devices
- ✅ No layout shift during load

### UX
- ✅ Touch targets ≥44px on mobile
- ✅ Text readable without zooming (min 16px)
- ✅ Clear visual hierarchy
- ✅ Consistent with rest of app design
- ✅ Works on iPhone SE (375px) to desktop (1920px)

### Accessibility
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Focus indicators visible

---

## 17. Future Enhancements

### Phase 2 Features
1. **Bulk Actions**: Select multiple markets, bulk untrack
2. **Custom Sorting**: Drag to reorder markets manually
3. **Quick Add Todo**: Add todo without opening detail page
4. **Progress Rings**: Visual circular progress indicator
5. **Market Groups**: Group by status, date, or custom tags

### Phase 3 Features
1. **Offline Support**: Cache tracked markets for offline viewing
2. **Push Notifications**: Remind about upcoming markets
3. **Smart Suggestions**: "You might want to track..." based on history
4. **Export**: Export tracked markets to PDF/CSV
5. **Collaboration**: Share market list with team members

---

## Conclusion

This redesign transforms the VendorTrackedMarketsPage from a desktop-centric grid to a mobile-first, efficient list interface that prioritizes:
- **Quick scanning**: See market name, status, date, and key tasks at a glance
- **Immediate action**: Toggle todos, view details, or manage without extra taps
- **Efficient use of space**: Dense but not cramped, optimized for phone screens
- **Progressive enhancement**: Works great on mobile, even better on desktop

The architecture leverages existing components (`VendorMarketRow` as inspiration) and hooks (`useTrackedMarkets`, `useTodos`) while adding new features (filters, sort, view toggle) in a maintainable, testable way.

**Ready to implement in Code mode!**
