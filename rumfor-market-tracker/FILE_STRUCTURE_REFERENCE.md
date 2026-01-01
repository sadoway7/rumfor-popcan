# Rumfor Market Tracker - Complete File Structure Reference

This document serves as the comprehensive reference for the complete file structure that needs to be implemented for the Rumfor Market Tracker application.

## Complete Directory Structure

```
rumfor-market-tracker/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── manifest.json
│   └── assets/
│       ├── default-market-image.jpg
│       ├── icon-192.png
│       └── icon-512.png
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── logo-dark.svg
│   │   │   ├── hero-background.jpg
│   │   │   ├── empty-state-markets.svg
│   │   │   ├── empty-state-notifications.svg
│   │   │   └── empty-state-applications.svg
│   │   │
│   │   └── icons/
│   │       ├── market-categories/
│   │       │   ├── farmers-market.svg
│   │       │   ├── arts-crafts.svg
│   │       │   ├── flea-market.svg
│   │       │   ├── food-festival.svg
│   │       │   └── holiday-market.svg
│   │       │
│   │       └── accessibility/
│   │           ├── wheelchair.svg
│   │           ├── parking.svg
│   │           └── restrooms.svg
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── MarketCard.tsx
│   │   ├── MarketGrid.tsx
│   │   ├── MarketHero.tsx
│   │   ├── MarketInfo.tsx
│   │   │
│   │   ├── MarketFilters/
│   │   │   ├── MarketFilters.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── LocationFilter.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── DateRangeFilter.tsx
│   │   │   ├── HashtagFilter.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── Search/
│   │   │   ├── Search.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── MarketStatus/
│   │   │   ├── MarketStatus.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   ├── CommentReactions.tsx
│   │   │
│   │   ├── PhotoGallery/
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── PhotoGrid.tsx
│   │   │   ├── PhotoLightbox.tsx
│   │   │   ├── PhotoThumbnail.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── PhotoUploader/
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── FileDropzone.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   ├── CaptionInput.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── HashtagVoting/
│   │   │   ├── HashtagVoting.tsx
│   │   │   ├── HashtagList.tsx
│   │   │   ├── HashtagItem.tsx
│   │   │   ├── HashtagInput.tsx
│   │   │   ├── PredefinedHashtags.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── Notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── VendorTodoList/
│   │   │   ├── VendorTodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   ├── TodoFilters.tsx
│   │   │   ├── TodoProgress.tsx
│   │   │   ├── TodoTemplates.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── VendorExpenseTracker/
│   │   │   ├── VendorExpenseTracker.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── ExpenseItem.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseChart.tsx
│   │   │   ├── ExpenseSummary.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── VendorApplicationForm/
│   │   │   ├── VendorApplicationForm.tsx
│   │   │   ├── ApplicationSection.tsx
│   │   │   ├── StandardFields.tsx
│   │   │   ├── CustomFieldRenderer.tsx
│   │   │   ├── FieldValidation.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── VendorDashboard/
│   │   │   ├── VendorDashboard.tsx
│   │   │   ├── MarketCalendar.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── PromoterApplicationReview/
│   │   │   ├── PromoterApplicationReview.tsx
│   │   │   ├── ApplicationsList.tsx
│   │   │   ├── ApplicationFilters.tsx
│   │   │   ├── ApplicationDetails.tsx
│   │   │   ├── ApplicantInfo.tsx
│   │   │   ├── ApplicantHistory.tsx
│   │   │   ├── ReviewActions.tsx
│   │   │   ├── ReviewNotes.tsx
│   │   │   ├── BulkActions.tsx
│   │   │   ├── BulkSelector.tsx
│   │   │   ├── EmailComposer.tsx
│   │   │   ├── EmailTemplateSelector.tsx
│   │   │   ├── RecipientSelector.tsx
│   │   │   ├── RecipientGroups.tsx
│   │   │   ├── CommunicationHistory.tsx
│   │   │   ├── EmailPreview.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── PromoterMarketSettings/
│   │   │   ├── PromoterMarketSettings.tsx
│   │   │   ├── BasicInfoForm.tsx
│   │   │   ├── MarketDetails.tsx
│   │   │   ├── ContactInfo.tsx
│   │   │   ├── ApplicationFieldsEditor.tsx
│   │   │   ├── FieldBuilder.tsx
│   │   │   ├── FieldPreview.tsx
│   │   │   ├── EmailTemplatesEditor.tsx
│   │   │   ├── TemplateEditor.tsx
│   │   │   ├── VariableInserter.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── PromoterDashboard/
│   │   │   ├── PromoterDashboard.tsx
│   │   │   ├── MarketClaim.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── AdminUserTable/
│   │   │   ├── AdminUserTable.tsx
│   │   │   ├── UserRow.tsx
│   │   │   ├── UserActions.tsx
│   │   │   ├── UserFilters.tsx
│   │   │   ├── UserDetails.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── AdminModerationQueue/
│   │   │   ├── AdminModerationQueue.tsx
│   │   │   ├── ModerationList.tsx
│   │   │   ├── ModerationItem.tsx
│   │   │   ├── ModerationActions.tsx
│   │   │   ├── ModerationFilters.tsx
│   │   │   ├── ContentPreview.tsx
│   │   │   ├── ReportDetails.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── AdminPromoterVerification/
│   │   │   ├── AdminPromoterVerification.tsx
│   │   │   ├── VerificationList.tsx
│   │   │   ├── VerificationForm.tsx
│   │   │   ├── ApplicationReview.tsx
│   │   │   ├── CriteriaChecklist.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── AdminAnalyticsDashboard/
│   │   │   ├── AdminAnalyticsDashboard.tsx
│   │   │   ├── UserMetrics.tsx
│   │   │   ├── MarketMetrics.tsx
│   │   │   ├── EngagementMetrics.tsx
│   │   │   ├── ApplicationMetrics.tsx
│   │   │   ├── GrowthChart.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── AdminTools/
│   │   │   ├── AdminTools.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── Pagination.tsx
│   │   └── InfiniteScroll.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── usePasswordReset.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── tokenStorage.ts
│   │   │   │   ├── validatePassword.ts
│   │   │   │   ├── sessionManager.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── authApi.ts
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── markets/
│   │   │   ├── hooks/
│   │   │   │   ├── useMarkets.ts
│   │   │   │   ├── useMarketSearch.ts
│   │   │   │   ├── useMarketTracking.ts
│   │   │   │   ├── useMarketMutations.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── filterMarkets.ts
│   │   │   │   ├── sortMarkets.ts
│   │   │   │   ├── searchMarkets.ts
│   │   │   │   ├── groupMarketsByDate.ts
│   │   │   │   ├── calculatePopularity.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── marketsApi.ts
│   │   │   ├── marketsStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── applications/
│   │   │   ├── hooks/
│   │   │   │   ├── useApplications.ts
│   │   │   │   ├── useApplicationMutations.ts
│   │   │   │   ├── useApplicationReview.ts
│   │   │   │   ├── useCustomFields.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── validateApplication.ts
│   │   │   │   ├── formatApplicationData.ts
│   │   │   │   ├── groupApplicationsByStatus.ts
│   │   │   │   ├── processCustomFields.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── applicationsApi.ts
│   │   │   ├── applicationsStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── communications/
│   │   │   ├── hooks/
│   │   │   │   ├── useEmailComposer.ts
│   │   │   │   ├── useCommunicationHistory.ts
│   │   │   │   ├── useBulkEmail.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── parseEmailTemplate.ts
│   │   │   │   ├── validateRecipients.ts
│   │   │   │   ├── replaceVariables.ts
│   │   │   │   ├── formatEmailBody.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── communicationsApi.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── community/
│   │   │   ├── hooks/
│   │   │   │   ├── useComments.ts
│   │   │   │   ├── usePhotos.ts
│   │   │   │   ├── useHashtags.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── sanitizeComment.ts
│   │   │   │   ├── validatePhoto.ts
│   │   │   │   ├── processImageUpload.ts
│   │   │   │   ├── calculateVoteScore.ts
│   │   │   │   ├── formatHashtag.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── communityApi.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── tracking/
│   │   │   ├── hooks/
│   │   │   │   ├── useTodos.ts
│   │   │   │   ├── useExpenses.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── calculateProfit.ts
│   │   │   │   ├── groupExpenses.ts
│   │   │   │   ├── calculateTodoProgress.ts
│   │   │   │   ├── sortExpensesByCategory.ts
│   │   │   │   ├── validateExpenseAmount.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── trackingApi.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── hooks/
│   │   │   │   ├── useNotifications.ts
│   │   │   │   ├── useNotificationPreferences.ts
│   │   │   │   ├── useNotificationCount.ts
│   │   │   │   ├── useMarkAsRead.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── formatNotification.ts
│   │   │   │   ├── groupNotifications.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── notificationsApi.ts
│   │   │   └── index.ts
│   │   │
│   │   └── admin/
│   │       ├── hooks/
│   │       │   ├── useModeration.ts
│   │       │   ├── useUserManagement.ts
│   │       │   ├── usePromoterVerification.ts
│   │       │   ├── useAnalytics.ts
│   │       │   ├── useBulkOperations.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── utils/
│   │       │   ├── processReports.ts
│   │       │   ├── generateStats.ts
│   │       │   ├── calculateMetrics.ts
│   │       │   ├── validateVerification.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── adminApi.ts
│   │       └── index.ts
│   │
│   ├── layouts/
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── VendorLayout.tsx
│   │   ├── PromoterLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── index.ts
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── PasswordRecoveryPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── markets/
│   │   │   ├── MarketDetailPage.tsx
│   │   │   ├── MarketSearchPage.tsx
│   │   │   ├── MarketFormPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── MyMarketsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   │
│   │   ├── PromoterDashboardPage.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminModerationPage.tsx
│   │   │   ├── AdminUsersPage.tsx
│   │   │   ├── AdminVerificationPage.tsx
│   │   │   ├── AdminAnalyticsPage.tsx
│   │   │   ├── AdminSettingsPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ErrorPage.tsx
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useSessionStorage.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useClickOutside.ts
│   │   ├── useToggle.ts
│   │   ├── usePagination.ts
│   │   ├── useForm.ts
│   │   ├── useAsync.ts
│   │   ├── useWindowSize.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── useErrorHandler.ts
│   │   ├── useLoadingState.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── formatters/
│   │   │   ├── formatDate.ts
│   │   │   ├── formatCurrency.ts
│   │   │   ├── formatStatus.ts
│   │   │   ├── formatDistance.ts
│   │   │   ├── formatNumber.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── validators/
│   │   │   ├── validateEmail.ts
│   │   │   ├── validateUrl.ts
│   │   │   ├── validatePhone.ts
│   │   │   ├── validateForm.ts
│   │   │   ├── validateFileUpload.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── fileUpload.ts
│   │   ├── cn.ts
│   │   ├── helpers.ts
│   │   ├── array.ts
│   │   ├── string.ts
│   │   ├── object.ts
│   │   └── index.ts
│   │
│   ├── config/
│   │   ├── constants.ts
│   │   ├── permissions.ts
│   │   ├── routes.ts
│   │   ├── marketCategories.ts
│   │   ├── applicationFields.ts
│   │   ├── emailTemplates.ts
│   │   ├── todoTemplates.ts
│   │   ├── expenseCategories.ts
│   │   ├── predefinedHashtags.ts
│   │   ├── notificationTypes.ts
│   │   ├── features.ts
│   │   ├── env.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── apiClient.ts
│   │   ├── queryClient.ts
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── market.types.ts
│   │   ├── user.types.ts
│   │   ├── application.types.ts
│   │   ├── community.types.ts
│   │   ├── tracking.types.ts
│   │   ├── communication.types.ts
│   │   ├── notification.types.ts
│   │   ├── admin.types.ts
│   │   ├── api.types.ts
│   │   ├── error.types.ts
│   │   ├── form.types.ts
│   │   └── index.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── router/
│   │   ├── routes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleRoute.tsx
│   │   ├── VendorRoute.tsx
│   │   ├── PromoterRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── index.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env
├── .env.example
├── .env.development
├── .env.production
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── uno.config.ts
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── README.md
```

