import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Filter, ArrowUpDown, CheckCircle2, Clock, Truck,
  AlertTriangle, ChevronDown, ChevronUp, Scale, Store, Package, Loader2,
  ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

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

/* ── 달력 컴포넌트 (기사 PickupListPage와 동일) ── */
function DateRangePicker({
  onClose, onApply,
}: {
  onClose: () => void
  onApply: (from: string, to: string) => void
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  const toKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (key: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(key); setEndDate(null)
    } else {
      if (key < startDate) { setEndDate(startDate); setStartDate(key) }
      else setEndDate(key)
    }
  }

  const isInRange = (key: string) =>
    startDate && endDate && key > startDate && key < endDate

  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const days = ['일','월','화','수','목','금','토']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">기간 선택</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* 선택된 기간 표시 */}
        <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl p-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">시작일</p>
            <p className={`text-sm font-bold ${startDate ? 'text-eco-green' : 'text-gray-300'}`}>
              {startDate ?? '날짜 선택'}
            </p>
          </div>
          <div className="w-6 h-px bg-gray-300" />
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">종료일</p>
            <p className={`text-sm font-bold ${endDate ? 'text-eco-green' : 'text-gray-300'}`}>
              {endDate ?? '날짜 선택'}
            </p>
          </div>
        </div>

        {/* 월 이동 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-800">{viewYear}년 {months[viewMonth]}</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {days.map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1
            const key = toKey(viewYear, viewMonth, d)
            const isStart = key === startDate
            const isEnd = key === endDate
            const inRange = isInRange(key)
            const isToday = key === todayKey
            const dow = (firstDay + i) % 7

            return (
              <button
                key={key}
                onClick={() => handleDayClick(key)}
                className={`relative h-9 text-xs font-semibold transition-all
                  ${isStart || isEnd ? 'bg-eco-green text-white rounded-xl shadow-sm' : ''}
                  ${inRange ? 'bg-eco-green-100 text-eco-green rounded-none' : ''}
                  ${!isStart && !isEnd && !inRange ? (
                    isToday ? 'text-eco-green' :
                    dow === 0 ? 'text-red-400' :
                    dow === 6 ? 'text-blue-400' :
                    'text-gray-700'
                  ) : ''}
                `}
              >
                {d}
                {isToday && !isStart && !isEnd && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-eco-green" />
                )}
              </button>
            )
          })}
        </div>

        {/* 빠른 선택 */}
        <div className="flex gap-2 mt-4">
          {[
            { label: '오늘', fn: () => { const k = todayKey; setStartDate(k); setEndDate(k) }},
            { label: '이번 주', fn: () => {
              const mon = new Date(today); mon.setDate(today.getDate() + (today.getDay() === 0 ? -6 : 1 - today.getDay()))
              setStartDate(toKey(mon.getFullYear(), mon.getMonth(), mon.getDate()))
              setEndDate(todayKey)
            }},
            { label: '이번 달', fn: () => {
              setStartDate(toKey(today.getFullYear(), today.getMonth(), 1))
              setEndDate(todayKey)
            }},
          ].map(q => (
            <button key={q.label} onClick={q.fn}
              className="flex-1 py-2 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600">
              {q.label}
            </button>
          ))}
        </div>

        {/* 확인 버튼 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!startDate || !endDate}
          onClick={() => startDate && endDate && onApply(startDate, endDate)}
          className={`w-full mt-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
            startDate && endDate ? 'bg-eco-green text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {startDate && endDate ? `${startDate} ~ ${endDate} 조회` : '날짜를 선택해주세요'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function AllPickupsPage() {
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? ''

  const [dateFilter, setDateFilter] = useState('today')
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
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
      let toDate: string | null = null

      if (customRange) {
        fromDate = customRange.from + 'T00:00:00+09:00'
        toDate = customRange.to + 'T23:59:59+09:00'
      } else if (dateFilter === 'today') {
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)
        fromDate = todayStart.toISOString()
      } else if (dateFilter === 'week') {
        const dow = now.getDay()
        const mon = new Date(now)
        mon.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow))
        mon.setHours(0, 0, 0, 0)
        fromDate = mon.toISOString()
      } else {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString()
      }

      // 소속 기사 전체 목록 (드롭다운용)
      const { data: drivers } = await db.from('drivers').select('id, name').eq('company', companyName)
      if (!drivers || drivers.length === 0) { setPickups([]); setLoading(false); return }
      const driverMap: Record<string, string> = {}
      drivers.forEach((d: any) => { driverMap[d.id] = d.name })
      const driverIds = drivers.map((d: any) => d.id)

      // 소속 매장 전체 목록 (드롭다운용)
      const { data: allCafes } = await db.from('cafes').select('name').eq('company', companyName).eq('status', 'APPROVED')
      const allCafeNames = (allCafes || []).map((c: any) => c.name).filter(Boolean).sort()

      setDriverList(['전체', ...drivers.map((d: any) => d.name)])
      setCafeList(['전체', ...allCafeNames])

      let query = db.from('pickups')
        .select('*, cafe:cafes(name, address, store_type)')
        .in('driver_id', driverIds)

      if (toDate) {
        query = query.or(
          `and(created_at.gte.${fromDate},created_at.lte.${toDate}),and(updated_at.gte.${fromDate},updated_at.lte.${toDate}),and(completed_at.gte.${fromDate},completed_at.lte.${toDate})`
        )
      } else {
        query = query.or(`created_at.gte.${fromDate},updated_at.gte.${fromDate},completed_at.gte.${fromDate}`)
      }

      const { data } = await query.order('updated_at', { ascending: false })

      if (data) {
        const enriched = data.map((p: any) => ({
          ...p,
          driverName: p.driver_id ? (driverMap[p.driver_id] || '미배정') : '미배정',
        }))
        setPickups(enriched)
      }
      setLoading(false)
    }
    load()
  }, [companyName, dateFilter, customRange])

  const filtered = pickups.filter(p => {
    if (selectedDriver !== '전체' && p.driverName !== selectedDriver) return false
    if (selectedCafe !== '전체' && p.cafe?.name !== selectedCafe) return false
    return true
  })

  const completedWithWeight = filtered.filter(p => p.status === 'COMPLETED' && p.total_weight)
  const totalStoreEst = completedWithWeight.reduce((s, p) => s + (p.estimated_weight || 0), 0)
  const totalDriverW = completedWithWeight.reduce((s, p) => s + (p.total_weight || 0), 0)

  const dateFilters = [
    { key: 'today', label: '오늘' },
    { key: 'week', label: '이번 주' },
    { key: 'month', label: '이번 달' },
  ]

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-3">수거 현황</h1>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          {dateFilters.map(f => (
            <motion.button
              key={f.key} whileTap={{ scale: 0.95 }}
              onClick={() => { setDateFilter(f.key); setCustomRange(null) }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                dateFilter === f.key && !customRange ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDatePicker(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              customRange ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {customRange ? `${customRange.from.slice(5)} ~ ${customRange.to.slice(5)}` : '기간선택'}
          </motion.button>
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

      {/* 달력 기간 선택 모달 */}
      <AnimatePresence>
        {showDatePicker && (
          <DateRangePicker
            onClose={() => setShowDatePicker(false)}
            onApply={(from, to) => {
              setCustomRange({ from, to })
              setDateFilter('custom')
              setShowDatePicker(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
