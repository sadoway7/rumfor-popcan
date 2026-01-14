# React Components Props & Usage Documentation

## Overview

This document provides comprehensive documentation for Rumfor Market Tracker React components, including their props, usage patterns, and examples.

## Core Components

### MarketGrid

A flexible grid component for displaying markets in various layouts.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `markets` | `Market[]` | - | **Required.** Array of market objects to display |
| `isLoading` | `boolean` | `false` | Whether data is currently loading |
| `isSearching` | `boolean` | `false` | Whether a search operation is in progress |
| `error` | `string \| null` | `null` | Error message to display if loading failed |
| `onTrack` | `(marketId: string) => void` | - | Callback when user tracks a market |
| `onUntrack` | `(marketId: string) => void` | - | Callback when user untracks a market |
| `trackedMarketIds` | `string[]` | `[]` | Array of market IDs the user has tracked |
| `isTracking` | `boolean` | `false` | Whether a tracking operation is in progress |
| `variant` | `'grid' \| 'list' \| 'compact' \| 'minimal'` | `'grid'` | Layout variant |
| `className` | `string` | - | Additional CSS classes |
| `emptyStateProps` | `object` | - | Customization for empty state |

#### Variants

- **`grid`** (default): Responsive grid with 1-4 columns
- **`list`**: Single column list with featured cards
- **`compact`**: Smaller grid with tighter spacing
- **`minimal`**: Simplified layout for dashboards

#### Usage Examples

```tsx
// Basic grid
<MarketGrid markets={markets} />

// With tracking functionality
<MarketGrid
  markets={markets}
  onTrack={handleTrack}
  onUntrack={handleUntrack}
  trackedMarketIds={trackedIds}
  isTracking={isLoading}
/>

// Custom empty state
<MarketGrid
  markets={[]}
  emptyStateProps={{
    title: "No markets nearby",
    description: "Try expanding your search radius",
    action: <Button>Change Location</Button>
  }}
/>

// Compact variant for sidebar
<CompactMarketGrid markets={markets} />
```

#### Variants Exports

```tsx
import {
  MarketGrid,        // Main component
  CompactMarketGrid, // Pre-configured compact variant
  MarketList        // Pre-configured list variant
} from '@/components/MarketGrid'
```

### ApplicationForm

Form component for vendor market applications.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `marketId` | `string` | - | **Required.** ID of the market being applied to |
| `market` | `Market` | - | Market object for display |
| `onSubmit` | `(data: ApplicationData) => Promise<void>` | - | **Required.** Submit handler |
| `onSaveDraft` | `(data: ApplicationData) => Promise<void>` | - | Save draft handler |
| `initialData` | `ApplicationData` | - | Pre-populated form data |
| `isSubmitting` | `boolean` | `false` | Whether form is submitting |
| `isSavingDraft` | `boolean` | `false` | Whether draft is saving |
| `errors` | `Record<string, string>` | `{}` | Field-level error messages |
| `className` | `string` | - | Additional CSS classes |

#### ApplicationData Structure

```typescript
interface ApplicationData {
  businessInfo: {
    businessName: string
    businessType: 'individual' | 'partnership' | 'llc' | 'corporation'
    description: string
    yearsInBusiness?: number
    website?: string
    phone: string
    email: string
  }
  products: Array<{
    name: string
    category: string
    description?: string
    priceRange?: { min: number; max: number }
    isLocal?: boolean
    isOrganic?: boolean
    certifications?: string[]
  }>
  boothRequirements: {
    spaceNeeded: 'small' | 'medium' | 'large' | 'extra-large'
    electricity?: boolean
    water?: boolean
    tent?: boolean
    tables?: number
    chairs?: number
    specialRequirements?: string
  }
  insurance: {
    generalLiability?: {
      hasInsurance: boolean
      coverage?: number
      provider?: string
      policyNumber?: string
      expirationDate?: string
    }
    foodHandlersPermit?: {
      hasPermit: boolean
      permitNumber?: string
      expirationDate?: string
    }
    businessLicense?: {
      hasLicense: boolean
      licenseNumber?: string
      expirationDate?: string
    }
  }
  documents: Array<{
    type: string
    file: File
    url?: string
  }>
  marketing?: {
    socialMediaLinks?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
    marketingMaterials?: string
    previousMarkets?: string[]
    awards?: string[]
  }
}
```

#### Usage Examples

```tsx
import { ApplicationForm } from '@/components/ApplicationForm'

<ApplicationForm
  marketId="market123"
  market={selectedMarket}
  onSubmit={handleSubmit}
  onSaveDraft={handleSaveDraft}
  isSubmitting={isSubmitting}
  errors={formErrors}
/>
```

### CommentList

Displays comments for a market with threading support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `marketId` | `string` | - | **Required.** ID of the market |
| `comments` | `Comment[]` | - | **Required.** Array of comment threads |
| `isLoading` | `boolean` | `false` | Whether comments are loading |
| `onAddComment` | `(content: string, parentId?: string) => Promise<void>` | - | Add comment handler |
| `onUpdateComment` | `(commentId: string, content: string) => Promise<void>` | - | Update comment handler |
| `onDeleteComment` | `(commentId: string) => Promise<void>` | - | Delete comment handler |
| `onReaction` | `(commentId: string, type: string, action: 'add'|'remove') => Promise<void>` | - | Reaction handler |
| `currentUserId` | `string` | - | Current user ID for permissions |
| `canModerate` | `boolean` | `false` | Whether user can moderate |
| `maxDepth` | `number` | `3` | Maximum reply depth |
| `className` | `string` | - | Additional CSS classes |

