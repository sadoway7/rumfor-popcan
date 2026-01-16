# Vendor Market Detail Developer Guide

## Overview

This guide provides technical documentation for developers working on the Vendor Market Detail functionality. The feature consists of a comprehensive 6-tab interface for vendors to manage their market participation.

## Architecture Overview

### Component Structure

The Vendor Market Detail page follows a modular architecture with the following key components:

```
VendorMarketDetailPage (Main Container)
├── MarketHeader (Market info & status)
├── TabNavigation (6-tab interface)
├── OverviewTab
│   ├── MarketInformationPanel
│   ├── QuickActionsPanel
│   └── ActivityFeed
├── PreparationTab
│   ├── TodoListComponent
│   ├── TodoTemplatesSelector
│   └── ProgressIndicator
├── ExpensesTab
│   ├── BudgetOverview
│   ├── ExpenseInputForm
│   └── BudgetChart
├── AnalyticsTab
│   ├── PerformanceDashboard
│   ├── MarketComparison
│   └── CustomerInsights
├── LogisticsTab
│   ├── SetupInformation
│   ├── TimelineComponent
│   └── WeatherWidget
└── CommunicationTab
    ├── MessageInbox
    ├── MessageComposer
    └── PromoterDirectory
```

### State Management

The application uses Zustand for global state management with the following stores:

#### Vendor Store (`useVendorStore`)
```typescript
interface VendorStore {
  // Market tracking state
  trackedMarkets: Market[];
  currentMarket: Market | null;

  // Planning state
  todos: Todo[];
  expenses: Expense[];
  budget: Budget;

  // Analytics state
  performance: PerformanceData;
  comparisons: MarketComparison[];
}
```

#### API Layer (`marketsApi.ts`)
Key functions for vendor market detail:
- `getVendorView(marketId)` - Get market data tailored for vendors
- `getVendorAnalytics(marketId)` - Retrieve earnings and performance data
- `getPromoterMessages(marketId, options)` - Fetch communication threads
- `getVendorTodos(marketId, options)` - Get task management data
- `getVendorExpenses(marketId, options)` - Retrieve expense tracking data

### Data Flow

#### Market Selection Flow
1. User selects market from dropdown
2. `useVendorStore.setCurrentMarket()` updates active market
3. API calls fetch market-specific data (todos, expenses, analytics)
4. Components re-render with market-specific data
5. URL updates to reflect selected market (`/vendor/market/:id`)

#### Real-time Updates
- Polling every 30 seconds for message updates
- WebSocket connection for instant notifications (future enhancement)
- Optimistic updates for form submissions

## Component Implementation Patterns

### Tab Navigation Pattern
```typescript
const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'preparation', label: 'Preparation', icon: CheckSquareIcon },
    { id: 'expenses', label: 'Expenses', icon: DollarSignIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChartIcon },
    { id: 'logistics', label: 'Logistics', icon: TruckIcon },
    { id: 'communication', label: 'Communication', icon: MessageSquareIcon }
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      {tabs.map(tab => (
        <Tab key={tab.id} value={tab.id}>
          <tab.icon className="w-4 h-4 mr-2" />
          {tab.label}
        </Tab>
      ))}
    </Tabs>
  );
};
```

### Data Fetching Hook Pattern
```typescript
const useVendorMarketData = (marketId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          marketData,
          todosData,
          expensesData,
          analyticsData
        ] = await Promise.all([
          marketsApi.getVendorView(marketId),
          marketsApi.getVendorTodos(marketId),
          marketsApi.getVendorExpenses(marketId),
          marketsApi.getVendorAnalytics(marketId)
        ]);

        setData({
          market: marketData.market,
          todos: todosData.todos,
          expenses: expensesData.expenses,
          analytics: analyticsData
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (marketId) fetchData();
  }, [marketId]);

  return { data, loading, error };
};
```

