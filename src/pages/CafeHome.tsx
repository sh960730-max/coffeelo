import Header from '../components/Header'
import PickupStatusCard from '../components/PickupStatusCard'
import PickupRequestButton from '../components/PickupRequestButton'
import CarbonDashboard from '../components/CarbonDashboard'
import BottomNav from '../components/BottomNav'

export default function CafeHome() {
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <Header />
      <main className="overflow-y-auto">
        <PickupStatusCard />
        <PickupRequestButton />
        <CarbonDashboard />
      </main>
      <BottomNav />
    </div>
  )
}
