import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import LoginPage from './pages/LoginPage'
import CafeHome from './pages/CafeHome'
import DriverLayout from './pages/driver/DriverLayout'
import HomePage from './pages/driver/HomePage'
import PickupListPage from './pages/driver/PickupListPage'
import WeighPage from './pages/driver/WeighPage'
import SettlementPage from './pages/driver/SettlementPage'
import MorePage from './pages/driver/MorePage'
import PickupConfirm from './pages/PickupConfirm'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

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

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/driver" replace /> : <LoginPage />}
      />

      {/* 기사용 */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute>
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="pickups" element={<PickupListPage />} />
        <Route path="weigh" element={<WeighPage />} />
        <Route path="settlement" element={<SettlementPage />} />
        <Route path="more" element={<MorePage />} />
        <Route path="pickup/:id" element={<PickupConfirm onBack={undefined as any} />} />
      </Route>

      {/* 카페 점주용 */}
      <Route
        path="/cafe"
        element={
          <ProtectedRoute>
            <CafeHome />
          </ProtectedRoute>
        }
      />

      {/* 기본 리다이렉트 */}
      <Route path="*" element={<Navigate to="/driver" replace />} />
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
