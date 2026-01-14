# RumFor Market Tracker - System Architecture Map

## Table of Contents
1. [Technical Stack Overview](#technical-stack-overview)
2. [System Communication Map](#system-communication-map)
3. [Component and Function Inventory](#component-and-function-inventory)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Real vs Fake Implementation Status](#real-vs-fake-implementation-status)
6. [Strategic Recommendations](#strategic-recommendations)

---

## Technical Stack Overview

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool |
| UnoCSS/Tailwind CSS | Latest | Styling |
| Zustand | 4.x | State Management |
| TanStack Query | 5.x | Data Fetching (available) |
| React Router | 6.x | Routing |
| React Hook Form | 7.x | Form Handling |
| Zod | 3.x | Schema Validation |
| Radix UI | 1.x | UI Components |
| Lucide React | 0.x | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.x | API Framework |
| MongoDB | 7.x | Database |
| Mongoose | 8.x | ODM |
| JWT | - | Authentication |
| bcrypt | - | Password Hashing |
| express-rate-limit | - | Rate Limiting |
| csurf | - | CSRF Protection |

### Build & Configuration
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Testing**: Playwright (e2e-tests directory)

---

## System Communication Map

### File Import Hierarchy

```
src/
├── main.tsx (entry point)
├── App.tsx (root component)
├── router/
│   └── routes.tsx (route definitions)
├── lib/
│   └── httpClient.ts (API client with interceptors)
├── features/
│   ├── auth/
│   │   ├── authStore.ts (Zustand store)
│   │   ├── authApi.ts (API functions)
│   │   └── hooks/useAuth.ts
│   ├── markets/
│   │   ├── marketsStore.ts
│   │   ├── marketsApi.ts
│   │   └── hooks/useMarkets.ts
│   ├── admin/
│   │   ├── adminStore.ts
│   │   └── adminApi.ts
│   ├── applications/
│   │   ├── applicationsStore.ts
│   │   └── applicationsApi.ts
│   ├── tracking/
│   │   ├── trackingStore.ts
│   │   └── hooks/useExpenses.ts
│   ├── notifications/
│   │   ├── notificationsStore.ts
│   │   └── notificationsApi.ts
│   └── community/
│       └── communityStore.ts
├── components/
│   └── ui/ (reusable UI components)
├── layouts/
│   ├── MainLayout.tsx
│   ├── AuthLayout.tsx
│   ├── AdminLayout.tsx
│   ├── DashboardLayout.tsx
│   └── PromoterLayout.tsx
└── pages/
    ├── HomePage.tsx
    ├── auth/
    ├── markets/
    ├── admin/
    ├── promoter/
    ├── vendor/
    └── applications/
```

### API Routes to Frontend Endpoints Mapping

| Backend Route | Frontend API Module | Purpose |
|---------------|---------------------|---------|
| `/api/auth/*` | `features/auth/authApi.ts` | Authentication, JWT tokens, user management |
| `/api/markets/*` | `features/markets/marketsApi.ts` | Markets CRUD, search, tracking |
| `/api/admin/*` | `features/admin/adminApi.ts` | Admin operations, user moderation, statistics |
| `/api/applications/*` | `features/applications/applicationsApi.ts` | Vendor applications, status updates |
| `/api/comments/*` | `features/community/commentsApi.ts` | Market comments and reactions |
| `/api/photos/*` | `features/community/photosApi.ts` | Photo uploads and management |
| `/api/hashtags/*` | `features/community/hashtagsApi.ts` | Community hashtags and voting |
| `/api/todos/*` | `features/tracking/todosApi.ts` | Vendor task management |
| `/api/expenses/*` | `features/tracking/expensesApi.ts` | Expense tracking and reporting |
| `/api/notifications/*` | `features/notifications/notificationsApi.ts` | Push notifications and preferences |
| `/api/users/*` | `features/users/usersApi.ts` | User profiles and relationships |

### Component Parent-Child Relationships

```
App.tsx
├── Router (routes.tsx)
├── Routes
│   ├── Public Routes
│   │   ├── HomePage
│   │   ├── LoginPage / RegisterPage
│   │   ├── MarketSearchPage
│   │   └── MarketDetailPage
│   ├── Protected Routes (by role)
│   │   ├── Admin Routes → AdminLayout
│   │   │   ├── AdminDashboardPage
│   │   │   ├── AdminUsersPage
│   │   │   ├── AdminMarketsPage
│   │   │   └── ...
│   │   ├── Promoter Routes → PromoterLayout
│   │   │   ├── PromoterDashboardPage
│   │   │   ├── PromoterMarketsPage
│   │   │   └── ...
│   │   └── Vendor Routes → DashboardLayout
│   │       ├── VendorDashboardPage
│   │       └── ...
│   └── Auth Routes → AuthLayout
```

### Data Flow Paths

1. **Auth Flow**: `useAuthStore` → `authApi` → Backend → Store updates
2. **Market List Flow**: `useMarkets` hook → `marketsApi` → State → Components
3. **Admin Operations**: `useAdminStore` → `adminApi` → Backend → UI updates
4. **Form Submissions**: React Hook Form → Zod validation → API → Store

---

## Component and Function Inventory

### Features Overview

#### 1. Authentication (`features/auth/`)
| Component/Function | Purpose | Status |
|-------------------|---------|--------|
| `authStore.ts` | Zustand store for auth state | ✅ Complete |
| `authApi.ts` | API functions (login, register, etc.) | ✅ Complete |
| `LoginPage.tsx` | User login | ✅ UI Complete |
| `RegisterPage.tsx` | User registration | ✅ UI Complete |
| `EmailVerificationPage.tsx` | Email verification | ✅ UI Complete |
| `PasswordRecoveryPage.tsx` | Password reset | ✅ UI Complete |

#### 2. Markets (`features/markets/`)
| Component/Function | Purpose | Status |
|-------------------|---------|--------|
| `marketsStore.ts` | Zustand store for markets | ✅ Fixed |
| `marketsApi.ts` | API functions for markets | ✅ Complete |
| `useMarkets.ts` | React hook for market data | ✅ Complete |
| `useMarket.ts` | Hook for single market | ✅ Complete |
| `useTrackedMarkets.ts` | Hook for tracked markets | ✅ Complete |
| `MarketSearchPage.tsx` | Market search/filter | ✅ UI Complete |
| `MarketDetailPage.tsx` | Market details view | ✅ UI Complete |

#### 3. Admin (`features/admin/`)
| Component/Function | Purpose | Status |
|-------------------|---------|--------|
| `adminStore.ts` | Zustand store for admin | ✅ Complete |
| `adminApi.ts` | Admin API functions | ✅ Complete |
| `AdminDashboardPage.tsx` | Admin dashboard | ✅ UI Complete |
| `AdminUsersPage.tsx` | User management | ✅ UI Complete |
| `AdminMarketsPage.tsx` | Market management | ✅ UI Complete |
| `AdminModerationPage.tsx` | Content moderation | ✅ UI Complete |
| `AdminAnalyticsPage.tsx` | Analytics view | ✅ UI Complete |

#### 4. Applications (`features/applications/`)
| Component/Function | Purpose | Status |
|-------------------|---------|--------|
| `applicationsStore.ts` | Zustand store | ✅ Complete |
| `applicationsApi.ts` | API functions | ✅ Complete |
| `ApplicationFormPage.tsx` | Submit application | ✅ UI Complete |
| `ApplicationDetailPage.tsx` | View application | ✅ UI Complete |
| `MyApplicationsPage.tsx` | User's applications | ✅ UI Complete |

#### 5. Tracking (`features/tracking/`)
| Component/Function | Purpose | Status |
|-------------------|---------|--------|
| `trackingStore.ts` | Zustand store | ✅ Complete |
| `useExpenses.ts` | Expense tracking hook | ✅ Complete |
| `useTodos.ts` | Todo tracking hook | ✅ Complete |

#### 6. Notifications (`features/notifications/`)
| Component/Function | Purpose | Status |
|-------------------|---------|--------|
| `notificationsStore.ts` | Zustand store | ✅ Complete |
| `notificationsApi.ts` | API functions | ✅ Complete |

### API Functions Inventory

#### authApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `login(credentials)` | `/api/auth/login` | POST |
| `register(data)` | `/api/auth/register` | POST |
| `logout()` | `/api/auth/logout` | POST |
| `forgotPassword(email)` | `/api/auth/forgot-password` | POST |
| `resetPassword(token, password)` | `/api/auth/reset-password` | POST |
| `verifyEmail(token)` | `/api/auth/verify-email` | POST |
| `resendVerification(email)` | `/api/auth/resend-verification` | POST |
| `refreshToken(token)` | `/api/auth/refresh-token` | POST |

#### marketsApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `getMarkets(filters, page, limit)` | `/api/markets` | GET |
| `getMarketById(id)` | `/api/markets/:id` | GET |
| `searchMarkets(query)` | `/api/markets/search` | GET |
| `createMarket(data)` | `/api/markets` | POST |
| `trackMarket(id)` | `/api/markets/:id/track` | POST |
| `untrackMarket(id)` | `/api/markets/:id/track` | DELETE |
| `getUserTrackedMarkets(userId)` | `/api/users/:id/tracked-markets` | GET |

#### adminApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `getAdminStats()` | `/api/admin/stats` | GET |
| `getUsers(filters)` | `/api/admin/users` | GET |
| `updateUserRole(id, role)` | `/api/admin/users/:id/role` | PUT |
| `suspendUser(id, suspended)` | `/api/admin/users/:id/suspend` | PUT |
| `getModerationQueue(filters)` | `/api/admin/moderation` | GET |
| `moderateContent(id, action, reason)` | `/api/admin/moderation/:id` | PUT |
| `getPromoterVerifications()` | `/api/admin/verifications` | GET |
| `reviewVerification(id, status, notes)` | `/api/admin/verifications/:id` | PUT |

#### commentsApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `getComments(marketId, options)` | `/api/comments/market/:marketId` | GET |
| `createComment(data)` | `/api/comments` | POST |
| `updateComment(id, content)` | `/api/comments/:id` | PATCH |
| `deleteComment(id)` | `/api/comments/:id` | DELETE |
| `addReaction(id, reactionType, action)` | `/api/comments/:id/reaction` | POST |
| `reportComment(id, reason)` | `/api/comments/:id/report` | POST |

#### photosApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `getPhotos(marketId, options)` | `/api/photos/market/:marketId` | GET |
| `uploadPhoto(marketId, file, caption)` | `/api/photos/market/:marketId` | POST |
| `voteOnPhoto(id, vote)` | `/api/photos/:id/vote` | POST |
| `deletePhoto(id)` | `/api/photos/:id` | DELETE |
| `reportPhoto(id, reason)` | `/api/photos/:id/report` | POST |
| `getHeroPhoto(marketId)` | `/api/photos/market/:marketId/hero` | GET |

#### todosApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `getTodos(filters, pagination)` | `/api/todos` | GET |
| `createTodo(todoData)` | `/api/todos` | POST |
| `updateTodo(id, updates)` | `/api/todos/:id` | PATCH |
| `deleteTodo(id)` | `/api/todos/:id` | DELETE |
| `markComplete(id, completed)` | `/api/todos/:id/complete` | PATCH |
| `getTemplates(marketType)` | `/api/todos/templates/:marketType` | GET |

#### expensesApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `getExpenses(filters, pagination)` | `/api/expenses` | GET |
| `createExpense(expenseData)` | `/api/expenses` | POST |
| `updateExpense(id, updates)` | `/api/expenses/:id` | PATCH |
| `deleteExpense(id)` | `/api/expenses/:id` | DELETE |
| `getCategories()` | `/api/expenses/categories` | GET |

#### notificationsApi.ts
| Function | Endpoint | Method |
|----------|----------|--------|
| `getNotifications(options)` | `/api/notifications` | GET |
| `markAsRead(notificationIds)` | `/api/notifications/read` | PATCH |
| `markAllAsRead()` | `/api/notifications/read-all` | PATCH |
| `deleteNotification(id)` | `/api/notifications/:id` | DELETE |
| `deleteNotifications(notificationIds)` | `/api/notifications` | DELETE |
| `updatePreferences(preferences)` | `/api/notifications/preferences` | PATCH |
| `getCount(options)` | `/api/notifications/count` | GET |

### Stores with State Management

| Store | Location | Purpose | Persistence |
|-------|----------|---------|-------------|
| `useAuthStore` | `features/auth/` | Auth state (user, token) | localStorage |
| `useMarketsStore` | `features/markets/` | Markets list, filters | Session |
| `useAdminStore` | `features/admin/` | Admin dashboard data | Session |
| `useApplicationsStore` | `features/applications/` | Applications state | Session |
| `useTrackingStore` | `features/tracking/` | Expense/todo tracking | Session |
| `useNotificationsStore` | `features/notifications/` | Notifications | Session |
| `useThemeStore` | `features/theme/` | Theme preference | localStorage |
| `useCommunityStore` | `features/community/` | Community features | Session |

---

## Data Flow Diagrams

### User Journey: Login Flow

```
1. User enters credentials on LoginPage.tsx
   ↓
2. React Hook Form validates with Zod schema
   ↓
3. useAuthStore.login() called
   ↓
4. authApi.login() sends POST to /api/auth/login
   ↓
5. Backend validates and returns JWT token + user
   ↓
6. Store updates: user, token, isAuthenticated
   ↓
7. localStorage persists auth state
   ↓
8. Router redirects to dashboard
```

### User Journey: Create Market (Promoter)

```
1. Promoter navigates to PromoterCreateMarketPage.tsx
   ↓
2. Fills form with React Hook Form + Zod validation
   ↓
3. marketsApi.createMarket() called
   ↓
4. Backend creates market, returns created market
   ↓
5. useMarketsStore updates markets list
   ↓
6. UI shows success, redirects to market list
```

### User Journey: Add Expense (Vendor)

```
1. Vendor opens expense form on VendorDashboardPage.tsx
   ↓
2. Enters expense data (amount, category, description)
   ↓
3. trackingApi.createExpense() called
   ↓
4. Backend saves expense
   ↓
5. useTrackingStore updates expenses list
   ↓
6. ExpenseChart and ExpenseSummary update
```

### Data Movement: Admin Moderation

```
1. Admin opens AdminModerationPage.tsx
   ↓
2. useAdminStore.fetchModerationQueue() called
   ↓
3. adminApi.getModerationQueue() fetches pending items
   ↓
4. Admin reviews and takes action (approve/reject)
   ↓
5. adminApi.moderateContent() updates item
   ↓
6. Store updates, UI reflects change
```

---

## Real vs Fake Implementation Status

### Backend Endpoints

| Endpoint | Mock Data | Real API | Notes |
|----------|-----------|----------|-------|
| `/api/auth/*` | ✅ Yes | ✅ Complete | JWT auth, registration, password reset, 2FA ready |
| `/api/markets/*` | ✅ Yes | ✅ Complete | Full CRUD with geospatial search and tracking |
| `/api/admin/*` | ✅ Yes | ✅ Complete | User management, moderation, statistics, bulk operations |
| `/api/applications/*` | ✅ Yes | ✅ Complete | Application workflow with status history and reviews |
| `/api/comments/*` | ✅ Yes | ✅ Complete | Threaded comments with reactions and moderation |
| `/api/photos/*` | ✅ Yes | ✅ Complete | Upload, voting, moderation, hero images |
| `/api/hashtags/*` | ✅ Yes | ✅ Complete | Community hashtags with voting system |
| `/api/todos/*` | ✅ Yes | ✅ Complete | Task management with templates and priorities |
| `/api/expenses/*` | ✅ Yes | ✅ Complete | Expense tracking with categories and receipts |
| `/api/notifications/*` | ✅ Yes | ✅ Complete | Real-time notifications with preferences |
| `/api/users/*` | ✅ Yes | ✅ Complete | Profile management and relationships |

### Frontend Features

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Complete | Login, register, password reset |
| Market Search | ✅ Complete | Filtering, pagination |
| Market Details | ✅ Complete | Full market info view |
| User Tracking | ✅ Complete | Track/untrack markets |
| Admin Dashboard | ✅ Complete | Stats, user management |
| Admin Moderation | ✅ Complete | Queue, approve/reject |
| Promoter Management | ✅ Complete | Create markets, manage vendors |
| Vendor Tracking | ✅ Complete | Expenses, todos |
| Applications | ✅ Complete | Submit, review, status |
| Notifications | ✅ Complete | Bell, list, mark read |
| Theme Switching | ✅ Complete | Light/dark mode |
| Responsive Design | ✅ Complete | Mobile-friendly UI |

### Features with Mock Data (Not Connected to Real Backend)

| Feature | Mock Data | API Connection |
|---------|-----------|----------------|
| Admin Analytics Charts | Mock data | Needs real metrics API |
| User Growth Charts | Mock data | Needs analytics backend |
| Popular Markets | Mock data | Needs trending algorithm |
| Real-time Updates | Not implemented | Needs WebSocket |

---

## Strategic Recommendations

### Consolidation Opportunities

1. **Unified API Client**
   - Current: Each feature has its own API file with similar HTTP logic
   - Recommendation: Consolidate into single `httpClient.ts` with interceptors
   - Benefit: Consistent error handling, auth token management

2. **TanStack Query Integration**
   - Current: Zustand for state, custom hooks for API calls
   - Recommendation: Use TanStack Query for server state, Zustand for client state
   - Benefit: Caching, refetching, optimistic updates out of box

3. **Component Library**
   - Current: Custom UI components in `components/ui/`
   - Recommendation: Consider Radix UI primitives with UnoCSS styling
   - Benefit: Accessibility, consistent API

### Priority Improvements

1. **High Priority**
   - Connect real backend endpoints (currently mock data)
   - Implement proper error handling with toast notifications
   - Add loading states and skeletons for better UX

2. **Medium Priority**
   - Add unit tests for stores and hooks
   - Implement proper pagination on all list views
   - Add infinite scroll for markets list

3. **Low Priority**
   - WebSocket integration for real-time updates
   - Internationalization (i18n) support
   - Performance optimization with memoization

### Technical Debt Items

| Item | Description | Effort |
|------|-------------|--------|
| Remove unused imports | Some files have unused imports | Low |
| Standardize error handling | Different error patterns across features | Medium |
| Add TypeScript strict mode | Enable strict type checking | Medium |
| Update deprecated packages | Check for outdated dependencies | Low |
| Document API responses | Add JSDoc comments to API functions | Low |

### Backend Integration Checklist

- [ ] Connect MongoDB with proper schemas
- [ ] Implement JWT authentication middleware
- [ ] Add rate limiting configuration
- [ ] Set up CSRF protection
- [ ] Implement proper error responses
- [ ] Add validation middleware
- [ ] Set up logging and monitoring
- [ ] Configure CORS properly
- [ ] Implement WebSocket for real-time features
- [ ] Add database indexes for performance

---

## File Structure Reference

```
rumfor-market-tracker/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── features/           # Feature-based modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── markets/       # Markets
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── applications/  # Applications
│   │   │   ├── tracking/      # Expense tracking
│   │   │   ├── notifications/ # Notifications
│   │   │   ├── community/     # Community features
│   │   │   └── theme/         # Theme management
│   │   ├── components/        # Reusable components
│   │   │   └── ui/           # UI primitives
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Route components
│   │   ├── router/           # Routing config
│   │   ├── lib/              # Utilities
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   └── ...
├── backend/                    # Express backend
│   ├── src/
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, validation
│   │   └── utils/            # Helpers
│   └── ...
└── e2e-tests/                 # Playwright tests
```

---

## Conclusion

The RumFor Market Tracker is a well-structured React application with:
- ✅ Clean feature-based architecture
- ✅ Proper state management with Zustand
- ✅ Type-safe TypeScript implementation
- ✅ Responsive UI with UnoCSS/Tailwind
- ✅ Modular component design

**Key Next Steps:**
1. Connect real backend endpoints
2. Implement proper database integration
3. Add comprehensive error handling
4. Set up monitoring and logging
5. Implement WebSocket for real-time features

---

*Last Updated: January 2024*
*Document Version: 1.0*
