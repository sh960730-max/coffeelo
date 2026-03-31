import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, ChevronDown, ChevronUp, Package, Scale,
  Clock, CheckCircle2, XCircle, Truck, Coffee, Loader2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface CafePickupRecord {
  id: string
  createdAt: string
  completedAt: string | null
  status: string
  estimatedWeight: number
  actualWeight: number | null
  driverName: string | null
  notes: string | null
  settlementAmount: number | null
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  REQUESTED:  { label: '미배정',   color: 'text-amber-600',  bgColor: 'bg-amber-50',      icon: Clock },
  ASSIGNED:   { label: '기사 배정', color: 'text-blue-600',   bgColor: 'bg-blue-50',       icon: Truck },
  EN_ROUTE:   { label: '이동 중',  color: 'text-eco-green',  bgColor: 'bg-eco-green-100', icon: Truck },
  ARRIVED:    { label: '도착',     color: 'text-eco-green',  bgColor: 'bg-eco-green-100', icon: Truck },
  LOADED:     { label: '수거 중',  color: 'text-eco-green',  bgColor: 'bg-eco-green-100', icon: Truck },
  COMPLETED:  { label: '완료',     color: 'text-green-600',  bgColor: 'bg-green-50',      icon: CheckCircle2 },
  CANCELLED:  { label: '취소',     color: 'text-red-500',    bgColor: 'bg-red-50',        icon: XCircle },
}

const dateFilters = [
  { key: 'today', label: '오늘' },
  { key: 'week',  label: '이번 주' },
  { key: 'month', label: '이번 달' },
  { key: 'all',   label: '전체' },
]

const dayNames = ['일', '월', '화', '수', '목', '금', '토']

function getDateRange(filter: string): { from: string | null; to: string | null } {
  const now = new Date()
  if (filter === 'today') {
    const from = new Date(now); from.setHours(0, 0, 0, 0)
    const to   = new Date(now); to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }
  if (filter === 'week') {
    const day  = now.getDay()
    const from = new Date(now); from.setDate(now.getDate() - day); from.setHours(0, 0, 0, 0)
    const to   = new Date(now); to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }
  if (filter === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to   = new Date(now); to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }
  return { from: null, to: null }
}

