import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle2, Clock, User, XCircle, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface PickupItem {
  id: string
  status: 'pending' | 'assigned' | 'inProgress' | 'completed' | 'cancelled'
  time: string
  driverName?: string
  bags: number
}

const statusConfig = {
  pending:    { label: '접수됨',   color: 'bg-amber-500',   textColor: 'text-amber-600',    bgColor: 'bg-amber-50',      icon: Clock },
  assigned:   { label: '기사 배정', color: 'bg-blue-500',    textColor: 'text-blue-600',     bgColor: 'bg-blue-50',       icon: User },
  inProgress: { label: '수거 중',  color: 'bg-eco-green',   textColor: 'text-eco-green',    bgColor: 'bg-eco-green-100', icon: Truck },
  completed:  { label: '완료',     color: 'bg-green-500',   textColor: 'text-green-600',    bgColor: 'bg-green-50',      icon: CheckCircle2 },
  cancelled:  { label: '거절됨',   color: 'bg-red-400',     textColor: 'text-red-500',      bgColor: 'bg-red-50',        icon: XCircle },
}

const steps = ['pending', 'assigned', 'inProgress', 'completed'] as const

function mapStatus(dbStatus: string): PickupItem['status'] {
  switch (dbStatus) {
    case 'REQUESTED': return 'pending'
    case 'ASSIGNED':  return 'assigned'
    case 'EN_ROUTE':
    case 'ARRIVED':
    case 'LOADED':    return 'inProgress'
    case 'COMPLETED': return 'completed'
    case 'CANCELLED': return 'cancelled'
    default:          return 'pending'
  }
}

function formatTime(createdAt: string) {
  const d = new Date(createdAt)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  const hh = h % 12 || 12
  return `${ampm} ${hh}:${m}`
}

function StatusStepper({ currentStatus }: { currentStatus: PickupItem['status'] }) {
  const currentIdx = steps.indexOf(currentStatus as any)
  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, idx) => {
        const isActive = idx <= currentIdx
        const config = statusConfig[step]
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${isActive ? config.color : 'bg-gray-200'}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {config.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PickupStatusCard() {
  const { user } = useAuth()
  const cafeId = (user as any)?.id
  const navigate = useNavigate()
  const [pickups, setPickups] = useState<PickupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [reapplying, setReapplying] = useState<string | null>(null)

  useEffect(() => {
    if (!cafeId) return
    fetchPickups()
  }, [cafeId])

  const fetchPickups = async () => {
    const db = supabase as any
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data } = await db
      .from('pickups')
      .select('id, status, estimated_weight, created_at, driver_id, drivers(name)')
      .eq('cafe_id', cafeId)
      .neq('status', 'COMPLETED')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (data) {
      setPickups(data.map((p: any) => ({
        id: p.id,
        status: mapStatus(p.status),
        time: formatTime(p.created_at),
        driverName: p.drivers?.name ?? undefined,
        bags: p.estimated_weight ?? 0,
      })))
    }
    setLoading(false)
  }

  const handleReapply = async (pickupId: string) => {
    setReapplying(pickupId)
    const db = supabase as any
    await db.from('pickups').update({
      status: 'REQUESTED',
      driver_id: null,
      updated_at: new Date().toISOString(),
    }).eq('id', pickupId)
    await fetchPickups()
    setReapplying(null)
  }

  if (loading) return null

  // 거절됨 외 진행중인 건만 카운트
  const activeCount = pickups.filter(p => p.status !== 'cancelled').length

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="px-5 mt-2"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">오늘 수거 예정</h2>
        <span className="text-xs font-semibold text-eco-green bg-eco-green-100 px-2.5 py-1 rounded-full">
          {activeCount}건
        </span>
      </div>

      {pickups.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-card text-center">
          <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">오늘 예정된 수거가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pickups.map((pickup, index) => {
            const config = statusConfig[pickup.status]
            const StatusIcon = config.icon
            const isCancelled = pickup.status === 'cancelled'

            return (
              <motion.div
                key={pickup.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className={`bg-white rounded-2xl p-4 shadow-card transition-shadow duration-300 ${isCancelled ? 'border border-red-100' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-semibold ${config.textColor} ${config.bgColor} px-2 py-0.5 rounded-full`}>
                        {config.label}
                      </span>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{pickup.time} 신청</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{pickup.driverName ?? '배정 대기'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Package className="w-3.5 h-3.5 text-coffee-brown/60" />
                      <span className="text-sm font-semibold text-coffee-brown">{pickup.bags}kg</span>
                    </div>
                  </div>
                </div>

                {isCancelled ? (
                  <div className="mt-3 pt-3 border-t border-red-50">
                    <p className="text-xs text-red-400 mb-2.5">담당 기사님이 수거를 거절했습니다.</p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleReapply(pickup.id)}
                      disabled={reapplying === pickup.id}
                      className="w-full py-2.5 bg-eco-green text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {reapplying === pickup.id ? '재신청 중...' : '다시 신청하기'}
                    </motion.button>
                  </div>
                ) : (
                  <StatusStepper currentStatus={pickup.status} />
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.section>
  )
}
