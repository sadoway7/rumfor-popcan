# 📋 MASTER FILE SPECIFICATION - Complete Dependency Map

## 🏗️ **FILE ARCHITECTURE OVERVIEW**

### **Frontend Structure (src/)**
```
src/
├── components/          # UI Components (40+ files)
├── features/            # Feature modules (10+ modules)
├── pages/               # Route pages (25+ pages)
├── layouts/             # Layout components (5 layouts)
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── types/               # TypeScript definitions
```

### **Backend Structure (backend/)**
```
backend/
├── src/
│   ├── routes/          # API endpoints (9 route files)
│   ├── models/          # Database models (10+ models)
│   ├── middleware/      # Express middleware
│   ├── utils/           # Backend utilities
│   └── controllers/     # Business logic controllers
├── config/              # Configuration files
└── uploads/             # File storage
```

---

## 🔍 **DETAILED FILE SPECIFICATIONS**

### **FRONTEND - AUTHENTICATION MODULE**

#### `@/features/auth/authStore.ts`
**📥 IMPORTS:** 
- `zustand` - State management
- `@/types` - User, LoginCredentials, etc.
- `./authApi` - API functions

**📤 EXPORTS:**
- `useAuthStore()` - Zustand store with auth state
- Methods: `login()`, `register()`, `logout()`, `refreshToken()`, etc.
- State: `user`, `token`, `isAuthenticated`, `isLoading`, `error`

**🎯 USED BY:** 15+ files (Header, LoginPage, RegisterPage, all protected routes)

#### `@/features/auth/authApi.ts`
**📥 IMPORTS:**
- `@/types` - User, LoginCredentials, RegisterData
- `axios` - HTTP client

**📤 EXPORTS:**
- `login()` - User authentication
- `register()` - User registration  
- `refreshToken()` - Token refresh
- `forgotPassword()` - Password reset request
- `resetPassword()` - Password reset confirmation
- `verifyEmail()` - Email verification
- `logout()` - User logout

**🔄 STATUS:** Mock implementation - needs real API integration

**🎯 USED BY:** `authStore.ts`

#### `@/features/auth/hooks/useAuth.ts`
**📥 IMPORTS:**
- `@/features/auth/authStore` - Auth store
- `@/types` - Auth-related types

**📤 EXPORTS:**
- `useAuth()` - Main auth hook
- Helper functions: `hasRole()`, `isAdmin()`, `isVendor()`, etc.
- Auth methods: `login()`, `register()`, `logout()`, etc.

**🎯 USED BY:** ProtectedRoute, RoleRoute, Header, all auth pages

---

### **FRONTEND - MARKETS MODULE**

#### `@/features/markets/marketsStore.ts`
**📥 IMPORTS:**
- `zustand` - State management
- `@/types` - Market, MarketFilters, etc.

**📤 EXPORTS:**
- `useMarketsStore()` - Markets state management
- Methods: `setMarkets()`, `addMarket()`, `trackMarket()`, etc.
- State: `markets`, `filters`, `searchQuery`, `isLoading`, etc.

**🎯 USED BY:** `useMarkets.ts` hook

#### `@/features/markets/marketsApi.ts`
**📥 IMPORTS:**
- `@/types` - Market, MarketFilters, ApiResponse
- Mock data for development

**📤 EXPORTS:**
- `getMarkets()` - Get all markets with filters
- `getMarketById()` - Get single market
- `searchMarkets()` - Search markets
- `getPopularMarkets()` - Get popular markets
- `trackMarket()` - Track/untrack market

**🔄 STATUS:** Mock implementation with realistic data

**🎯 USED BY:** `useMarkets.ts` hook

#### `@/features/markets/hooks/useMarkets.ts`
**📥 IMPORTS:**
- `@/features/markets/marketsStore` - Markets store
- `@/features/markets/marketsApi` - Markets API
- React hooks

**📤 EXPORTS:**
- `useMarkets()` - Main markets hook
- `useMarket(id)` - Single market hook
- `useTrackedMarkets()` - Tracked markets hook

**🎯 USED BY:** MarketGrid, MarketFilters, MarketDetailPage, 15+ pages

---

### **FRONTEND - APPLICATIONS MODULE**

#### `@/features/applications/applicationsStore.ts`
**📥 IMPORTS:**
- `zustand` - State management
- `@/types` - Application, ApplicationStatus, etc.

**📤 EXPORTS:**
- `useApplicationsStore()` - Applications state
- Methods: `setApplications()`, `addApplication()`, `updateApplication()`, etc.
- State: `applications`, `myApplications`, `filters`, `isLoading`, etc.

**🎯 USED BY:** `useApplications.ts` hook