export default function PickupHistoryPage() {
  const { user } = useAuth()
  const cafeId = (user as any)?.id

  const [dateFilter, setDateFilter] = useState('month')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pickups, setPickups] = useState<CafePickupRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cafeId) return
    fetchPickups()
  }, [cafeId, dateFilter])

  const fetchPickups = async () => {
    setLoading(true)
    const db = supabase as any
    const { from, to } = getDateRange(dateFilter)

    let query = db
      .from('pickups')
      .select('id, status, estimated_weight, total_weight, created_at, completed_at, notes, drivers(name), settlements(amount)')
      .eq('cafe_id', cafeId)
      .order('created_at', { ascending: false })

    if (from) query = query.gte('created_at', from)
    if (to)   query = query.lte('created_at', to)

    const { data } = await query

    if (data) {
      setPickups(data.map((p: any) => ({
        id: p.id,
        createdAt: p.created_at,
        completedAt: p.completed_at ?? null,
        status: p.status,
        estimatedWeight: p.estimated_weight ?? 0,
        actualWeight: p.total_weight ?? null,
        driverName: p.drivers?.name ?? null,
        notes: p.notes ?? null,
        // settlements가 배열인 경우 첫 번째, 없으면 total_weight * 80
        settlementAmount: p.settlements?.[0]?.amount
          ?? (p.total_weight ? Math.round(p.total_weight * 80) : null),
      })))
    }
    setLoading(false)
  }

  // 요약 통계
  const completedPickups = pickups.filter(p => p.status === 'COMPLETED')
  const totalWeight = completedPickups.reduce((s, p) => s + (p.actualWeight || 0), 0)
  const totalSettlement = completedPickups.reduce((s, p) => s + (p.settlementAmount || 0), 0)

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">수거 내역</h1>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {dateFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === f.key ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            기간선택
          </button>
        </div>
      </header>

      <div className="px-5 py-4">
        {/* 요약 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2.5 mb-5"
        >
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <div className="w-9 h-9 bg-eco-green-100 rounded-lg flex items-center justify-center mx-auto">
              <Package className="w-4.5 h-4.5 text-eco-green" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">{completedPickups.length}건</p>
            <p className="text-[10px] text-gray-400">수거 완료</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mx-auto">
              <Scale className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">{totalWeight}kg</p>
            <p className="text-[10px] text-gray-400">총 수거량</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mx-auto">
              <Coffee className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">
              {totalSettlement >= 10000
                ? `${(totalSettlement / 10000).toFixed(1)}만`
                : `${totalSettlement.toLocaleString()}원`}
            </p>
            <p className="text-[10px] text-gray-400">절감 금액</p>
          </div>
        </motion.div>

        {/* 리스트 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {pickups.map((pickup, index) => {
                const isExpanded = expandedId === pickup.id
                const cfg = statusConfig[pickup.status] ?? statusConfig.REQUESTED
                const StatusIcon = cfg.icon
                const d = new Date(pickup.createdAt)
                const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
                const dayStr  = dayNames[d.getDay()]
                const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

                return (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="bg-white rounded-2xl shadow-card overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : pickup.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${cfg.bgColor} rounded-xl flex items-center justify-center`}>
                            <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              <span className="text-[10px] text-gray-400">{dateStr} ({dayStr})</span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 mt-1">
                              {pickup.notes || `예상 ${pickup.estimatedWeight}kg`}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{timeStr} 신청</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {pickup.actualWeight != null ? (
                            <p className="text-sm font-bold text-eco-green">{pickup.actualWeight}kg</p>
                          ) : (
                            <p className="text-sm font-medium text-gray-400">~{pickup.estimatedWeight}kg</p>
                          )}
                          {pickup.status === 'COMPLETED' && pickup.settlementAmount != null && (
                            <p className="text-[10px] text-amber-600 font-semibold">
                              {pickup.settlementAmount.toLocaleString()}원 절감
                            </p>
                          )}
                          <div className="mt-1">
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-gray-300 ml-auto" />
                              : <ChevronDown className="w-4 h-4 text-gray-300 ml-auto" />}
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100"
                        >
                          <div className="px-4 py-3 space-y-1">
                            <div className="flex items-center justify-between py-1.5">
                              <span className="text-xs text-gray-500">예상 수거량</span>
                              <span className="text-xs text-gray-700">{pickup.estimatedWeight}kg</span>
                            </div>
                            {pickup.actualWeight != null && (
                              <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                                <span className="text-xs text-gray-500">실제 수거량</span>
                                <span className="text-xs font-bold text-eco-green">{pickup.actualWeight}kg</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                              <span className="text-xs text-gray-500">수거 기사</span>
                              <span className="text-xs text-gray-700">{pickup.driverName ?? '미배정'}</span>
                            </div>
                            {pickup.status === 'COMPLETED' && pickup.settlementAmount != null && (
                              <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                                <span className="text-xs text-gray-500">폐기물 처리비 절감</span>
                                <span className="text-xs font-bold text-amber-600">
                                  {pickup.settlementAmount.toLocaleString()}원
                                </span>
                              </div>
                            )}
                            {pickup.notes && (
                              <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                                <span className="text-xs text-gray-500">메모</span>
                                <span className="text-xs text-gray-600">{pickup.notes}</span>
                              </div>
                            )}
                            {pickup.completedAt && (
                              <div className="pt-2 border-t border-gray-100">
                                <span className="text-[11px] text-eco-green">
                                  완료: {new Date(pickup.completedAt).toLocaleString('ko-KR', {
                                    month: 'numeric', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {pickups.length === 0 && (
              <div className="text-center py-20">
                <Coffee className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-400 mt-3">수거 내역이 없습니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
