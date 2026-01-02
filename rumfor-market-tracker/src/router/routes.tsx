
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

// Page imports
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { PasswordRecoveryPage } from '@/pages/auth/PasswordRecoveryPage'
import { EmailVerificationPage } from '@/pages/auth/EmailVerificationPage'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Vendor pages
import { VendorDashboardPage } from '@/pages/vendor/VendorDashboardPage'
import { BusinessPlanningPage } from '@/pages/vendor/BusinessPlanningPage'
import { FinancialReportsPage } from '@/pages/vendor/FinancialReportsPage'
import { MarketCalendarPage } from '@/pages/vendor/MarketCalendarPage'

// Promoter pages
import { PromoterDashboardPage } from '@/pages/promoter/PromoterDashboardPage'
import { PromoterMarketsPage } from '@/pages/promoter/PromoterMarketsPage'
import { PromoterApplicationsPage } from '@/pages/promoter/PromoterApplicationsPage'
import { PromoterVendorsPage } from '@/pages/promoter/PromoterVendorsPage'
import { PromoterAnalyticsPage } from '@/pages/promoter/PromoterAnalyticsPage'
import { PromoterCalendarPage } from '@/pages/promoter/PromoterCalendarPage'

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminModerationPage } from '@/pages/admin/AdminModerationPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AdminMarketsPage } from '@/pages/admin/AdminMarketsPage'
import { AdminApplicationsPage } from '@/pages/admin/AdminApplicationsPage'
import { AdminSupportPage } from '@/pages/admin/AdminSupportPage'

// Market pages
import { MarketSearchPage } from '@/pages/markets/MarketSearchPage'
import { MarketDetailPage } from '@/pages/markets/MarketDetailPage'

// Application pages
import { MyApplicationsPage, ApplicationDetailPage, ApplicationFormPage } from '@/pages/applications'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/markets" element={<MainLayout><MarketSearchPage /></MainLayout>} />
      <Route path="/markets/:id" element={<MainLayout><MarketDetailPage /></MainLayout>} />
      <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />

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
          <RoleRoute allowedRoles={['vendor', 'admin']}>
            <DashboardLayout role="vendor"><BusinessPlanningPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/todos" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'admin']}>
            <DashboardLayout role="vendor"><BusinessPlanningPage /></DashboardLayout>
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/vendor/expenses" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['vendor', 'admin']}>
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
        <ProtectedRoute>
          <RoleRoute allowedRoles={['visitor', 'vendor', 'promoter', 'admin']}>
            <div>Dashboard - Redirecting...</div>
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