import { Outlet } from 'react-router-dom'
import CafeBottomNavRouter from '../../components/cafe/CafeBottomNavRouter'

export default function CafeLayout() {
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <main className="pb-20">
        <Outlet />
      </main>
      <CafeBottomNavRouter />
    </div>
  )
}
