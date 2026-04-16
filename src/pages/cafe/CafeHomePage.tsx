import { Link } from 'react-router-dom'
import Header from '../../components/Header'
import PickupStatusCard from '../../components/PickupStatusCard'
import PickupRequestButton from '../../components/PickupRequestButton'
import CarbonDashboard from '../../components/CarbonDashboard'

export default function CafeHomePage() {
  return (
    <>
      <Header />
      <PickupStatusCard />
      <Link to="/cafe/request">
        <PickupRequestButton />
      </Link>
      <CarbonDashboard />
    </>
  )
}
