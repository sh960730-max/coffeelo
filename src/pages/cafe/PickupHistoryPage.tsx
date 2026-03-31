import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, ChevronDown, ChevronUp, Package, Scale,
  Clock, CheckCircle2, XCircle, Truck, Coffee, Loader2,
  ChevronLeft, ChevronRight, X
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
  note: string | null
  settlementAmount: number | null
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  REQUESTED:  { label: '미배정',    color: 'text-amber-600',  bgColor: 'bg-amber-50',      icon: Clock },
  ASSIGNED:   { label: '기사 배정', color: 'text-blue-600',   bgColor: 'bg-blue-50',       icon: Truck },
  EN_ROUTE:   { label: '이동 중',   color: 'text-eco-green',  bgColor: 'bg-eco-green-100', icon: Truck },
  ARRIVED:    { label: '도착',      color: 'text-eco-green',  bgColor: 'bg-eco-green-100', icon: Truck },
  LOADED:     { label: '수거 중',   color: 'text-eco-green',  bgColor: 'bg-eco-green-100', icon: Truck },
  COMPLETED:  { label: '완료',      color: 'text-green-600',  bgColor: 'bg-green-50',      icon: CheckCircle2 },
  CANCELLED:  { label: '취소',      color: 'text-red-500',    bgColor: 'bg-red-50',        icon: XCircle },
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

