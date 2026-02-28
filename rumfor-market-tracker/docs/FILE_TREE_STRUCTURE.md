# Rumfor Market Tracker - Complete File Tree Structure

```
rumfor-market-tracker/
├── .dockerignore
├── .env
├── .env.example
├── .eslintrc-auto-import.json
├── .eslintrc.json
├── .gitignore
├── .gitlab/
│   └── issue_templates/
│       ├── Bug_Report.md
│       └── Feature_Request.md
├── .gitleaks.toml
├── .prettierrc
├── .ralph - Shortcut.lnk
├── .security-scan.yml
├── BRAND_DESIGN_GUIDELINES.md
├── DATABASE_SCHEMA.md
├── docker-compose.prod.yml
├── Dockerfile
├── EMAIL_SYSTEM.md
├── IMPLEMENTATION_PLAN.md
├── IMPLEMENTATION_PLAN_VENDOR_ADD_MARKET.md
├── index.html
├── nginx.conf
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── rumformark-concept.md
├── start-dev-linux.sh
├── start-dev-mac.command
├── start-dev-mac.sh
├── start-dev-windows.bat
├── start-local-no-docker.bat
├── start-local-windows.bat
├── start-prod-local-windows.bat
├── SYSTEM_ARCHITECTURE_MAP.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── uno.config.ts
├── UNOCSS-GUIDE.md
├── VITE-PLUGINS-GUIDE.md
├── vite.config.ts
├── vitest.config.ts
├── audit-report.json
├── backup_marketcard.txt
├── cards/
│   ├── README.md
│   ├── application_flow.dot
│   ├── application_flow.md
│   ├── auth_email_verification.dot
│   ├── auth_email_verification.md
│   ├── auth_mongo_connection.dot
│   ├── auth_mongo_connection.md
│   ├── auth_password_reset.dot
│   ├── auth_password_reset.md
│   ├── auth_refresh_tokens.dot
│   ├── auth_refresh_tokens.md
│   ├── auth_roles_permissions.dot
│   ├── auth_roles_permissions.md
│   ├── auth_session_security.dot
│   ├── auth_session_security.md
│   ├── auth_user_login.dot
│   ├── auth_user_login.md
│   ├── auth_user_management.dot
│   ├── auth_user_management.md
│   ├── auth_user_registration.dot
│   ├── auth_user_registration.md
│   ├── community_photos.dot
│   ├── community_photos.md
│   ├── data_user_schema_integrity.dot
│   ├── data_user_schema_integrity.md
│   ├── deployment_gitlab_unraid.dot
│   ├── expense_tracking.dot
│   ├── expense_tracking.md
│   ├── hashtag_voting.dot
│   ├── hashtag_voting.md
│   ├── index.json
│   ├── market_discovery.dot
│   ├── market_discovery.md
│   ├── mobile_accessibility.dot
│   ├── mobile_accessibility.md
│   ├── notifications.dot
│   ├── notifications.md
│   ├── onboarding_friction.dot
│   ├── onboarding_friction.md
│   ├── promoter_claiming.dot
│   ├── promoter_claiming.md
│   └── tracking_statuses.dot
│   └── tracking_statuses.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── app.js
│   ├── backend.log
│   ├── cookies.txt
│   ├── create-test-market.js
│   ├── create-test-markets.js
│   ├── Dockerfile
│   ├── fix-market-images.js
│   ├── keepalive.sh
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── seed-email-templates.js
│   ├── seed-production-data.js
│   ├── seed-test-users.js
│   ├── start.sh
│   ├── test-server.js
│   ├── update-market-images.cjs
│   ├── config/
│   │   └── database.js
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── applicationsController.js
│   │   │   ├── authController.js
│   │   │   ├── bugReportController.js
│   │   │   ├── commentsController.js
│   │   │   ├── emailController.js
│   │   │   ├── expensesController.js
│   │   │   ├── hashtagController.js
│   │   │   ├── marketConversionsController.js
│   │   │   ├── marketsController.js
│   │   │   ├── notificationsController.js
│   │   │   ├── photosController.js
│   │   │   ├── todoPresetsController.js
│   │   │   ├── todosController.js
│   │   │   ├── usersController.js
│   │   │   └── vendorController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── requestLogger.js
│   │   │   ├── validation.js
│   │   │   └── versioning.js
│   │   ├── models/
│   │   │   ├── Application.js
│   │   │   ├── BugReport.js
│   │   │   ├── Comment.js
│   │   │   ├── EmailConfig.js
│   │   │   ├── EmailLog.js
│   │   │   ├── EmailTemplate.js
│   │   │   ├── Expense.js
│   │   │   ├── Market.js
│   │   │   ├── MarketConversion.js
│   │   │   ├── Message.js
│   │   │   ├── Notification.js
│   │   │   ├── Photo.js
│   │   │   ├── Todo.js
│   │   │   ├── TodoPreset.js
│   │   │   ├── User.js
│   │   │   └── UserMarketTracking.js
│   │   ├── routes/
│   │   │   ├── admin.js
│   │   │   ├── applications.js
│   │   │   ├── auth.js
│   │   │   ├── bugReports.js
│   │   │   ├── comments.js
│   │   │   ├── email.js
│   │   │   ├── expenses.js
│   │   │   ├── hashtags.js
│   │   │   ├── marketConversions.js
│   │   │   ├── markets.js
│   │   │   ├── notifications.js
│   │   │   ├── photos.js
│   │   │   ├── ralphCards.js
│   │   │   ├── todo-presets.js
│   │   │   ├── todos.js
│   │   │   ├── users.js
│   │   │   └── vendors.js
│   │   ├── services/
│   │   │   ├── emailSender.js
│   │   │   ├── emailService.js
│   │   │   ├── emailTemplateService.js
│   │   │   └── twoFactorService.js
│   │   └── utils/
│   │       ├── encryption.js
│   │       ├── genericImages.js
│   │       ├── marketLogic.js
│   │       └── serializers.js
│   └── uploads/
│       ├── vendor_avatar_1770782582409_osox7mq0e.jpeg
│       ├── vendor_avatar_1770790559767_6ck3lu8fa.png
│       ├── vendor_avatar_1771033329370_yg0087cxu.webp
│       ├── vendor_avatar_1771033450494_oq3qtc1jn.webp
│       ├── vendor_avatar_1771034230330_5bdu91mnj.webp
│       ├── vendor_avatar_1771034336961_do60sqzz6.webp
│       ├── vendor_avatar_1771035015699_3fle4jjkq.webp
│       ├── vendor_avatar_1771049585040_1243vd12z.webp
│       ├── vendor_avatar_1771049796087_dlixjce8a.webp
│       ├── vendor_avatar_1771049831283_ad5xwhcz1.webp
│       └── vendor_avatar_1771052300629_0a98fbv4z.webp
├── dist/
│   ├── index.html
│   ├── index.html.br
│   ├── index.html.gz
│   ├── manifest.json
│   ├── vite.svg
│   └── assets/ (many compiled assets)
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── CUSTOM_AGENTS.md
│   ├── MARKET_DATE_DISPLAY_ISSUES.md
│   ├── MARKET_DATE_FIXES.md
│   ├── SETUP.md
│   ├── USAGE.md
│   └── VENDOR_TRACKED_MARKETS_REDESIGN.md
├── eslint-report.json
├── gitleaks-report.json
├── plans/
│   ├── README.md
│   ├── AI_AGENT_PROTOCOL.md
│   ├── AUDIT_SUMMARY.md
│   ├── SYSTEMATIC_FIX_PLAN.md
│   └── vendor-tracked-markets-redesign.md
├── public/
│   ├── manifest.json
│   ├── vite.svg
│   └── assets/
│       └── images/
│           ├── artandcraft.png
│           ├── artandcraft.webp
│           ├── communityevent.png
│           ├── communityevent.webp
│           ├── craftshow.png
│           ├── craftshow.webp
│           ├── farmermarket.png
│           ├── farmermarket.webp
│           ├── fleamarket.png
│           ├── fleamarket.webp
│           ├── foodfestival.png
│           ├── foodfestival.webp
│           ├── holidaymarket.png
│           ├── holidaymarket.webp
│           ├── maskable-icon.png
│           ├── nightmarket.png
│           ├── nightmarket.webp
│           ├── no-image-placeholder.svg
│           ├── streetfair.png
│           ├── streetfair.webp
│           ├── vintageandantique.jpeg
│           └── vintageandantique.webp
├── scripts/
│   ├── compress-market-images.ts
│   └── security-scan.sh
├── security-reports/
│   ├── eslint-report.json
│   ├── npm-audit-report.json
│   └── tsc-report.txt
├── src/
│   ├── App.tsx
│   ├── auto-imports.d.ts
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── assets/
│   │   └── images/
│   │       ├── README.md
│   │       ├── index.ts
│   │       ├── artandcraft.png
│   │       ├── artandcraft.webp
│   │       ├── communityevent.png
│   │       ├── communityevent.webp
│   │       ├── craftshow.png
│   │       ├── craftshow.webp
│   │       ├── farmermarket.png
│   │       ├── farmermarket.webp
│   │       ├── fleamarket.png
│   │       ├── fleamarket.webp
│   │       ├── foodfestival.png
│   │       ├── foodfestival.webp
│   │       ├── holidaymarket.png
│   │       ├── holidaymarket.webp
│   │       ├── nightmarket.png
│   │       ├── nightmarket.webp
│   │       ├── no-image-placeholder.svg
│   │       ├── streetfair.png
│   │       ├── streetfair.webp
│   │       ├── vintageandantique.jpeg
│   │       └── vintageandantique.webp
│   ├── components/
│   │   ├── index.ts
│   │   ├── ApplicationActions.tsx
│   │   ├── ApplicationCard.tsx
│   │   ├── ApplicationFilters.tsx
│   │   ├── ApplicationForm.tsx
│   │   ├── ApplicationStatus.tsx
│   │   ├── BottomNav.tsx
│   │   ├── BugReportModal.tsx
│   │   ├── CommentForm.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentList.module.css
│   │   ├── CommentList.tsx
│   │   ├── CommentReactions.tsx
│   │   ├── CommentsModal.tsx
│   │   ├── CommentTreeLines.tsx
│   │   ├── DatePicker.tsx
│   │   ├── DeferredComponent.tsx
│   │   ├── EmailAlertsSettings.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ExpenseChart.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseItem.tsx
│   │   ├── ExpenseSummary.tsx
│   │   ├── ExportModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LocationModal.tsx
│   │   ├── MarketCalendar.tsx
│   │   ├── MarketCard.tsx
│   │   ├── MarketConversionRequestForm.tsx
│   │   ├── MarketFilters.tsx
│   │   ├── MarketGrid.tsx
│   │   ├── MarketLifespan.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── PhotoThumbnail.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── RelatedMarketDates.tsx
│   │   ├── ReportIssueModal.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusChangeModal.tsx
│   │   ├── SubHeader.tsx
│   │   ├── SuggestUpdateModal.tsx
│   │   ├── TagVoting.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoProgress.tsx
│   │   ├── TodoTemplates.tsx
│   │   ├── TrackButton.tsx
│   │   ├── UserAvatar.tsx
│   │   ├── UserDropdown.tsx
│   │   ├── VendorAggregatedBudgetList.tsx
│   │   ├── VendorAggregatedTodoList.tsx
│   │   ├── VendorAnalyticsDashboard.tsx
│   │   ├── VendorAttendanceTracker.tsx
│   │   ├── VendorBudgetList.tsx
│   │   ├── VendorCard.tsx
│   │   ├── VendorConversionRequest.tsx
│   │   ├── VendorExpenseTracker.tsx
│   │   ├── VendorMarketCard.tsx
│   │   ├── VendorMarketRow.tsx
│   │   ├── VendorTodoList.tsx
│   │   ├── VendorTrackedMarketRow.tsx
│   │   ├── WebGLShader.tsx
│   │   ├── admin/
│   │   │   ├── EmailTemplateDrawer.tsx
│   │   │   ├── AdminAnalyticsDashboard.tsx
│   │   │   ├── AdminModerationQueue.tsx
│   │   │   ├── AdminPromoterVerification.tsx
│   │   │   ├── AdminTools.tsx
│   │   │   └── AdminUserTable.tsx
│   │   └── ui/
│   │       ├── Accordion.tsx
│   │       ├── Alert.tsx
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── ChatNotificationIcon.tsx
│   │       ├── Checkbox.tsx
│   │       ├── CityAutocomplete.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── Dropdown.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── ErrorFallback.tsx
│   │       ├── FollowCountIcon.tsx
│   │       ├── index.ts
│   │       ├── Input.tsx
│   │       ├── Loader.tsx
│   │       ├── MarketNameSuggestions.tsx
│   │       ├── Modal.tsx
│   │       ├── Progress.tsx
│   │       ├── PulseDots.tsx
│   │       ├── Radio.tsx
│   │       ├── Select.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Spinner.tsx
│   │       ├── Table.tsx
│   │       ├── Tabs.tsx
│   │       ├── Textarea.tsx
│   │       ├── Toast.tsx
│   │       └── Tooltip.tsx
│   ├── config/
│   │   ├── index.ts
│   │   ├── constants.ts
│   │   └── trackingStatus.ts
│   ├── features/
│   │   ├── admin/
│   │   │   ├── index.ts
│   │   │   ├── adminApi.ts
│   │   │   ├── adminStore.ts
│   │   │   ├── supportApi.ts
│   │   │   └── hooks/
│   │   │       ├── index.ts
│   │   │       ├── useAdmin.ts
│   │   │       └── useSupport.ts
│   │   ├── applications/
│   │   │   ├── applicationsApi.ts
│   │   │   └── hooks/
│   │   │       └── useApplications.ts
│   │   ├── auth/
│   │   │   ├── authApi.ts
│   │   │   ├── authStore.ts
│   │   │   └── hooks/
│   │   │       ├── useAuth.ts
│   │   │       ├── useEmailVerification.ts
│   │   │       └── usePasswordReset.ts
│   │   ├── comments/
│   │   │   ├── commentsModalStore.ts
│   │   │   └── commentsApi.ts
│   │   ├── community/
│   │   │   ├── communityApi.ts
│   │   │   └── hooks/
│   │   │       ├── useComments.ts
│   │   │       ├── useHashtags.ts
│   │   │       └── usePhotos.ts
│   │   ├── markets/
│   │   │   ├── marketsApi.ts
│   │   │   ├── marketsStore.ts
│   │   │   └── hooks/
│   │   │       ├── useMarkets.ts
│   │   │       └── useWeather.ts
│   │   ├── notifications/
│   │   │   ├── notificationsApi.ts
│   │   │   └── hooks/
│   │   │       └── useNotifications.ts
│   │   ├── theme/
│   │   │   └── themeStore.ts
│   │   ├── tracking/
│   │   │   ├── trackingApi.ts
│   │   │   ├── presetApi.ts
│   │   │   └── hooks/
│   │   │       ├── useAllExpenses.ts
│   │   │       ├── useAllTodos.ts
│   │   │       ├── useExpenses.ts
│   │   │       ├── useTodoPresets.ts
│   │   │       └── useTodos.ts
│   │   └── vendor/
│   │       ├── vendorsApi.ts
│   │       └── hooks/
│   │           └── useVendors.ts
│   ├── layouts/
│   │   ├── AdminLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── MainLayout.tsx
│   │   └── PromoterLayout.tsx
│   ├── lib/
│   │   └── httpClient.ts
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── DashboardRedirectPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── MyMarketsPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── UIComponentsTestPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminAnalyticsPage.tsx
│   │   │   ├── AdminApplicationsPage.tsx
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminEditMarketPage.tsx
│   │   │   ├── AdminEditUserPage.tsx
│   │   │   ├── AdminMarketsPage.tsx
│   │   │   ├── AdminModerationPage.tsx
│   │   │   ├── AdminSettingsPage.tsx
│   │   │   ├── AdminSupportPage.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationDetailPage.tsx
│   │   │   ├── CreateApplicationPage.tsx
│   │   │   ├── EditApplicationPage.tsx
│   │   │   └── VendorApplicationPage.tsx
│   │   ├── auth/
│   │   │   ├── EmailVerificationPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── PasswordRecoveryPage.tsx
│   │   │   ├── PasswordResetPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── markets/
│   │   │   ├── MarketCalendarPage.tsx
│   │   │   ├── MarketDetailPage.tsx
│   │   │   ├── MarketSearchPage.tsx
│   │   │   ├── NewVendorMarketPage.tsx
│   │   │   └── VendorAddMarketForm.tsx
│   │   ├── promoter/
│   │   │   ├── PromoterAnalyticsPage.tsx
│   │   │   ├── PromoterApplicationsPage.tsx
│   │   │   ├── PromoterCalendarPage.tsx
│   │   │   ├── PromoterCreateMarketPage.tsx
│   │   │   ├── PromoterDashboardPage.tsx
│   │   │   ├── PromoterEditMarketPage.tsx
│   │   │   ├── PromoterMarketsPage.tsx
│   │   │   └── PromoterVendorsPage.tsx
│   │   ├── vendor/
│   │   │   ├── VendorApplicationsPage.tsx
│   │   │   ├── VendorBudgetsPage.tsx
│   │   │   ├── VendorDashboardPage.tsx
│   │   │   ├── VendorProfileEditPage.tsx
│   │   │   ├── VendorProfilePage.tsx
│   │   │   ├── VendorTodosPage.tsx
│   │   │   └── VendorTrackedMarketsPage.tsx
│   │   └── vendors/
│   │       ├── VendorProfilePage.tsx
│   │       └── VendorsPage.tsx
│   ├── router/
│   │   └── index.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── test/
│   │   └── setup.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── analytics.ts
│       ├── auth.test.ts
│       ├── auth.ts
│       ├── colors.ts
│       ├── date.test.ts
│       ├── date.ts
│       ├── export.ts
│       ├── format.ts
│       ├── imageUtils.ts
│       ├── localStorage.ts
│       ├── reports.ts
│       ├── storage.ts
│       ├── test-utils.tsx
│       └── validation.ts
├── test-results.json
└── tests/
    ├── admin.test.ts
    ├── auth.test.ts
    ├── comments.test.ts
    ├── markets.test.ts
    ├── setup.ts
    ├── test-utils.tsx
    ├── utils.test.ts
    ├── vendor.test.ts
    └── vitest.config.ts
```

## Project Overview

The rumfor-market-tracker is a comprehensive full-stack application for market management with the following key characteristics:

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Radix UI for component primitives
- Zustand for state management
- React Query for data fetching
- React Router for navigation

**Backend:**
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication with refresh tokens
- Multer for file uploads
- Nodemailer for email services
- Comprehensive security middleware

### Key Directories

**`src/` - Frontend Source**
- `components/` - Reusable React components
- `pages/` - Page-level components organized by role (admin, vendor, promoter)
- `features/` - Feature-specific logic, APIs, and hooks
- `layouts/` - Layout components for different user roles
- `utils/` - Utility functions and helpers
- `types/` - TypeScript type definitions

**`backend/src/` - Backend Source**
- `controllers/` - API request handlers
- `models/` - MongoDB data models
- `routes/` - API route definitions
- `middleware/` - Express middleware functions
- `services/` - Business logic services
- `utils/` - Backend utility functions

**Key Features By Role:**
- **Vendors**: Market tracking, applications, budget management, todo lists
- **Promoters**: Market creation, application review, analytics
- **Admin**: User management, moderation, system oversight
- **Public**: Market discovery, vendor profiles, community features

The project follows clean architecture principles with proper separation of concerns, comprehensive testing, and production-ready deployment configurations.