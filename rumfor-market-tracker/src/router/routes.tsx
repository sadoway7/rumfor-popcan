
import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

// Lazy-loaded page imports for better performance
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage').then(module => ({ default: module.default })))
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })))
const PasswordRecoveryPage = React.lazy(() => import('@/pages/auth/PasswordRecoveryPage').then(module => ({ default: module.PasswordRecoveryPage })))
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
const VendorMarketDetailPage = React.lazy(() => import('@/pages/vendor/VendorMarketDetailPage').then(module => ({ default: module.VendorMarketDetailPage })))

// Promoter pages - lazy loaded
const PromoterDashboardPage = React.lazy(() => import('@/pages/promoter/PromoterDashboardPage').then(module => ({ default: module.PromoterDashboardPage })))
const PromoterMarketsPage = React.lazy(() => import('@/pages/promoter/PromoterMarketsPage').then(module => ({ default: module.PromoterMarketsPage })))
const PromoterApplicationsPage = React.lazy(() => import('@/pages/promoter/PromoterApplicationsPage').then(module => ({ default: module.PromoterApplicationsPage })))
const PromoterVendorsPage = React.lazy(() => import('@/pages/promoter/PromoterVendorsPage').then(module => ({ default: module.PromoterVendorsPage })))
const PromoterAnalyticsPage = React.lazy(() => import('@/pages/promoter/PromoterAnalyticsPage').then(module => ({ default: module.PromoterAnalyticsPage })))
const PromoterCalendarPage = React.lazy(() => import('@/pages/promoter/PromoterCalendarPage').then(module => ({ default: module.PromoterCalendarPage })))
const PromoterCreateMarketPage = React.lazy(() => import('@/pages/promoter/PromoterCreateMarketPage').then(module => ({ default: module.PromoterCreateMarketPage })))
const BusinessPlanningPage = React.lazy(() => import('@/pages/promoter/BusinessPlanningPage').then(module => ({ default: module.BusinessPlanningPage })))

// Vendor Market Creation - lazy loaded
const VendorCreateMarketPage = React.lazy(() => import('@/pages/vendors/VendorCreateMarketPage').then(module => ({ default: module.VendorCreateMarketPage })))

// Admin pages - lazy loaded
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })))
const AdminModerationPage = React.lazy(() => import('@/pages/admin/AdminModerationPage').then(module => ({ default: module.AdminModerationPage })))
const AdminUsersPage = React.lazy(() => import('@/pages/admin/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })))
const AdminAnalyticsPage = React.lazy(() => import('@/pages/admin/AdminAnalyticsPage').then(module => ({ default: module.AdminAnalyticsPage })))
const AdminSettingsPage = React.lazy(() => import('@/pages/admin/AdminSettingsPage').then(module => ({ default: module.AdminSettingsPage })))
const AdminMarketsPage = React.lazy(() => import('@/pages/admin/AdminMarketsPage').then(module => ({ default: module.AdminMarketsPage })))
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

      {/* Auth Routes */}
      <Route path="/auth/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/auth/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
      <Route path="/auth/forgot-password" element={<AuthLayout><PasswordRecoveryPage /></AuthLayout>} />
      <Route path="/auth/verify-email" element={<AuthLayout><EmailVerificationPage /></AuthLayout>} />

      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout><ProfilePage /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout><SettingsPage /></MainLayout>
        </ProtectedRoute>
      } />

      {/* Application Routes */}
      <Route path="/applications/:id" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <MainLayout><ApplicationDetailPage /></MainLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/markets/:id/apply" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <MainLayout><ApplicationFormPage /></MainLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Vendor Routes */}
      <Route path="/vendor/dashboard" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><VendorDashboardPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/applications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><MyApplicationsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/planning" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><BusinessPlanningPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/todos" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><VendorTodosPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/expenses" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><FinancialReportsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/calendar" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><MarketCalendarPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/add-market" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><AddMarketPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/add-market/vendor" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><VendorAddMarketForm /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/tracked-markets" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><VendorTrackedMarketsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/markets/:id" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'promoter', 'admin']}>
            <DashboardLayout role="vendor"><VendorMarketDetailPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Promoter Routes */}
      <Route path="/promoter/dashboard" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><PromoterDashboardPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/markets" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><PromoterMarketsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/markets/create" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><PromoterCreateMarketPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/applications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><PromoterApplicationsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/vendors" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><PromoterVendorsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/analytics" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><PromoterAnalyticsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/promoter/calendar" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['promoter', 'admin']}>
            <DashboardLayout role="promoter"><PromoterCalendarPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminDashboardPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminUsersPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/markets" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminMarketsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/applications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminApplicationsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/moderation" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminModerationPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/analytics" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminAnalyticsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminSettingsPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/support" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin"><AdminSupportPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Notifications Route */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['visitor', 'vendor', 'promoter', 'admin']}>
            <MainLayout><NotificationsPage /></MainLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* Generic Dashboard Route - Redirects to role-specific dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute requireEmailVerification={false}>
          <RoleRoute allowedRoles={['visitor', 'vendor', 'promoter', 'admin']} requireEmailVerification={false}>
            <DashboardRedirectPage />
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