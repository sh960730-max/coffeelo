import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import LoginPage from './pages/LoginPage'

// Driver
import DriverLayout from './pages/driver/DriverLayout'
import DriverHomePage from './pages/driver/HomePage'
import PickupListPage from './pages/driver/PickupListPage'
import WeighPage from './pages/driver/WeighPage'
import SettlementPage from './pages/driver/SettlementPage'
import DriverMorePage from './pages/driver/MorePage'
import PickupConfirm from './pages/PickupConfirm'

// Cafe
import CafeLayout from './pages/cafe/CafeLayout'
import CafeHomePage from './pages/cafe/CafeHomePage'
import PickupRequestPage from './pages/cafe/PickupRequestPage'
import PickupHistoryPage from './pages/cafe/PickupHistoryPage'
import CafeSettlementPage from './pages/cafe/CafeSettlementPage'
import CafeMorePage from './pages/cafe/CafeMorePage'

// Company
import CompanyLayout from './pages/company/CompanyLayout'
import CompanyDashboard from './pages/company/CompanyDashboard'
import DriverManagePage from './pages/company/DriverManagePage'
import AllPickupsPage from './pages/company/AllPickupsPage'
import SettlementManagePage from './pages/company/SettlementManagePage'
import CafeManagePage from './pages/company/CafeManagePage'
import AnnouncementPage from './pages/company/AnnouncementPage'
import CompanyMorePage from './pages/company/CompanyMorePage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-eco-green/30 border-t-eco-green rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
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

      {/* 기사용 */}
      <Route path="/driver" element={<ProtectedRoute><DriverLayout /></ProtectedRoute>}>
        <Route index element={<DriverHomePage />} />
        <Route path="pickups" element={<PickupListPage />} />
        <Route path="weigh" element={<WeighPage />} />
        <Route path="settlement" element={<SettlementPage />} />
        <Route path="more" element={<DriverMorePage />} />
        <Route path="pickup/:id" element={<PickupConfirm />} />
      </Route>

      {/* 점주용 */}
      <Route path="/cafe" element={<ProtectedRoute><CafeLayout /></ProtectedRoute>}>
        <Route index element={<CafeHomePage />} />
        <Route path="request" element={<PickupRequestPage />} />
        <Route path="history" element={<PickupHistoryPage />} />
        <Route path="settlement" element={<CafeSettlementPage />} />
        <Route path="more" element={<CafeMorePage />} />
      </Route>

      {/* 소속회사 관리자 */}
      <Route path="/company" element={<ProtectedRoute><CompanyLayout /></ProtectedRoute>}>
        <Route index element={<CompanyDashboard />} />
        <Route path="drivers" element={<DriverManagePage />} />
        <Route path="pickups" element={<AllPickupsPage />} />
        <Route path="settlements" element={<SettlementManagePage />} />
        <Route path="cafes" element={<CafeManagePage />} />
        <Route path="announcements" element={<AnnouncementPage />} />
        <Route path="more" element={<CompanyMorePage />} />
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