#### `@/features/applications/applicationsApi.ts`
**📥 IMPORTS:**
- `@/types` - Application, ApplicationFilters, etc.
- Mock application data

**📤 EXPORTS:**
- `getApplications()` - Get applications with filters
- `getMyApplications()` - Get user's applications
- `getMarketApplications()` - Get market applications
- `createApplication()` - Create new application
- `submitApplication()` - Submit application
- `updateApplicationStatus()` - Update status (for promoters)
- `deleteApplication()` - Delete application
- `bulkUpdateStatus()` - Bulk status updates

**🔄 STATUS:** Mock implementation with realistic data

**🎯 USED BY:** `useApplications.ts` hook

#### `@/features/applications/hooks/useApplications.ts`
**📥 IMPORTS:**
- `@/features/applications/applicationsStore` - Applications store
- `@/features/applications/applicationsApi` - Applications API
- `@/features/auth/authStore` - Auth store
- React hooks

**📤 EXPORTS:**
- `useApplications()` - Main applications hook
- `useVendorApplications()` - Vendor-specific applications
- `usePromoterApplications()` - Promoter-specific applications

**🎯 USED BY:** ApplicationCard, ApplicationActions, 12+ pages

---

### **FRONTEND - TRACKING MODULE (TODOS & EXPENSES)**

#### `@/features/tracking/trackingStore.ts`
**📥 IMPORTS:**
- `zustand` - State management
- `@/types` - Todo, Expense, ExpenseCategory, etc.

**📤 EXPORTS:**
- `useTrackingStore()` - Tracking state management
- Todo methods: `setTodos()`, `addTodo()`, `updateTodo()`, etc.
- Expense methods: `setExpenses()`, `addExpense()`, `updateExpense()`, etc.
- Computed getters: `getTodosByMarket()`, `getExpensesByCategory()`, etc.

**🎯 USED BY:** `useTodos.ts`, `useExpenses.ts` hooks

#### `@/features/tracking/trackingApi.ts`
**📥 IMPORTS:**
- `@/types` - Todo, Expense, ExpenseCategory, etc.
- Mock data for todos and expenses

**📤 EXPORTS:**
- Todo APIs: `getTodos()`, `createTodo()`, `updateTodo()`, `deleteTodo()`, `getTodoTemplates()`
- Expense APIs: `getExpenses()`, `createExpense()`, `updateExpense()`, `deleteExpense()`, `getExpenseSummary()`

**🔄 STATUS:** Mock implementation with realistic data

**🎯 USED BY:** `useTodos.ts`, `useExpenses.ts` hooks

#### `@/features/tracking/hooks/useTodos.ts`
**📥 IMPORTS:**
- `@/features/tracking/trackingStore` - Tracking store
- `@/features/tracking/trackingApi` - Tracking API
- `@/features/auth/authStore` - Auth store
- `@tanstack/react-query` - Data fetching
- React hooks

**📤 EXPORTS:**
- `useTodos(marketId)` - Main todos hook
- `useTodoTemplates(category)` - Todo templates hook

**🎯 USED BY:** VendorTodoList, BusinessPlanningPage, VendorDashboardPage

#### `@/features/tracking/hooks/useExpenses.ts`
**📥 IMPORTS:**
- `@/features/tracking/trackingStore` - Tracking store
- `@/features/tracking/trackingApi` - Tracking API
- `@/features/auth/authStore` - Auth store
- `@tanstack/react-query` - Data fetching
- React hooks

**📤 EXPORTS:**
- `useExpenses(marketId)` - Main expenses hook
- `useExpenseSummary(marketId)` - Expense summary hook

**🎯 USED BY:** VendorExpenseTracker, FinancialReportsPage, VendorDashboardPage

---

### **FRONTEND - COMMUNITY MODULE**

#### `@/features/community/communityStore.ts`
**📥 IMPORTS:**
- `zustand` - State management
- `@/types` - Comment, Photo, Hashtag, etc.

**📤 EXPORTS:**
- `useCommunityStore()` - Community state
- Methods for comments, photos, hashtags

**🎯 USED BY:** Community hooks

#### `@/features/community/hooks/useComments.ts`
**📥 IMPORTS:**
- `@/features/community/communityStore` - Community store
- `@/features/auth/authStore` - Auth store
- Mock comment data

**📤 EXPORTS:**
- `useComments(marketId)` - Comments for specific market
- Methods: `createComment()`, `updateComment()`, `deleteComment()`

**🎯 USED BY:** CommentList, CommentForm, MarketDetailPage

#### `@/features/community/hooks/usePhotos.ts`
**📥 IMPORTS:**
- `@/features/community/communityStore` - Community store
- `@/features/auth/authStore` - Auth store
- Mock photo data

**📤 EXP