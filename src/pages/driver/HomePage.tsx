import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverHeader from '../../components/driver/DriverHeader'
import ActivePickupCard from '../../components/driver/ActivePickupCard'
import PickupCallList from '../../components/driver/PickupCallList'
import DriverWeighStation from '../../components/driver/DriverWeighStation'
import DriverStats from '../../components/driver/DriverStats'

export interface PickupStop {
  id: number
  storeName: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  containerType: 'box' | 'bag'
  estimatedCount: number
  status: 'waiting' | 'arrived' | 'loaded' | 'completed'
  estimatedWeight?: number
}

export interface PickupCall {
  id: number
  storeName: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  distance: string
  containerType: 'box' | 'bag'
  count: number
  estimatedWeight?: number
  requestedTime: string
  isUrgent: boolean
}

const initialPickups: PickupStop[] = [
  {
    id: 1,
    storeName: '스타벅스 강남역점',
    storeType: 'starbucks',
    address: '서울 강남구 강남대로 396',
    containerType: 'box',
    estimatedCount: 5,
    status: 'arrived',
  },
  {
    id: 2,
    storeName: '스타벅스 역삼역점',
    storeType: 'starbucks',
    address: '서울 강남구 역삼로 180',
    containerType: 'box',
    estimatedCount: 3,
    status: 'waiting',
  },
  {
    id: 3,
    storeName: '블루보틀 삼성점',
    storeType: 'franchise',
    address: '서울 강남구 테헤란로 521',
    containerType: 'bag',
    estimatedCount: 2,
    estimatedWeight: 15,
    status: 'waiting',
  },
]

const initialCalls: PickupCall[] = [
  {
    id: 101,
    storeName: '스타벅스 선릉역점',
    storeType: 'starbucks',
    address: '서울 강남구 선릉로 525',
    distance: '2.3km',
    containerType: 'box',
    count: 4,
    requestedTime: '오후 3:00 ~ 4:00',
    isUrgent: true,
  },
  {
    id: 102,
    storeName: '커피랑도서관 서초점',
    storeType: 'individual',
    address: '서울 서초구 서초대로 301',
    distance: '3.8km',
    containerType: 'bag',
    count: 3,
    estimatedWeight: 20,
    requestedTime: '오후 4:00 ~ 5:00',
    isUrgent: false,
  },
  {
    id: 103,
    storeName: '스타벅스 대치역점',
    storeType: 'starbucks',
    address: '서울 강남구 삼성로 510',
    distance: '4.1km',
    containerType: 'box',
    count: 6,
    requestedTime: '오후 5:00 ~ 6:00',
    isUrgent: false,
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [activePickups, setActivePickups] = useState<PickupStop[]>(initialPickups)
  const [calls, setCalls] = useState<PickupCall[]>(initialCalls)

  /* 수거확인 클릭 → 해당 매장의 수거확인 페이지로 이동 */
  const handlePickupConfirm = (stopId: number) => {
    navigate(`/driver/pickup/${stopId}`)
  }

  /* 콜 수락 → 대기 중인 콜에서 제거 + 진행 중인 수거에 추가 */
  const handleAcceptCall = (callId: number) => {
    const call = calls.find(c => c.id === callId)
    if (!call) return

    const newStop: PickupStop = {
      id: call.id,
      storeName: call.storeName,
      storeType: call.storeType,
      address: call.address,
      containerType: call.containerType,
      estimatedCount: call.count,
      estimatedWeight: call.estimatedWeight,
      status: 'waiting',
    }

    setCalls(prev => prev.filter(c => c.id !== callId))
    setActivePickups(prev => [...prev, newStop])
  }

  /* 콜 거절 → 대기 중인 콜에서 제거 */
  const handleDeclineCall = (callId: number) => {
    setCalls(prev => prev.filter(c => c.id !== callId))
  }

  return (
    <>
      <DriverHeader />
      <ActivePickupCard
        pickups={activePickups}
        onPickupConfirm={handlePickupConfirm}
      />
      <PickupCallList
        calls={calls}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
      <DriverWeighStation />
      <DriverStats />
    </>
  )
}
