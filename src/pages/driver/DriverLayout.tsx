import { Outlet } from 'react-router-dom'
import DriverBottomNavRouter from '../../components/driver/DriverBottomNavRouter'

export default function DriverLayout() {
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <main className="pb-20">
        <Outlet />
      </main>
      <DriverBottomNavRouter />
    </div>
  )
}