## Implementation Priority

### Phase 1: Core Foundation (Current)
- ✅ Basic project setup with Vite + React + TypeScript
- ✅ Tailwind CSS configuration
- ✅ Core UI components (Button, Input, Card)
- ✅ Authentication store with Zustand
- ✅ Basic routing structure
- ✅ Type definitions

### Phase 2: Essential Features
1. **UI Components** - Complete all base UI components
2. **Authentication System** - Login/Register pages, protected routes
3. **Market Management** - Basic market display and search
4. **Layouts** - Role-based layouts

### Phase 3: Feature Modules
1. **Markets Module** - Full market CRUD, filtering, search
2. **Applications Module** - Vendor application system
3. **Community Module** - Comments, photos, hashtags
4. **Vendor Tracking** - Todo lists, expense tracking

### Phase 4: Advanced Features
1. **Promoter Tools** - Market creation, application review
2. **Communications** - Email templates, bulk messaging
3. **Admin Panel** - User management, moderation
4. **Analytics** - Dashboard metrics and insights

### Phase 5: Polish & Optimization
1. **Performance** - Code splitting, lazy loading
2. **Accessibility** - WCAG compliance
3. **Testing** - Unit and integration tests
4. **Documentation** - API docs, user guides

## Key Architecture Decisions

### State Management
- **Zustand** for global state (auth, UI state)
- **TanStack Query** for server state (API data)
- **Local state** for component-specific data

### Component Architecture
- **Atomic design** approach with compound components
- **Composition over inheritance**
- **Single responsibility principle**

### File Organization
- **Feature-based** organization
- **Co-location** of related files
- **Clear separation** of concerns

### Type Safety
- **Strict TypeScript** configuration
- **Comprehensive type definitions**
- **Runtime validation** with Zod

This structure provides a complete blueprint for building a scalable, maintainable, and feature-rich market tracking application with proper separation of concerns and modern development practices.