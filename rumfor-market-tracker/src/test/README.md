# 🧪 Testing Guide for rumfor-market-tracker

## Quick Start

```bash
# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Writing Tests

### Basic Test
```tsx
import { describe, it, expect } from 'vitest'

describe('Feature Name', () => {
  it('should do something', () => {
    expect(2 + 2).toBe(4)
  })
})
```

### React Component Test
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
```

### Test with React Query
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('Data Fetching', () => {
  it('fetches and displays data', async () => {
    render(<div data-testid="test">Hello</div>, { wrapper })
    expect(screen.getByTestId('test')).toHaveTextContent('Hello')
  })
})
```

## Test File Naming

- `*.test.ts` or `*.test.tsx`
- `*.spec.ts` or `*.spec.tsx`
- Put in same folder as source file or `src/test/`

## Available Assertions

```tsx
expect(value).toBe(expected)           // Exact match
expect(value).toEqual(expected)        // Deep equality
expect(value).toBeTruthy()             // truthy
expect(value).toBeFalsy()             // falsy
expect(value).toContain(item)         // Array/string contains
expect(value).toHaveLength(n)        // Array length
expect(element).toBeInTheDocument()  // Element exists
expect(element).toHaveTextContent()  // Element text
expect(fn).toHaveBeenCalled()        // Function called
```

## Best Practices

1. **Keep tests simple** - one thing per test
2. **Use descriptive names** - "should show error when..."
3. **Test behavior**, not implementation
4. **Use data-testid** for complex components
5. **Mock external calls** - use MSW or vi.fn()

## Coverage

Run `npm run test:coverage` to see:
- % of code covered
- Which files need tests
- Line-by-line coverage

## CI Integration

Tests run automatically in CI:
```bash
npm run test:ci  # Outputs JSON for CI systems
```