### Form Validation Pattern
```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  category: z.enum(['booth-fee', 'supplies', 'transportation']),
  amount: z.number().positive('Amount must be positive'),
  date: z.date().max(new Date(), 'Future dates not allowed'),
  description: z.string().max(500, 'Description too long').optional()
});

const ExpenseForm = ({ onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'supplies',
      date: new Date()
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Expense'}
        </Button>
      </form>
    </Form>
  );
};
```

## Testing Strategies

### Unit Testing Components
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseForm } from './ExpenseForm';

describe('ExpenseForm', () => {
  it('validates required fields', async () => {
    render(<ExpenseForm onSubmit={jest.fn()} />);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  it('submits valid expense data', async () => {
    const mockSubmit = jest.fn();
    render(<ExpenseForm onSubmit={mockSubmit} />);

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Expense' }
    });
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50' }
    });

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Test Expense',
        amount: 50,
        category: 'supplies'
      });
    });
  });
});
```

### API Testing
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { marketsApi } from './marketsApi';

const server = setupServer(
  rest.get('/api/markets/:id/vendor-analytics', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        expenses: { total: 450 },
        revenue: { total: 800 },
        profit: 350
      }
    }));
  })
);

describe('marketsApi', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('fetches vendor analytics successfully', async () => {
    const result = await marketsApi.getVendorAnalytics('market-123');

    expect(result.success).toBe(true);
    expect(result.data.profit).toBe(350);
  });
});
```

### Integration Testing
```typescript
describe('Vendor Market Detail Flow', () => {
  it('loads market data and displays tabs', async () => {
    // Mock API responses
    server.use(
      rest.get('/api/markets/123/vendor-view', (req, res, ctx) => {
        return res(ctx.json({
          success: true,
          data: { market: mockMarket }
        }));
      })
    );

    render(
      <BrowserRouter>
        <VendorMarketDetailPage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    // Verify all tabs are present
    expect(screen.getByText('Preparation')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Logistics')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
  });
});
```

## Performance Optimizations

### Component Optimization
- Use `React.memo()` for expensive re-renders
- Implement virtual scrolling for long lists
- Lazy load tab content with `React.lazy()`

### API Optimization
- Implement caching with React Query
- Use pagination for large datasets
- Batch API calls where possible
- Cancel outdated requests

### Memory Management
- Clean up event listeners on unmount
- Use `useCallback` for stable function references
- Avoid memory leaks in subscriptions

## Common Patterns & Best Practices

### Error Handling
```typescript
const Component = () => {
  const { data, error, isLoading } = useQuery(['vendor-data', marketId], fetchVendorData);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} retry={() => refetch()} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
};
```

### Loading States
```typescript
const TabContent = ({ isLoading, data, error }) => {
  if (isLoading) {
    return (
      <Card className="p-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
      </Card>
    );
  }

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return <DataComponent data={data} />;
};
```

### Accessibility Best Practices
- Use semantic HTML elements
- Provide ARIA labels for complex interactions
- Ensure keyboard navigation support
- Maintain sufficient color contrast
- Test with screen readers

## Troubleshooting

### Common Development Issues

#### State Not Updating
- Check if Zustand store is properly initialized
- Verify component is subscribed to store changes
- Use React DevTools to inspect state tree

#### API Requests Failing
- Verify authentication headers are present
- Check rate limiting status
- Examine network tab for detailed error messages

#### Performance Issues
- Use React Profiler to identify bottlenecks
- Implement pagination for large lists
- Memoize expensive computations

#### Testing Failures
- Update snapshots after UI changes
- Mock API responses consistently
- Use proper async/await patterns

## Deployment Checklist

- [ ] Run comprehensive test suite
- [ ] Build production bundles
- [ ] Test in staging environment
- [ ] Verify API endpoints are deployed
- [ ] Check database migrations
- [ ] Update feature flags if needed
- [ ] Monitor error rates after deployment

## Support

For technical questions or issues:
- **Internal Documentation**: Check codebase README and inline comments
- **Team Chat**: Ask in #frontend or #backend channels
- **Code Reviews**: Request review from experienced team members
- **Architecture Decisions**: Refer to ADRs in `/docs/architecture/`