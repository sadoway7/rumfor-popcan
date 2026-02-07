
import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Lazy-loaded page imports for better performance
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage').then(module => ({ default: module.default })))
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })))
const PasswordRecoveryPage = React.lazy(() => import('@/pages/auth/PasswordRecoveryPage').then(module => ({ default: module.PasswordRecoveryPage })))
const PasswordResetPage = React.lazy(() => import('@/pages/auth/PasswordResetPage').then(module => ({ default: module.PasswordResetPage })))
const EmailVerificationPage = React.lazy(() => import('@/pages/auth/EmailVerificationPage').then(module => ({ default: module.EmailVerificationPage })))
const HomePage = React.lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })))
const AboutPage = React.lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })))
const ContactPage = React.lazy(() => import('@/pages/ContactPage').then(module => ({ default: module.ContactPage })))
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage').then(module => ({ default: module.ProfilePage })))
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })))
const NotificationsPage = React.lazy(() => import('@/pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })))
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })))

// Vendor pages - lazy loaded
const VendorDashboardPage = React.lazy(() => import('@/pages/vendor/VendorDashboardPage').then(module => ({ default: module.VendorDashboardPage })))
const FinancialReportsPage = React.lazy(() => import('@/pages/vendor/FinancialReportsPage').then(module => ({ default: module.FinancialReportsPage })))
const MarketCalendarPage = React.lazy(() => import('@/pages/vendor/MarketCalendarPage').then(module => ({ default: module.MarketCalendarPage })))
const AddMarketPage = React.lazy(() => import('@/pages/vendor/AddMarketPage').then(module => ({ default: module.AddMarketPage })))
const VendorAddMarketForm = React.lazy(() => import('@/pages/vendor/VendorAddMarketForm').then(module => ({ default: module.VendorAddMarketForm })))
const VendorTrackedMarketsPage = React.lazy(() => import('@/pages/vendor/VendorTrackedMarketsPage').then(module => ({ default: module.VendorTrackedMarketsPage })))
const VendorTodosPage = React.lazy(() => import('@/pages/vendor/VendorTodosPage').then(module => ({ default: module.VendorTodosPage })))
const VendorBudgetsPage = React.lazy(() => import('@/pages/vendor/VendorBudgetsPage').then(module => ({ default: module.VendorBudgetsPage })))
const VendorMarketDetailPage = React.lazy(() => import('@/pages/vendor/VendorMarketDetailPage').then(module => ({ default: module.VendorMarketDetailPage })))
const VendorEditMarketPage = React.lazy(() => import('@/pages/vendors/VendorEditMarketPage').then(module => ({ default: module.VendorEditMarketPage })))

// Promoter pages - lazy loaded
const PromoterDashboardPage = React.lazy(() => import('@/pages/promoter/PromoterDashboardPage').then(module => ({ default: module.PromoterDashboardPage })))
const PromoterMarketsPage = React.lazy(() => import('@/pages/promoter/PromoterMarketsPage').then(module => ({ default: module.PromoterMarketsPage })))
const PromoterApplicationsPage = React.lazy(() => import('@/pages/promoter/PromoterApplicationsPage').then(module => ({ default: module.PromoterApplicationsPage })))
const PromoterVendorsPage = React.lazy(() => import('@/pages/promoter/PromoterVendorsPage').then(module => ({ default: module.PromoterVendorsPage })))
const PromoterAnalyticsPage = React.lazy(() => import('@/pages/promoter/PromoterAnalyticsPage').then(module => ({ default: module.PromoterAnalyticsPage })))
const PromoterCalendarPage = React.lazy(() => import('@/pages/promoter/PromoterCalendarPage').then(module => ({ default: module.PromoterCalendarPage })))
const PromoterCreateMarketPage = React.lazy(() => import('@/pages/promoter/PromoterCreateMarketPage').then(module => ({ default: module.PromoterCreateMarketPage })))
const BusinessPlanningPage = React.lazy(() => import('@/pages/promoter/BusinessPlanningPage').then(module => ({ default: module.BusinessPlanningPage })))


