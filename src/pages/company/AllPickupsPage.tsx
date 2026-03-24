import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Filter, ArrowUpDown, CheckCircle2, Clock, Truck,
  AlertTriangle, ChevronDown, ChevronUp, Scale, Store, Package
} from 'lucide-react'

/* ── 더미 수거 데이터 ── */
const allPickups = [
  {
    id: 'ap1', cafeName: '스타벅스 강남역점', driverName: '박민수', date: '2026-03-24',
    containerCount: 3, storeEstimate: 45, driverWeight: 43.5, hubWeight: 44.2,
    status: 'completed' as const,
  },
  {
    id: 'ap2', cafeName: '블루보틀 삼성점', driverName: '김영호', date: '2026-03-24',
    containerCount: 2, storeEstimate: 30, driverWeight: 28.0, hubWeight: 27.5,
    status: 'completed' as const,
  },
  {
    id: 'ap3', cafeName: '스타벅스 역삼역점', driverName: '박민수', date: '2026-03-24',
    containerCount: 4, storeEstimate: 60, driverWeight: 55.0, hubWeight: 53.8,
    status: 'completed' as const,
  },
  {
    id: 'ap4', cafeName: '커피랑도서관 서초점', driverName: '이준혁', date: '2026-03-24',
    containerCount: 1, storeEstimate: 15, driverWeight: 14.5, hubWeight: 14.8,
    status: 'completed' as const,
  },
  {
    id: 'ap5', cafeName: '스타벅스 선릉역점', driverName: '최지훈', date: '2026-03-24',
    containerCount: 3, storeEstimate: 50, driverWeight: 48.0, hubWeight: null,
    status: 'in_transit' as const,
  },
  {
    id: 'ap6', cafeName: '이디야 역삼점', driverName: '김영호', date: '2026-03-23',
    containerCount: 2, storeEstimate: 25, driverWeight: 24.0, hubWeight: 23.5,
    status: 'completed' as const,
  },
  {
    id: 'ap7', cafeName: '스타벅스 강남역점', driverName: '박민수', date: '2026-03-23',
    containerCount: 3, storeEstimate: 40, driverWeight: 42.0, hubWeight: 41.5,
    status: 'completed' as const,
  },
  {
    id: 'ap8', cafeName: '블루보틀 삼성점', driverName: '이준혁', date: '2026-03-22',
    containerCount: 2, storeEstimate: 35, driverWeight: 30.0, hubWeight: 29.5,
    status: 'completed' as const,
  },
]

const drivers = ['전체', '박민수', '김영호', '이준혁', '최지훈']
const cafes = ['전체', '스타벅스 강남역점', '블루보틀 삼성점', '스타벅스 역삼역점', '커피랑도서관 서초점']

type DateFilter = 'today' | 'week' | 'month'

const statusBadge = {
  completed: { label: '완료', color: 'bg-eco-green-100 text-eco-green' },
  in_transit: { label: '운송중', color: 'bg-amber-50 text-amber-600' },
  pending: { label: '대기', color: 'bg-gray-100 text-gray-500' },
}

function getDiscrepancy(a: number | null, b: number | null): { pct: number; color: string } | null {
  if (a === null || b === null) return null
  const pct = ((b - a) / a) * 100
  const absPct = Math.abs(pct)
  let color = 'text-eco-green'
  if (absPct > 10) color = 'text-red-500'
  else if (absPct > 5) color = 'text-amber-500'
  return { pct, color }
}