#### Usage Examples

```tsx
<CommentList
  marketId={marketId}
  comments={comments}
  onAddComment={handleAddComment}
  onReaction={handleReaction}
  currentUserId={user?.id}
  canModerate={user?.role === 'admin'}
/>
```

## UI Components

### Button

Accessible button component with multiple variants.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `disabled` | `boolean` | `false` | Disables the button |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `children` | `ReactNode` | - | Button content |
| `onClick` | `(e: MouseEvent) => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `className` | `string` | - | Additional CSS classes |

#### Variants

- **`primary`**: Main call-to-action, blue background
- **`secondary`**: Less prominent, gray background
- **`outline`**: Bordered, transparent background
- **`ghost`**: Minimal, text-only with hover effects
- **`danger`**: Red variant for destructive actions

#### Usage Examples

```tsx
<Button variant="primary" size="lg" onClick={handleSubmit} loading={isLoading}>
  Submit Application
</Button>

<Button variant="outline" onClick={handleCancel}>
  Cancel
</Button>
```

### Card

Container component with header, content, and footer sections.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | **Required.** Card content |
| `className` | `string` | - | Additional CSS classes |
| `hover` | `boolean` | `false` | Adds hover effect |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Content padding |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Box shadow |

#### Sub-components

- `CardHeader`: Top section, typically for title and actions
- `CardContent`: Main content area
- `CardFooter`: Bottom section, typically for actions

#### Usage Examples

```tsx
<Card hover className="mb-4">
  <CardHeader>
    <h3 className="text-lg font-semibold">Market Details</h3>
  </CardHeader>
  <CardContent>
    <p>Description of the market goes here...</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">View Details</Button>
    <Button>Apply Now</Button>
  </CardFooter>
</Card>
```

### Modal

Overlay dialog component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | **Required.** Controls modal visibility |
| `onClose` | `() => void` | - | **Required.** Close handler |
| `title` | `string` | - | Modal title |
| `description` | `string` | - | Modal description |
| `children` | `ReactNode` | - | **Required.** Modal content |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal size |
| `closeOnOverlay` | `boolean` | `true` | Close when clicking overlay |
| `closeOnEscape` | `boolean` | `true` | Close on escape key |
| `showClose` | `boolean` | `true` | Show close button |

#### Usage Examples

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Apply to Market"
  size="lg"
>
  <ApplicationForm
    marketId={selectedMarketId}
    onSubmit={handleSubmit}
  />
</Modal>
```

### Form Components

#### TextInput

Text input with validation support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | **Required.** Field name |
| `label` | `string` | - | Field label |
| `value` | `string` | - | Controlled value |
| `defaultValue` | `string` | - | Uncontrolled default value |
| `placeholder` | `string` | - | Placeholder text |
| `type` | `string` | `'text'` | Input type |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `className` | `string` | - | Additional CSS classes |

#### Select

Select dropdown with options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | **Required.** Field name |
| `label` | `string` | - | Field label |
| `value` | `string` | - | Selected value |
| `options` | `Array<{value: string, label: string}>` | - | **Required.** Select options |
| `placeholder` | `string` | - | Placeholder text |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `string` | - | Error message |
| `multiple` | `boolean` | `false` | Multi-select |

## Layout Components

### DashboardLayout

Main layout for authenticated pages.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | **Required.** Page content |
| `title` | `string` | - | Page title |
| `subtitle` | `string` | - | Page subtitle |
| `actions` | `ReactNode` | - | Header actions |
| `sidebar` | `ReactNode` | - | Custom sidebar content |
| `fullscreen` | `boolean` | `false` | Hide sidebar for fullscreen |

### PromoterLayout

Layout for promoter-specific pages.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | **Required.** Page content |
| `marketId` | `string` | - | Current market context |
| `activeTab` | `string` | - | Active navigation tab |
| `showMarketInfo` | `boolean` | `true` | Show market context header |

## Advanced Usage Patterns

### Controlled Components

```tsx
const [formData, setFormData] = useState(initialData)

return (
  <ApplicationForm
    marketId="market123"
    initialData={formData}
    onSubmit={async (data) => {
      setFormData(data)
      await submitApplication(data)
    }}
  />
)
```

### Form Validation

```tsx
const schema = z.object({
  email: z.string().email('Invalid email'),
  businessName: z.string().min(2, 'Business name too short')
})

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        {...register('email')}
        label="Email"
        error={errors.email?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Loading States

```tsx
const { data, isLoading } = useMarkets()

if (isLoading) {
  return <Spinner />
}

return <MarketGrid markets={data || []} />
```

### Error Boundaries

```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <EmptyState title="Something went wrong" />
    }

    return this.props.children
  }
}
```

---

*This documentation is automatically kept in sync with component implementations.*