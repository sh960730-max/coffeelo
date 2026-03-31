import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Driver
import DriverLayout from './pages/driver/DriverLayout'
import DriverHomePage from './pages/driver/HomePage'
import PickupListPage from './pages/driver/PickupListPage'
import WeighPage from './pages/driver/WeighPage'
import SettlementPage from './pages/driver/SettlementPage'
import DriverMorePage from './pages/driver/MorePage'
import PickupConfirm from './pages/PickupConfirm'
import DriverProfileEditPage from './pages/driver/ProfileEditPage'
import DriverVehicleInfoPage from './pages/driver/VehicleInfoPage'
import DriverNotificationPage from './pages/driver/NotificationPage'
import DriverAnnouncementPage from './pages/driver/AnnouncementPage'
import DriverFAQPage from './pages/driver/FAQPage'
import DriverInquiryPage from './pages/driver/InquiryPage'
import DriverTermsPage from './pages/driver/TermsPage'
import DriverPrivacyPage from './pages/driver/PrivacyPage'

// Cafe
import CafeLayout from './pages/cafe/CafeLayout'
import CafeHomePage from './pages/cafe/CafeHomePage'
import PickupRequestPage from './pages/cafe/PickupRequestPage'
import PickupHistoryPage from './pages/cafe/PickupHistoryPage'
import CafeSettlementPage from './pages/cafe/CafeSettlementPage'
import CafeMorePage from './pages/cafe/CafeMorePage'
import CafeStoreInfoPage from './pages/cafe/CafeStoreInfoPage'
import CafeNotificationPage from './pages/cafe/CafeNotificationPage'
import CafeAnnouncementPage from './pages/cafe/CafeAnnouncementPage'
import CafeFAQPage from './pages/cafe/CafeFAQPage'
import CafeInquiryPage from './pages/cafe/CafeInquiryPage'
import CafeTermsPage from './pages/cafe/CafeTermsPage'
import CafePrivacyPage from './pages/cafe/CafePrivacyPage'

// Company
import CompanyLayout from './pages/company/CompanyLayout'
import CompanyDashboard from './pages/company/CompanyDashboard'
import DriverManagePage from './pages/company/DriverManagePage'
import AllPickupsPage from './pages/company/AllPickupsPage'
import SettlementManagePage from './pages/company/SettlementManagePage'
import CafeManagePage from './pages/company/CafeManagePage'
import AnnouncementPage from './pages/company/AnnouncementPage'
import CompanyMorePage from './pages/company/CompanyMorePage'
import WeighRecordsPage from './pages/company/WeighRecordsPage'
import CompanyInfoPage from './pages/company/CompanyInfoPage'
import NotificationSettingPage from './pages/company/NotificationSettingPage'
import TermsPage from './pages/company/TermsPage'
import PrivacyPage from './pages/company/PrivacyPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, isLoading, role } = useAuth()
  const defaultRoute = role === 'cafe' ? '/cafe' : role === 'company' ? '/company' : '/driver'
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-eco-green/30 border-t-eco-green rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && role !== requiredRole) return <Navigate to={defaultRoute} replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, isLoading, role } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eco-green flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-sm mt-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인 후 역할별 리다이렉트
  const defaultRoute = role === 'cafe' ? '/cafe' : role === 'company' ? '/company' : '/driver'

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <SignupPage />}
      />

      {/* 기사용 */}
      <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><DriverLayout /></ProtectedRoute>}>
        <Route index element={<DriverHomePage />} />
        <Route path="pickups" element={<PickupListPage />} />
        <Route path="weigh" element={<WeighPage />} />
        <Route path="settlement" element={<SettlementPage />} />
        <Route path="more" element={<DriverMorePage />} />
        <Route path="pickup/:id" element={<PickupConfirm />} />
        <Route path="profile-edit" element={<DriverProfileEditPage />} />
        <Route path="vehicle-info" element={<DriverVehicleInfoPage />} />
        <Route path="notifications" element={<DriverNotificationPage />} />
        <Route path="announcements" element={<DriverAnnouncementPage />} />
        <Route path="faq" element={<DriverFAQPage />} />
        <Route path="inquiry" element={<DriverInquiryPage />} />
        <Route path="terms" element={<DriverTermsPage />} />
        <Route path="privacy" element={<DriverPrivacyPage />} />
      </Route>

      {/* 점주용 */}
      <Route path="/cafe" element={<ProtectedRoute requiredRole="cafe"><CafeLayout /></ProtectedRoute>}>
        <Route index element={<CafeHomePage />} />
        <Route path="request" element={<PickupRequestPage />} />
        <Route path="history" element={<PickupHistoryPage />} />
        <Route path="settlement" element={<CafeSettlementPage />} />
        <Route path="more" element={<CafeMorePage />} />
        <Route path="store-info" element={<CafeStoreInfoPage />} />
        <Route path="notifications" element={<CafeNotificationPage />} />
        <Route path="announcements" element={<CafeAnnouncementPage />} />
        <Route path="faq" element={<CafeFAQPage />} />
        <Route path="inquiry" element={<CafeInquiryPage />} />
        <Route path="terms" element={<CafeTermsPage />} />
        <Route path="privacy" element={<CafePrivacyPage />} />
      </Route>

      {/* 소속회사 관리자 */}
      <Route path="/company" element={<ProtectedRoute requiredRole="company"><CompanyLayout /></ProtectedRoute>}>
        <Route index element={<CompanyDashboard />} />
        <Route path="drivers" element={<DriverManagePage />} />
        <Route path="pickups" element={<AllPickupsPage />} />
        <Route path="settlements" element={<SettlementManagePage />} />
        <Route path="cafes" element={<CafeManagePage />} />
        <Route path="announcements" element={<AnnouncementPage />} />
        <Route path="more" element={<CompanyMorePage />} />
        <Route path="weigh-records" element={<WeighRecordsPage />} />
        <Route path="info" element={<CompanyInfoPage />} />
        <Route path="notifications" element={<NotificationSettingPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? defaultRoute : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
