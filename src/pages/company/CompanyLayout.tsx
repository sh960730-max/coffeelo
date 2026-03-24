import { Outlet } from 'react-router-dom'
import CompanyBottomNavRouter from '../../components/company/CompanyBottomNavRouter'

export default function CompanyLayout() {
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <main className="pb-20">
        <Outlet />
      </main>
      <CompanyBottomNavRouter />
    </div>
  )
}