/* ── 달력 컴포넌트 ── */
function DateRangePicker({
  onConfirm, onClose,
}: {
  onConfirm: (from: string, to: string) => void
  onClose: () => void
}) {
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate]     = useState<string | null>(null)

  const toKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const firstDay  = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const handleDayClick = (key: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(key); setEndDate(null)
    } else {
      if (key < startDate) { setStartDate(key); setEndDate(null) }
      else setEndDate(key)
    }
  }

  const inRange = (key: string) =>
    startDate && endDate && key > startDate && key < endDate

  const quickSelect = (days: number) => {
    const from = new Date(today)
    from.setDate(today.getDate() - days + 1)
    setStartDate(toKey(from.getFullYear(), from.getMonth(), from.getDate()))
    setEndDate(todayKey)
  }

  const handleConfirm = () => {
    if (!startDate) return
    const end = endDate ?? startDate
    onConfirm(`${startDate}T00:00:00`, `${end}T23:59:59`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-4 pb-8"
      >
        {/* 핸들 */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">기간 선택</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* 빠른 선택 */}
        <div className="flex gap-2 mb-4">
          {[
            { label: '오늘', days: 1 },
            { label: '이번 주', days: 7 },
            { label: '이번 달', days: 30 },
          ].map(q => (
            <button key={q.label} onClick={() => quickSelect(q.days)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-eco-green-100 text-eco-green">
              {q.label}
            </button>
          ))}
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-900">
            {viewYear}년 {viewMonth + 1}월
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const key = toKey(viewYear, viewMonth, day)
            const isStart = key === startDate
            const isEnd   = key === endDate
            const isIn    = inRange(key)
            const isToday = key === todayKey
            return (
              <button
                key={key}
                onClick={() => handleDayClick(key)}
                className={`relative h-9 flex items-center justify-center text-xs font-medium rounded-xl transition-colors
                  ${isStart || isEnd ? 'bg-eco-green text-white font-bold' :
                    isIn ? 'bg-eco-green-100 text-eco-green rounded-none' :
                    isToday ? 'border border-eco-green text-eco-green' :
                    'text-gray-700 hover:bg-gray-100'}`}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* 선택 범위 표시 */}
        <div className="mt-4 text-center text-xs text-gray-500 min-h-[20px]">
          {startDate && (
            <span className="font-semibold text-eco-green">
              {startDate}{endDate && endDate !== startDate ? ` ~ ${endDate}` : ''}
            </span>
          )}
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={handleConfirm}
          disabled={!startDate}
          className="w-full mt-4 py-3.5 bg-eco-green text-white font-bold rounded-2xl text-sm disabled:opacity-40"
        >
          확인
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── 메인 페이지 ── */
export default function PickupHistoryPage() {
  const { user } = useAuth()
  const cafeId = (user as any)?.id

  const [dateFilter, setDateFilter]     = useState('month')
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [pickups, setPickups]           = useState<CafePickupRecord[]>([])
  const [loading, setLoading]           = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customRange, setCustomRange]   = useState<{ from: string; to: string } | null>(null)

  useEffect(() => {
    if (!cafeId) return
    fetchPickups()
  }, [cafeId, dateFilter, customRange])

  const fetchPickups = async () => {
    setLoading(true)
    const db = supabase as any

    let from: string | null = null
    let to:   string | null = null

    if (customRange) {
      from = customRange.from
      to   = customRange.to
    } else {
      const range = getDateRange(dateFilter)
      from = range.from
      to   = range.to
    }

    let query = db
      .from('pickups')
      .select('id, status, estimated_weight, total_weight, created_at, completed_at, note, driver_id, settlement_amount')
      .eq('cafe_id', cafeId)
      .order('created_at', { ascending: false })

    if (from) query = query.gte('created_at', from)
    if (to)   query = query.lte('created_at', to)

    const { data } = await query

    // 카페 담당 기사 조회 (pickups.driver_id 없을 때 폴백)
    let cafeDedicatedDriverName: string | null = null
    const { data: cafeInfo } = await db
      .from('cafes')
      .select('driver_id, dedicated_driver:drivers(name)')
      .eq('id', cafeId)
      .single()
    if (cafeInfo?.dedicated_driver?.name) {
      cafeDedicatedDriverName = cafeInfo.dedicated_driver.name
    }

    // 수락한 기사 이름 별도 조회
    const driverIds = [...new Set((data || []).map((p: any) => p.driver_id).filter(Boolean))]
    let driverMap: Record<string, string> = {}
    if (driverIds.length > 0) {
      const { data: drivers } = await db.from('drivers').select('id, name').in('id', driverIds)
      if (drivers) driverMap = Object.fromEntries(drivers.map((d: any) => [d.id, d.name]))
    }

    if (data) {
      setPickups(data.map((p: any) => ({
        id: p.id,
        createdAt: p.created_at,
        completedAt: p.completed_at ?? null,
        status: p.status,
        estimatedWeight: p.estimated_weight ?? 0,
        actualWeight: p.total_weight ?? null,
        // 수락한 기사 우선, 없으면 카페 담당 기사 표시
        driverName: p.driver_id
          ? (driverMap[p.driver_id] ?? null)
          : cafeDedicatedDriverName,
        note: p.note ?? null,
        settlementAmount: p.settlement_amount ?? (p.total_weight ? Math.round(p.total_weight * 80) : null),
      })))
    }
    setLoading(false)
  }

  const handleFilterClick = (key: string) => {
    setDateFilter(key)
    setCustomRange(null)
  }

  const handleDateConfirm = (from: string, to: string) => {
    setCustomRange({ from, to })
    setDateFilter('')
    setShowDatePicker(false)
  }

  const customLabel = customRange
    ? `${customRange.from.slice(0, 10)} ~ ${customRange.to.slice(0, 10)}`
    : null

  const completedPickups = pickups.filter(p => p.status === 'COMPLETED')
  const totalWeight      = completedPickups.reduce((s, p) => s + (p.actualWeight || 0), 0)
  const totalSettlement  = completedPickups.reduce((s, p) => s + (p.settlementAmount || 0), 0)

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">수거 내역</h1>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {dateFilters.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterClick(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === f.key && !customRange ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setShowDatePicker(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              customRange ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {customLabel ?? '기간선택'}
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
                              {pickup.note || `예상 ${pickup.estimatedWeight}kg`}
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
                            {pickup.note && (
                              <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                                <span className="text-xs text-gray-500">메모</span>
                                <span className="text-xs text-gray-600">{pickup.note}</span>
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

      {/* 달력 모달 */}
      <AnimatePresence>
        {showDatePicker && (
          <DateRangePicker
            onConfirm={handleDateConfirm}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
