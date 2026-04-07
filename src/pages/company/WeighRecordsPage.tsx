import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Scale, Loader2, ChevronDown, ChevronUp, Truck, MapPin, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

type DriverRecord = {
  id: string
  name: string
  phone: string
  totalKg: number
  pickupCount: number
  pickups: PickupRecord[]
}

type PickupRecord = {
  id: string
  cafeName: string
  cafeAddress: string
  totalWeight: number
  completedAt: string
}

export default function WeighRecordsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? ''

  const [driverRecords, setDriverRecords] = useState<DriverRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [monthFilter, setMonthFilter] = useState<'all' | 'month'>('month')

  useEffect(() => {
    if (!companyName) return
    load()
  }, [companyName, monthFilter])

  const load = async () => {
    setLoading(true)
    const db = supabase as any

    // 소속 기사 조회
    const { data: drivers } = await db.from('drivers')
      .select('id, name, phone')
      .eq('company', companyName)
      .eq('status', 'APPROVED')
      .order('name')

    if (!drivers || drivers.length === 0) { setLoading(false); return }

    const driverIds = drivers.map((d: any) => d.id)

    // 완료된 픽업 조회 (가중치 있는 것만)
    let query = db.from('pickups')
      .select('id, driver_id, total_weight, completed_at, cafe_id')
      .in('driver_id', driverIds)
      .eq('status', 'COMPLETED')
      .not('total_weight', 'is', null)
      .gt('total_weight', 0)
      .order('completed_at', { ascending: false })

    if (monthFilter === 'month') {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      query = query.gte('completed_at', firstOfMonth)
    }

    const { data: pickups } = await query

    // 카페 정보 조회
    const cafeIds = [...new Set((pickups || []).map((p: any) => p.cafe_id).filter(Boolean))]
    const cafeMap: Record<string, { name: string; address: string }> = {}
    if (cafeIds.length > 0) {
      const { data: cafes } = await db.from('cafes').select('id, name, address').in('id', cafeIds)
      if (cafes) cafes.forEach((c: any) => { cafeMap[c.id] = { name: c.name, address: c.address } })
    }

    // 기사별로 그룹핑
    const records: DriverRecord[] = drivers.map((d: any) => {
      const driverPickups = (pickups || [])
        .filter((p: any) => p.driver_id === d.id)
        .map((p: any) => ({
          id: p.id,
          cafeName: cafeMap[p.cafe_id]?.name ?? '알 수 없음',
          cafeAddress: cafeMap[p.cafe_id]?.address ?? '',
          totalWeight: p.total_weight ?? 0,
          completedAt: p.completed_at,
        }))

      return {
        id: d.id,
        name: d.name,
        phone: d.phone,
        totalKg: driverPickups.reduce((s: number, p: PickupRecord) => s + p.totalWeight, 0),
        pickupCount: driverPickups.length,
        pickups: driverPickups,
      }
    }).filter((d: DriverRecord) => d.pickupCount > 0)

    setDriverRecords(records)
    setLoading(false)
  }

  const totalKg = driverRecords.reduce((s, d) => s + d.totalKg, 0)
  const totalCount = driverRecords.reduce((s, d) => s + d.pickupCount, 0)

  const formatDate = (iso: string) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">기사별 수거 기록</h1>
      </header>

      <div className="px-5 py-4">
        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          {(['month', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setMonthFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                monthFilter === f ? 'bg-eco-green text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {f === 'month' ? '이번 달' : '전체'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card mb-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">{monthFilter === 'month' ? '이번 달' : '전체'} 수거 기록</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalKg.toLocaleString()} kg</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-white/60">총 {totalCount}건</p>
                <p className="text-xs text-white/60">기사 {driverRecords.length}명</p>
              </div>
            </motion.div>

            {driverRecords.length === 0 ? (
              <div className="text-center py-16">
                <Scale className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">수거 기록이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {driverRecords.map((driver, idx) => {
                  const isExpanded = expandedId === driver.id
                  return (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl shadow-card overflow-hidden"
                    >
                      {/* 기사 헤더 */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : driver.id)}
                        className="w-full px-4 py-3.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-eco-green-100 rounded-xl flex items-center justify-center">
                            <Truck className="w-5 h-5 text-eco-green" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800">{driver.name}</p>
                            <p className="text-[11px] text-gray-400">{driver.pickupCount}건 수거</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-eco-green">{driver.totalKg.toLocaleString()} kg</p>
                            <p className="text-[10px] text-gray-400">총 수거량</p>
                          </div>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-300 ml-1" />
                            : <ChevronDown className="w-4 h-4 text-gray-300 ml-1" />
                          }
                        </div>
                      </button>

                      {/* 픽업 상세 목록 */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            <div className="px-4 py-3 space-y-2">
                              {driver.pickups.map((p) => (
                                <div key={p.id} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{p.cafeName}</p>
                                    {p.cafeAddress && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" />
                                        <p className="text-[10px] text-gray-400 truncate">{p.cafeAddress}</p>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Calendar className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" />
                                      <p className="text-[10px] text-gray-400">{formatDate(p.completedAt)}</p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold text-eco-green ml-3 flex-shrink-0">
                                    {p.totalWeight.toLocaleString()} kg
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