// Admin pages - lazy loaded
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })))
const AdminModerationPage = React.lazy(() => import('@/pages/admin/AdminModerationPage').then(module => ({ default: module.AdminModerationPage })))
const AdminUsersPage = React.lazy(() => import('@/pages/admin/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })))
const AdminEditUserPage = React.lazy(() => import('@/pages/admin/AdminEditUserPage').then(module => ({ default: module.AdminEditUserPage })))
const AdminAnalyticsPage = React.lazy(() => import('@/pages/admin/AdminAnalyticsPage').then(module => ({ default: module.AdminAnalyticsPage })))
const AdminSettingsPage = React.lazy(() => import('@/pages/admin/AdminSettingsPage').then(module => ({ default: module.AdminSettingsPage })))
const AdminMarketsPage = React.lazy(() => import('@/pages/admin/AdminMarketsPage').then(module => ({ default: module.AdminMarketsPage })))
const AdminEditMarketPage = React.lazy(() => import('@/pages/admin/AdminEditMarketPage').then(module => ({ default: module.AdminEditMarketPage })))
const AdminApplicationsPage = React.lazy(() => import('@/pages/admin/AdminApplicationsPage').then(module => ({ default: module.AdminApplicationsPage })))
const AdminSupportPage = React.lazy(() => import('@/pages/admin/AdminSupportPage').then(module => ({ default: module.AdminSupportPage })))

// Market pages - lazy loaded
const MarketSearchPage = React.lazy(() => import('@/pages/markets/MarketSearchPage').then(module => ({ default: module.MarketSearchPage })))
const MarketDetailPage = React.lazy(() => import('@/pages/markets/MarketDetailPage').then(module => ({ default: module.MarketDetailPage })))

// Application pages - lazy loaded
const MyApplicationsPage = React.lazy(() => import('@/pages/applications').then(module => ({ default: module.MyApplicationsPage })))
const ApplicationDetailPage = React.lazy(() => import('@/pages/applications').then(module => ({ default: module.ApplicationDetailPage })))
const ApplicationFormPage = React.lazy(() => import('@/pages/applications').then(module => ({ default: module.ApplicationFormPage })))

// Dashboard redirect - lazy loaded
const DashboardRedirectPage = React.lazy(() => import('@/pages/DashboardRedirectPage').then(module => ({ default: module.DashboardRedirectPage })))

// Test pages - lazy loaded
const UIComponentsTestPage = React.lazy(() => import('@/pages/test/UIComponentsTestPage').then(module => ({ default: module.UIComponentsTestPage })))

// Loading component for Suspense
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading page...</p>
    </div>
  </div>
)

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><Suspense fallback={<PageLoader />}><HomePage /></Suspense></MainLayout>} />
      <Route path="/markets" element={<MainLayout><Suspense fallback={<PageLoader />}><MarketSearchPage /></Suspense></MainLayout>} />
      <Route path="/markets/:id" element={<MainLayout><Suspense fallback={<PageLoader />}><MarketDetailPage /></Suspense></MainLayout>} />
      <Route path="/about" element={<MainLayout><Suspense fallback={<PageLoader />}><AboutPage /></Suspense></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Suspense fallback={<PageLoader />}><ContactPage /></Suspense></MainLayout>} />

      {/* Test Routes */}
      <Route path="/test/ui" element={<MainLayout><Suspense fallback={<PageLoader />}><UIComponentsTestPage /></Suspense></MainLayout>} />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<AuthLayout><Suspense fallback={<PageLoader />}><LoginPage /></Suspense></AuthLayout>} />
      <Route path="/auth/register" element={<AuthLayout><Suspense fallback={<PageLoader />}><RegisterPage /></Suspense></AuthLayout>} />
      <Route path="/auth/forgot-password" element={<AuthLayout><Suspense fallback={<PageLoader />}><PasswordRecoveryPage /></Suspense></AuthLayout>} />
      <Route path="/auth/reset-password" element={<AuthLayout><Suspense fallback={<PageLoader />}><PasswordResetPage /></Suspense></AuthLayout>} />
      <Route path="/auth/reset-password/:token" element={<AuthLayout><Suspense fallback={<PageLoader />}><PasswordResetPage /></Suspense></AuthLayout>} />
      <Route path="/auth/verify-email" element={<AuthLayout><Suspense fallback={<PageLoader />}><EmailVerificationPage /></Suspense></AuthLayout>} />

      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout><Suspense fallback={<PageLoader />}><SettingsPage /></Suspense></MainLayout>
        </ProtectedRoute>
      } />

      {/* Application Routes */}
      <Route path="/applications/:id" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <MainLayout><Suspense fallback={<PageLoader />}><ApplicationDetailPage /></Suspense></MainLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/markets/:id/apply" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <MainLayout><Suspense fallback={<PageLoader />}><ApplicationFormPage /></Suspense></MainLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Vendor Routes */}
      <Route path="/vendor/dashboard" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><VendorDashboardPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/applications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><MyApplicationsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/planning" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><BusinessPlanningPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/budgets" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><VendorBudgetsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/todos" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><VendorTodosPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/expenses" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><FinancialReportsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/calendar" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><MarketCalendarPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/add-market" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><AddMarketPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/add-market/vendor" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><VendorAddMarketForm /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/tracked-markets" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><VendorTrackedMarketsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/markets/:id" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><VendorMarketDetailPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/markets/:marketId/edit" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><Suspense fallback={<PageLoader />}><VendorEditMarketPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Promoter Routes */}
      <Route path="/promoter/dashboard" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><Suspense fallback={<PageLoader />}><PromoterDashboardPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/markets" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><Suspense fallback={<PageLoader />}><PromoterMarketsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/markets/create" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><Suspense fallback={<PageLoader />}><PromoterCreateMarketPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/applications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><Suspense fallback={<PageLoader />}><PromoterApplicationsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/vendors" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><Suspense fallback={<PageLoader />}><PromoterVendorsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/analytics" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><Suspense fallback={<PageLoader />}><PromoterAnalyticsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/calendar" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><Suspense fallback={<PageLoader />}><PromoterCalendarPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <ErrorBoundary>
              <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense></DashboardLayout>
            </ErrorBoundary>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/users/:id" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <ErrorBoundary>
              <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminEditUserPage /></Suspense></DashboardLayout>
            </ErrorBoundary>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/markets" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminMarketsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/markets/:marketId" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <ErrorBoundary>
              <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminEditMarketPage /></Suspense></DashboardLayout>
            </ErrorBoundary>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/applications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminApplicationsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/moderation" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminModerationPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/analytics" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminAnalyticsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/support" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><Suspense fallback={<PageLoader />}><AdminSupportPage /></Suspense></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Notifications Route */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['visitor', 'vendor', 'promoter', 'admin']}>
            <MainLayout><Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense></MainLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Generic Dashboard Route - Redirects to role-specific dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute requireEmailVerification={false}>
          <RoleRoute allowedRoles={['visitor', 'vendor', 'promoter', 'admin']} requireEmailVerification={false}>
            <Suspense fallback={<PageLoader />}><DashboardRedirectPage /></Suspense>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Error Pages */}
      <Route path="/unauthorized" element={
        <MainLayout>
          <NotFoundPage 
            title="Access Denied" 
            message="You don't have permission to access this page." 
            showBackButton={true}
          />
        </MainLayout>
      } />

      {/* 404 Page */}
      <Route path="*" element={
        <MainLayout>
          <NotFoundPage />
        </MainLayout>
      } />
    </Routes>
  )
}
