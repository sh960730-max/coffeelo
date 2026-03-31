import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Filter, ArrowUpDown, CheckCircle2, Clock, Truck,
  AlertTriangle, ChevronDown, ChevronUp, Scale, Store, Package, Loader2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

type DateFilter = 'today' | 'week' | 'month'

const statusBadge: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: '완료', color: 'bg-eco-green-100 text-eco-green' },
  EN_ROUTE:  { label: '운송중', color: 'bg-amber-50 text-amber-600' },
  ASSIGNED:  { label: '배정', color: 'bg-blue-50 text-blue-600' },
  ARRIVED:   { label: '도착', color: 'bg-purple-50 text-purple-600' },
  LOADED:    { label: '상차', color: 'bg-orange-50 text-orange-600' },
  REQUESTED: { label: '대기', color: 'bg-gray-100 text-gray-500' },
  CANCELLED: { label: '취소', color: 'bg-red-50 text-red-400' },
}

function getDiscrepancy(a: number | null, b: number | null) {
  if (!a || !b) return null
  const pct = ((b - a) / a) * 100
  const absPct = Math.abs(pct)
  const color = absPct > 10 ? 'text-red-500' : absPct > 5 ? 'text-amber-500' : 'text-eco-green'
  return { pct, color }
}

export default function AllPickupsPage() {
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? ''

  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [selectedDriver, setSelectedDriver] = useState('전체')
  const [selectedCafe, setSelectedCafe] = useState('전체')
  const [showCrossCheck, setShowCrossCheck] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pickups, setPickups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [driverList, setDriverList] = useState<string[]>(['전체'])
  const [cafeList, setCafeList] = useState<string[]>(['전체'])

  useEffect(() => {
    if (!companyName) return
    const db = supabase as any
    const load = async () => {
      setLoading(true)
      const now = new Date()
      let fromDate: string

      if (dateFilter === 'today') {
        fromDate = now.toISOString().split('T')[0] + 'T00:00:00'
      } else if (dateFilter === 'week') {
        const dow = now.getDay()
        const mon = new Date(now)
        mon.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow))
        mon.setHours(0, 0, 0, 0)
        fromDate = mon.toISOString()
      } else {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      }

      // 소속 기사 목록
      const { data: drivers } = await db.from('drivers').select('id, name').eq('company', companyName)
      const driverMap: Record<string, string> = {}
      ;(drivers || []).forEach((d: any) => { driverMap[d.id] = d.name })

      // 소속 카페 ID 목록 (company 기준으로 수거 전체 조회)
      const { data: cafes } = await db.from('cafes').select('id').eq('company', companyName)
      if (!cafes || cafes.length === 0) { setPickups([]); setLoading(false); return }
      const cafeIds = cafes.map((c: any) => c.id)

      const { data } = await db.from('pickups')
        .select('*, cafe:cafes(name, address, store_type)')
        .in('cafe_id', cafeIds)
        .gte('created_at', fromDate)
        .order('created_at', { ascending: false })

      if (data) {
        const enriched = data.map((p: any) => ({
          ...p,
          driverName: p.driver_id ? (driverMap[p.driver_id] || '미배정') : '미배정',
        }))
        setPickups(enriched)

        const dNames = Array.from(new Set(enriched.map((p: any) => p.driverName))) as string[]
        const cNames = Array.from(new Set(enriched.filter((p: any) => p.cafe?.name).map((p: any) => p.cafe.name))) as string[]
        setDriverList(['전체', ...dNames])
        setCafeList(['전체', ...cNames])
      }
      setLoading(false)
    }
    load()
  }, [companyName, dateFilter])

  const filtered = pickups.filter(p => {
    if (selectedDriver !== '전체' && p.driverName !== selectedDriver) return false
    if (selectedCafe !== '전체' && p.cafe?.name !== selectedCafe) return false
    return true
  })

  const completedWithWeight = filtered.filter(p => p.status === 'COMPLETED' && p.total_weight)
  const totalStoreEst = completedWithWeight.reduce((s, p) => s + (p.estimated_weight || 0), 0)
  const totalDriverW = completedWithWeight.reduce((s, p) => s + (p.total_weight || 0), 0)

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-3">수거 현황</h1>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          {(['today', 'week', 'month'] as DateFilter[]).map(f => (
            <motion.button
              key={f} whileTap={{ scale: 0.95 }}
              onClick={() => setDateFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                dateFilter === f ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f === 'today' ? '오늘' : f === 'week' ? '이번 주' : '이번 달'}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
            className="text-[11px] font-medium px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 outline-none">
            {driverList.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={selectedCafe} onChange={e => setSelectedCafe(e.target.value)}
            className="text-[11px] font-medium px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 outline-none">
            {cafeList.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </header>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : (
          <>
            {/* 크로스체크 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <button onClick={() => setShowCrossCheck(prev => !prev)}
                className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-eco-green to-coffee-brown rounded-lg flex items-center justify-center">
                    <ArrowUpDown className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-gray-800">3자 중량 크로스체크</h2>
                    <p className="text-[10px] text-gray-400">매장 예상 vs 기사 실측</p>
                  </div>
                </div>
                {showCrossCheck ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              <AnimatePresence>
                {showCrossCheck && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-eco-green/5 to-coffee-brown/5 rounded-xl p-3 mb-3 border border-eco-green/10">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-gray-400 mb-0.5">매장 예상 합계</p>
                          <p className="text-sm font-bold text-gray-800">{totalStoreEst.toFixed(1)}kg</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 mb-0.5">기사 실측 합계</p>
                          <p className="text-sm font-bold text-eco-green">{totalDriverW.toFixed(1)}kg</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                      <div className="grid grid-cols-[1fr_60px_60px_44px] gap-1 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
                        <span className="text-[10px] font-semibold text-gray-500">매장</span>
                        <span className="text-[10px] font-semibold text-gray-500 text-center">예상</span>
                        <span className="text-[10px] font-semibold text-gray-500 text-center">실측</span>
                        <span className="text-[10px] font-semibold text-gray-500 text-center">오차</span>
                      </div>
                      {filtered.filter(p => p.status === 'COMPLETED').map((p, idx) => {
                        const disc = getDiscrepancy(p.estimated_weight, p.total_weight)
                        return (
                          <motion.div key={p.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                            className="grid grid-cols-[1fr_60px_60px_44px] gap-1 px-3 py-2.5 border-b border-gray-50 last:border-0 items-center"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-gray-800 truncate">{p.cafe?.name}</p>
                              <p className="text-[9px] text-gray-400 truncate">{p.driverName}</p>
                            </div>
                            <span className="text-[11px] text-gray-600 text-center">{p.estimated_weight ?? '-'}</span>
                            <span className="text-[11px] text-eco-green text-center font-bold">{p.total_weight ?? '-'}</span>
                            <div className="text-center">
                              {disc ? (
                                <span className={`text-[10px] font-bold ${disc.color}`}>
                                  {disc.pct > 0 ? '+' : ''}{disc.pct.toFixed(1)}%
                                </span>
                              ) : <Clock className="w-3 h-3 text-gray-300 mx-auto" />}
                            </div>
                          </motion.div>
                        )
                      })}
                      {filtered.filter(p => p.status === 'COMPLETED').length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400">완료된 수거가 없습니다</div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2.5">
                      {[['bg-eco-green','5% 이내'],['bg-amber-400','5~10%'],['bg-red-500','10% 초과']].map(([bg, label]) => (
                        <div key={label} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${bg}`} />
                          <span className="text-[9px] text-gray-400">{label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 수거 내역 */}
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-800">수거 내역</h2>
              <span className="text-[11px] text-gray-400 ml-auto">{filtered.length}건</span>
            </div>

            <div className="space-y-2">
              {filtered.map((p, idx) => {
                const badge = statusBadge[p.status] || statusBadge.REQUESTED
                const isExpanded = expandedId === p.id
                const disc = getDiscrepancy(p.estimated_weight, p.total_weight)
                const date = new Date(p.completed_at || p.created_at)
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`

                return (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.04 }}
                    className="bg-white rounded-xl shadow-card overflow-hidden"
                  >
                    <button onClick={() => setExpandedId(isExpanded ? null : p.id)} className="w-full px-4 py-3 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800 truncate">{p.cafe?.name || '매장 정보 없음'}</p>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${badge.color}`}>{badge.label}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Truck className="w-3 h-3 text-gray-300" />
                              <span className="text-[11px] text-gray-400">{p.driverName}</span>
                              {p.total_weight && <>
                                <span className="text-gray-200">·</span>
                                <span className="text-[11px] font-medium text-gray-600">{p.total_weight}kg</span>
                              </>}
                            </div>
                          </div>
                        </div>
                        {disc && (
                          <div className="flex-shrink-0 ml-2">
                            {Math.abs(disc.pct) > 5
                              ? <AlertTriangle className={`w-3.5 h-3.5 ${disc.color}`} />
                              : <CheckCircle2 className="w-3.5 h-3.5 text-eco-green" />}
                          </div>
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="border-t border-gray-100"
                        >
                          <div className="px-4 py-3">
                            <p className="text-[10px] text-gray-400 mb-2">중량 비교</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[9px] text-gray-400">매장 예상</p>
                                <p className="text-xs font-bold text-gray-700">{p.estimated_weight ?? '-'}kg</p>
                              </div>
                              <div className={`rounded-lg p-2 text-center ${p.total_weight ? 'bg-eco-green-100' : 'bg-gray-50'}`}>
                                <p className={`text-[9px] ${p.total_weight ? 'text-eco-green' : 'text-gray-400'}`}>기사 실측</p>
                                <p className={`text-xs font-bold ${p.total_weight ? 'text-eco-green' : 'text-gray-400'}`}>{p.total_weight ?? '미측정'}kg</p>
                              </div>
                            </div>
                            {disc && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] text-gray-400">오차율</span>
                                  <span className={`text-[10px] font-bold ${disc.color}`}>
                                    {disc.pct > 0 ? '+' : ''}{disc.pct.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (p.total_weight / p.estimated_weight) * 100)}%` }}
                                    transition={{ duration: 0.5 }}
                                    className={`h-full rounded-full ${
                                      Math.abs(disc.pct) > 10 ? 'bg-red-400' : Math.abs(disc.pct) > 5 ? 'bg-amber-400' : 'bg-eco-green'
                                    }`}
                                  />
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                              <span>{dateStr}</span>
                              <span className={`font-semibold px-1.5 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <Scale className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">수거 내역이 없습니다</p>
              </motion.div>
            )}
          </>
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}