export default function AllPickupsPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [selectedDriver, setSelectedDriver] = useState('전체')
  const [selectedCafe, setSelectedCafe] = useState('전체')
  const [showCrossCheck, setShowCrossCheck] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 필터링
  const filtered = allPickups.filter(p => {
    const today = '2026-03-24'
    if (dateFilter === 'today' && p.date !== today) return false
    if (dateFilter === 'week' && p.date < '2026-03-18') return false
    if (selectedDriver !== '전체' && p.driverName !== selectedDriver) return false
    if (selectedCafe !== '전체' && p.cafeName !== selectedCafe) return false
    return true
  })

  const completedWithHub = filtered.filter(p => p.hubWeight !== null)
  const totalStoreEst = completedWithHub.reduce((s, p) => s + p.storeEstimate, 0)
  const totalDriverW = completedWithHub.reduce((s, p) => s + p.driverWeight, 0)
  const totalHubW = completedWithHub.reduce((s, p) => s + (p.hubWeight || 0), 0)

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-3">수거 현황</h1>

        {/* 날짜 필터 */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          {(['today', 'week', 'month'] as DateFilter[]).map(f => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDateFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                dateFilter === f
                  ? 'bg-eco-green text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f === 'today' ? '오늘' : f === 'week' ? '이번 주' : '이번 달'}
            </motion.button>
          ))}
        </div>

        {/* 필터 칩 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <select
            value={selectedDriver}
            onChange={e => setSelectedDriver(e.target.value)}
            className="text-[11px] font-medium px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 outline-none"
          >
            {drivers.map(d => <option key={d}>{d}</option>)}
          </select>
          <select
            value={selectedCafe}
            onChange={e => setSelectedCafe(e.target.value)}
            className="text-[11px] font-medium px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 outline-none"
          >
            {cafes.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </header>

      <div className="px-5 py-4">
        {/* 크로스 체크 섹션 -- 핵심 기능 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <button
            onClick={() => setShowCrossCheck(prev => !prev)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-eco-green to-coffee-brown rounded-lg flex items-center justify-center">
                <ArrowUpDown className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-bold text-gray-800">3자 중량 크로스체크</h2>
                <p className="text-[10px] text-gray-400">매장 예상 vs 기사 측정 vs 집하장 실측</p>
              </div>
            </div>
            {showCrossCheck
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </button>

          <AnimatePresence>
            {showCrossCheck && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {/* 합계 요약 바 */}
                <div className="bg-gradient-to-r from-eco-green/5 to-coffee-brown/5 rounded-xl p-3 mb-3 border border-eco-green/10">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">매장 예상</p>
                      <p className="text-sm font-bold text-gray-800">{totalStoreEst.toFixed(1)}kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">기사 측정</p>
                      <p className="text-sm font-bold text-gray-800">{totalDriverW.toFixed(1)}kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">집하장 실측</p>
                      <p className="text-sm font-bold text-eco-green">{totalHubW.toFixed(1)}kg</p>
                    </div>
                  </div>
                </div>

                {/* 크로스체크 테이블 */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  {/* 테이블 헤더 */}
                  <div className="grid grid-cols-[1fr_repeat(3,56px)_44px] gap-1 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-500">매장</span>
                    <span className="text-[10px] font-semibold text-gray-500 text-center">매장</span>
                    <span className="text-[10px] font-semibold text-gray-500 text-center">기사</span>
                    <span className="text-[10px] font-semibold text-gray-500 text-center">집하장</span>
                    <span className="text-[10px] font-semibold text-gray-500 text-center">오차</span>
                  </div>

                  {/* 테이블 바디 */}
                  {filtered.map((pickup, idx) => {
                    const disc = getDiscrepancy(pickup.storeEstimate, pickup.hubWeight)
                    const driverVsHub = getDiscrepancy(pickup.driverWeight, pickup.hubWeight)

                    return (
                      <motion.div
                        key={pickup.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="grid grid-cols-[1fr_repeat(3,56px)_44px] gap-1 px-3 py-2.5 border-b border-gray-50 last:border-0 items-center"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-gray-800 truncate">{pickup.cafeName.replace('스타벅스 ', '스벅 ')}</p>
                          <p className="text-[9px] text-gray-400 truncate">{pickup.driverName}</p>
                        </div>
                        <span className="text-[11px] text-gray-600 text-center font-medium">{pickup.storeEstimate}</span>
                        <span className="text-[11px] text-gray-600 text-center font-medium">{pickup.driverWeight}</span>
                        <span className={`text-[11px] text-center font-bold ${pickup.hubWeight !== null ? 'text-eco-green' : 'text-gray-300'}`}>
                          {pickup.hubWeight !== null ? pickup.hubWeight : '-'}
                        </span>
                        <div className="text-center">
                          {disc ? (
                            <span className={`text-[10px] font-bold ${disc.color}`}>
                              {disc.pct > 0 ? '+' : ''}{disc.pct.toFixed(1)}%
                            </span>
                          ) : (
                            <Clock className="w-3 h-3 text-gray-300 mx-auto" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* 범례 */}
                <div className="flex items-center justify-center gap-4 mt-2.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-eco-green" />
                    <span className="text-[9px] text-gray-400">5% 이내</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[9px] text-gray-400">5~10%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[9px] text-gray-400">10% 초과</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 수거 목록 */}
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-800">수거 내역</h2>
          <span className="text-[11px] text-gray-400 ml-auto">{filtered.length}건</span>
        </div>

        <div className="space-y-2">
          {filtered.map((pickup, idx) => {
            const badge = statusBadge[pickup.status]
            const isExpanded = expandedId === pickup.id
            const disc = getDiscrepancy(pickup.storeEstimate, pickup.hubWeight)

            return (
              <motion.div
                key={pickup.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.04 }}
                className="bg-white rounded-xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : pickup.id)}
                  className="w-full px-4 py-3 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="w-4.5 h-4.5 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate">{pickup.cafeName}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Truck className="w-3 h-3 text-gray-300" />
                          <span className="text-[11px] text-gray-400">{pickup.driverName}</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-[11px] text-gray-400">{pickup.containerCount}개</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-[11px] font-medium text-gray-600">{pickup.driverWeight}kg</span>
                        </div>
                      </div>
                    </div>

                    {disc && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {Math.abs(disc.pct) > 5 && <AlertTriangle className={`w-3 h-3 ${disc.color}`} />}
                        {Math.abs(disc.pct) <= 5 && <CheckCircle2 className="w-3 h-3 text-eco-green" />}
                      </div>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <div className="px-4 py-3">
                        <p className="text-[10px] text-gray-400 mb-2">중량 비교</p>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-[9px] text-gray-400">매장 예상</p>
                            <p className="text-xs font-bold text-gray-700">{pickup.storeEstimate}kg</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <p className="text-[9px] text-blue-500">기사 측정</p>
                            <p className="text-xs font-bold text-blue-700">{pickup.driverWeight}kg</p>
                          </div>
                          <div className={`rounded-lg p-2 text-center ${pickup.hubWeight !== null ? 'bg-eco-green-100' : 'bg-gray-50'}`}>
                            <p className={`text-[9px] ${pickup.hubWeight !== null ? 'text-eco-green' : 'text-gray-400'}`}>집하장 실측</p>
                            <p className={`text-xs font-bold ${pickup.hubWeight !== null ? 'text-eco-green' : 'text-gray-400'}`}>
                              {pickup.hubWeight !== null ? `${pickup.hubWeight}kg` : '미측정'}
                            </p>
                          </div>
                        </div>

                        {/* 오차 시각화 바 */}
                        {pickup.hubWeight !== null && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-gray-400">매장→집하장 오차</span>
                              <span className={`text-[10px] font-bold ${disc?.color || 'text-gray-400'}`}>
                                {disc ? `${disc.pct > 0 ? '+' : ''}${disc.pct.toFixed(1)}%` : '-'}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (pickup.hubWeight / pickup.storeEstimate) * 100)}%` }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className={`h-full rounded-full ${
                                  disc && Math.abs(disc.pct) > 10
                                    ? 'bg-red-400'
                                    : disc && Math.abs(disc.pct) > 5
                                      ? 'bg-amber-400'
                                      : 'bg-eco-green'
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          <span className="text-[10px] text-gray-400">
                            {pickup.date} · 용기 {pickup.containerCount}개
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color}`}>
                            {badge.label}
                          </span>
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

        <div className="h-4" />
      </div>
    </div>
  )
}
