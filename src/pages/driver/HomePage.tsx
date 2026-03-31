import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverHeader from '../../components/driver/DriverHeader'
import ActivePickupCard from '../../components/driver/ActivePickupCard'
import PickupCallList from '../../components/driver/PickupCallList'
import DriverWeighStation from '../../components/driver/DriverWeighStation'
import DriverStats from '../../components/driver/DriverStats'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export interface PickupStop {
  id: string
  storeName: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  containerType: 'box' | 'bag'
  estimatedCount: number
  status: 'waiting' | 'arrived' | 'loaded' | 'completed'
  estimatedWeight?: number
}

export interface PickupCall {
  id: string
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

const mapStoreType = (type: string): 'starbucks' | 'franchise' | 'individual' => {
  if (type === 'STARBUCKS') return 'starbucks'
  if (type === 'FRANCHISE') return 'franchise'
  return 'individual'
}

const mapStatus = (status: string): 'waiting' | 'arrived' | 'loaded' | 'completed' => {
  if (status === 'ARRIVED') return 'arrived'
  if (status === 'LOADED') return 'loaded'
  if (status === 'COMPLETED') return 'completed'
  return 'waiting'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const driverId = (user as any)?.id

  const [activePickups, setActivePickups] = useState<PickupStop[]>([])
  const [calls, setCalls] = useState<PickupCall[]>([])

  const loadData = useCallback(async () => {
    if (!driverId) return
    const db = supabase as any

    // 진행 중인 수거 (이 기사에게 배정된)
    const { data: active } = await db
      .from('pickups')
      .select('*, cafe:cafes(name, address, store_type, phone)')
      .eq('driver_id', driverId)
      .in('status', ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'LOADED'])
      .order('created_at', { ascending: true })

    if (active) {
      setActivePickups(active.map((p: any) => ({
        id: p.id,
        storeName: p.cafe?.name ?? '알 수 없음',
        storeType: mapStoreType(p.cafe?.store_type || 'INDIVIDUAL'),
        address: p.cafe?.address ?? '-',
        containerType: (p.container_type === 'BAG' ? 'bag' : 'box') as 'box' | 'bag',
        estimatedCount: p.quantity ?? 0,
        status: mapStatus(p.status),
      })))
    }

    // 담당 카페 ID 목록
    const { data: assignedCafes } = await db
      .from('cafes')
      .select('id')
      .eq('driver_id', driverId)
      .eq('status', 'APPROVED')

    const assignedCafeIds = (assignedCafes || []).map((c: any) => c.id)

    // 대기 중인 콜 (담당 카페의 미배정 수거 요청)
    const pendingQuery = db
      .from('pickups')
      .select('*, cafe:cafes(name, address, store_type)')
      .eq('status', 'REQUESTED')
      .order('requested_at', { ascending: false })

    const { data: pending } = assignedCafeIds.length > 0
      ? await pendingQuery.in('cafe_id', assignedCafeIds)
      : await pendingQuery

    if (pending) {
      setCalls(pending.map((p: any) => ({
        id: p.id,
        storeName: p.cafe?.name ?? '알 수 없음',
        storeType: mapStoreType(p.cafe?.store_type ?? 'INDIVIDUAL'),
        address: p.cafe?.address ?? '-',
        distance: '-',
        containerType: 'box' as const,
        count: p.quantity ?? 0,
        estimatedWeight: p.estimated_weight ?? null,
        requestedTime: p.requested_at
          ? new Date(p.requested_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '-',
        isUrgent: false,
      })))
    }
  }, [driverId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePickupConfirm = (stopId: string) => {
    navigate(`/driver/pickup/${stopId}`)
  }

  const handleAcceptCall = async (callId: string) => {
    if (!driverId) return
    const db = supabase as any
    await db.from('pickups').update({ driver_id: driverId, status: 'ASSIGNED' }).eq('id', callId)
    await loadData()
  }

  const handleDeclineCall = (callId: string) => {
    setCalls(prev => prev.filter(c => c.id !== callId))
  }

  return (
    <>
      <DriverHeader />
      <ActivePickupCard pickups={activePickups} onPickupConfirm={handlePickupConfirm} />
      <PickupCallList calls={calls} onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
      <DriverWeighStation />
      <DriverStats />
    </>
  )
}
