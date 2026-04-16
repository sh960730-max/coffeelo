import { Link } from 'react-router-dom'
import Header from '../../components/Header'
import PickupStatusCard from '../../components/PickupStatusCard'
import PickupRequestButton from '../../components/PickupRequestButton'
import CarbonDashboard from '../../components/CarbonDashboard'
import { useFCM } from '../../hooks/useFCM'

export default function CafeHomePage() {
  useFCM('cafes')
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
