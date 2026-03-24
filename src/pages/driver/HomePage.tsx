import { useNavigate } from 'react-router-dom'
import DriverHeader from '../../components/driver/DriverHeader'
import ActivePickupCard from '../../components/driver/ActivePickupCard'
import PickupCallList from '../../components/driver/PickupCallList'
import DriverWeighStation from '../../components/driver/DriverWeighStation'
import DriverStats from '../../components/driver/DriverStats'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <>
      <DriverHeader />
      <ActivePickupCard onPickupConfirm={() => navigate('/driver/pickup/p1')} />
      <PickupCallList />
      <DriverWeighStation />
      <DriverStats />
    </>
  )
}
