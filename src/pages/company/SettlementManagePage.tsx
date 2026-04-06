import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale, ChevronDown, ChevronUp, CheckCircle,
  Calendar, TrendingUp, Truck, Loader2, CreditCard,
  Trees, Target, MapPin, BarChart3, Circle, Download,
  ChevronLeft, ChevronRight, X
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const MONTHLY_TARGET_KG = 300 // 기사 1인당 월 목표 수거량(kg)
const CO2_PER_KG = 0.5        // 커피박 1kg 당 CO2 절감(kg)
const TREE_CO2_MONTHLY = 1.83 // 나무 1그루 월 CO2 흡수량(kg)

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: '대기',    color: 'bg-amber-50 text-amber-600',      icon: Calendar },
  CONFIRMED: { label: '확정',    color: 'bg-blue-50 text-blue-600',        icon: CheckCircle },
  PAID:      { label: '지급완료', color: 'bg-eco-green-100 text-eco-green', icon: CreditCard },
  pending:   { label: '대기',    color: 'bg-amber-50 text-amber-600',      icon: Calendar },
  confirmed: { label: '확정',    color: 'bg-blue-50 text-blue-600',        icon: CheckCircle },
  paid:      { label: '지급완료', color: 'bg-eco-green-100 text-eco-green', icon: CreditCard },
}

const driverStatusBadge = (isOnline: boolean | null) =>
  isOnline
    ? { label: '운행중', cls: 'bg-green-100 text-green-600' }
    : { label: '퇴근',   cls: 'bg-gray-100 text-gray-400' }

/* ── 달력 컴포넌트 ── */
function DateRangePicker({ onClose, onApply }: { onClose: () => void; onApply: (from: string, to: string) => void }) {
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

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }

  const handleDayClick = (key: string) => {
    if (!startDate || (startDate && endDate)) { setStartDate(key); setEndDate(null) }
    else { if (key < startDate) { setEndDate(startDate); setStartDate(key) } else setEndDate(key) }
  }

  const isInRange = (key: string) => startDate && endDate && key > startDate && key < endDate
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const days = ['일','월','화','수','목','금','토']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 flex items-end justify-center" onClick={onClose}
    >
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">기간 선택</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl p-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">시작일</p>
            <p className={`text-sm font-bold ${startDate ? 'text-eco-green' : 'text-gray-300'}`}>{startDate ?? '날짜 선택'}</p>
          </div>
          <div className="w-6 h-px bg-gray-300" />
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">종료일</p>
            <p className={`text-sm font-bold ${endDate ? 'text-eco-green' : 'text-gray-300'}`}>{endDate ?? '날짜 선택'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
          <span className="text-sm font-bold text-gray-800">{viewYear}년 {months[viewMonth]}</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {days.map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>
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
              <button key={key} onClick={() => handleDayClick(key)}
                className={`relative h-9 text-xs font-semibold transition-all
                  ${isStart || isEnd ? 'bg-eco-green text-white rounded-xl shadow-sm' : ''}
                  ${inRange ? 'bg-eco-green-100 text-eco-green rounded-none' : ''}
                  ${!isStart && !isEnd && !inRange ? (isToday ? 'text-eco-green' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-700') : ''}
                `}
              >
                {d}
                {isToday && !isStart && !isEnd && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-eco-green" />}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 mt-4">
          {[
            { label: '오늘', fn: () => { setStartDate(todayKey); setEndDate(todayKey) }},
            { label: '이번 주', fn: () => {
              const mon = new Date(today); mon.setDate(today.getDate() + (today.getDay() === 0 ? -6 : 1 - today.getDay()))
              setStartDate(toKey(mon.getFullYear(), mon.getMonth(), mon.getDate())); setEndDate(todayKey)
            }},
            { label: '이번 달', fn: () => {
              setStartDate(toKey(today.getFullYear(), today.getMonth(), 1)); setEndDate(todayKey)
            }},
          ].map(q => (
            <button key={q.label} onClick={q.fn} className="flex-1 py-2 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600">{q.label}</button>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} disabled={!startDate || !endDate}
          onClick={() => startDate && endDate && onApply(startDate, endDate)}
          className={`w-full mt-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${startDate && endDate ? 'bg-eco-green text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {startDate && endDate ? `${startDate} ~ ${endDate} 조회` : '날짜를 선택해주세요'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function SettlementManagePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const companyName = (user as any)?.name ?? ''

  const [settlements, setSettlements] = useState<any[]>([])
  const [driverStats, setDriverStats] = useState<Record<string, { visitCount: number; totalAssigned: number; isOnline: boolean }>>({})
  const [allDriverNames, setAllDriverNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // 날짜 필터
  const [dateFilter, setDateFilter] = useState('month')
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // 목록 필터
  const [filterDriver, setFilterDriver] = useState('전체')
  const [filterStatus, setFilterStatus] = useState('전체')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const fetchSettlements = async () => {
    if (!companyName) return
    setLoading(true)
    const db = supabase as any

    // 소속 기사 목록 + 온라인 상태
    const { data: drivers } = await db.from('drivers').select('id, name, is_online').eq('company', companyName)
    if (!drivers || drivers.length === 0) { setSettlements([]); setLoading(false); return }

    const driverMap: Record<string, string> = {}
    const onlineMap: Record<string, boolean> = {}
    drivers.forEach((d: any) => {
      driverMap[d.id] = d.name
      onlineMap[d.id] = d.is_online ?? false
    })
    setAllDriverNames(drivers.map((d: any) => d.name))
    const driverIds = drivers.map((d: any) => d.id)

    const now = new Date()
    let fromDate: string
    let toDate: string | null = null

    if (customRange) {
      fromDate = customRange.from + 'T00:00:00'
      toDate = customRange.to + 'T23:59:59'
    } else if (dateFilter === 'today') {
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

    // 이번 달 전체 픽업 (방문완료율은 항상 이번 달 기준으로 계산)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data: allPickups } = await db.from('pickups')
      .select('driver_id, status, total_weight, settlement_amount, completed_at, created_at, updated_at')
      .in('driver_id', driverIds)
      .or(`created_at.gte.${monthStart},completed_at.gte.${monthStart},updated_at.gte.${monthStart}`)

    const statsMap: Record<string, { visitCount: number; totalAssigned: number; isOnline: boolean }> = {}
    driverIds.forEach((id: string) => {
      statsMap[id] = { visitCount: 0, totalAssigned: 0, isOnline: onlineMap[id] }
    })
    ;(allPickups || []).forEach((p: any) => {
      if (!p.driver_id) return
      statsMap[p.driver_id].totalAssigned++
      if (p.status === 'COMPLETED') statsMap[p.driver_id].visitCount++
    })
    setDriverStats(statsMap)

    // settlements 테이블 조회 — period_start 기준 strict 필터
    let settQuery = db.from('settlements')
      .select('*')
      .in('driver_id', driverIds)
      .order('period_start', { ascending: false })

    if (toDate) {
      // period_start가 선택 기간 내에 시작된 정산만 표시
      settQuery = settQuery
        .gte('period_start', fromDate)
        .lte('period_start', toDate)
    } else {
      // toDate 없으면 period_start가 fromDate 이후인 것만
      settQuery = settQuery.gte('period_start', fromDate)
    }

    const { data: settlementsData } = await settQuery

    // 기사별 마지막 확정 정산의 period_end 추적
    const lastSettledEnd: Record<string, Date> = {}
    ;(settlementsData || []).forEach((s: any) => {
      const endDate = new Date(s.period_end || s.period_start)
      if (!lastSettledEnd[s.driver_id] || endDate > lastSettledEnd[s.driver_id]) {
        lastSettledEnd[s.driver_id] = endDate
      }
    })

    // 미정산 픽업: 기사별 마지막 확정 정산 이후 수거분만 집계
    const completedPickups = (allPickups || []).filter((p: any) => p.status === 'COMPLETED')
    const agg: Record<string, { kg: number; amount: number; minDate: Date; maxDate: Date }> = {}
    completedPickups.forEach((p: any) => {
      if (!p.driver_id) return
      const pickupDate = new Date(p.completed_at || p.created_at)
      // 이미 확정된 정산에 포함된 수거는 제외
      if (lastSettledEnd[p.driver_id] && pickupDate <= lastSettledEnd[p.driver_id]) return
      if (!agg[p.driver_id]) agg[p.driver_id] = { kg: 0, amount: 0, minDate: pickupDate, maxDate: pickupDate }
      agg[p.driver_id].kg += p.total_weight || 0
      agg[p.driver_id].amount += p.settlement_amount || 0
      if (pickupDate < agg[p.driver_id].minDate) agg[p.driver_id].minDate = pickupDate
      if (pickupDate > agg[p.driver_id].maxDate) agg[p.driver_id].maxDate = pickupDate
    })

    const fromD = new Date(fromDate)
    const toD = toDate ? new Date(toDate) : now

    const synthList = Object.entries(agg).map(([driverId, v]) => {
      const start = lastSettledEnd[driverId]
        ? new Date(lastSettledEnd[driverId].getTime() + 1000)
        : v.minDate
      const end = v.maxDate
      const periodStr = `${start.getMonth()+1}/${start.getDate()} ~ ${end.getMonth()+1}/${end.getDate()}`
      return {
        id: `synth_${driverId}`,
        driver_id: driverId,
        driverName: driverMap[driverId] || '알 수 없음',
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        periodStr,
        total_weight: v.kg,
        rate_per_kg: 80,
        gross_amount: v.amount || Math.round(v.kg * 80),
        status: 'PENDING',
      }
    }).filter(s => {
      // period_start 기준 strict 필터 (DB settlements와 동일 방식)
      const sStart = new Date(s.period_start)
      return sStart >= fromD && sStart <= toD
    })

    const realList = (settlementsData || []).map((s: any) => ({
      ...s,
      driverName: driverMap[s.driver_id] || '알 수 없음',
    }))
    setSettlements([...realList, ...synthList])
    setLoading(false)
  }

  useEffect(() => { fetchSettlements() }, [companyName, dateFilter, customRange])

  const updateStatus = async (settlementId: string, newStatus: string) => {
    setUpdating(settlementId)
    const db = supabase as any

    if (settlementId.startsWith('synth_')) {
      const synth = settlements.find(s => s.id === settlementId)
      if (!synth) { setUpdating(null); return }
      const { error } = await db.from('settlements').insert({
        driver_id: synth.driver_id,
        period_start: synth.period_start,
        period_end: synth.period_end,
        total_weight: synth.total_weight,
        rate_per_kg: synth.rate_per_kg || 80,
        gross_amount: synth.gross_amount,
        status: newStatus,
      })
      if (error) {
        showToast('저장 실패: ' + (error.message || '알 수 없는 오류'), 'error')
      } else {
        showToast('실적이 확정되었습니다')
        await fetchSettlements()
      }
      setUpdating(null)
      return
    }

    const { error } = await db.from('settlements').update({ status: newStatus }).eq('id', settlementId)
    if (error) {
      showToast('업데이트 실패: ' + (error.message || '알 수 없는 오류'), 'error')
    } else {
      showToast('실적이 확정되었습니다')
    }
    await fetchSettlements()
    setUpdating(null)
  }

  const handleExcelDownload = () => {
    const now = new Date()
    const monthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`

    const rows = settlements.map((ds) => {
      const stat = driverStats[ds.driver_id]
      const goalPct = MONTHLY_TARGET_KG > 0
        ? Math.min(100, Math.round(((ds.total_weight || 0) / MONTHLY_TARGET_KG) * 100))
        : 0
      const visitRate = stat && stat.totalAssigned > 0
        ? Math.round((stat.visitCount / stat.totalAssigned) * 100)
        : 0
      const startDate = new Date(ds.period_start)
      const endDate = new Date(ds.period_end)
      const period = ds.periodStr || `${startDate.getMonth()+1}/${startDate.getDate()} ~ ${endDate.getMonth()+1}/${endDate.getDate()}`
      const statusMap: Record<string, string> = { PENDING: '대기', CONFIRMED: '확정', PAID: '지급완료', pending: '대기', confirmed: '확정', paid: '지급완료' }
      const statusLabel = statusMap[ds.status] || '대기'

      return {
        '기사명': ds.driverName,
        '정산 기간': period,
        '운행 상태': stat?.isOnline ? '운행중' : '퇴근',
        '총 수거량(kg)': ds.total_weight || 0,
        '정산 단가(원/kg)': ds.rate_per_kg || 80,
        '정산 금액(원)': ds.gross_amount || 0,
        '목표 달성률(%)': goalPct,
        '방문 완료율(%)': visitRate,
        '완료 건수': stat?.visitCount ?? 0,
        '배정 건수': stat?.totalAssigned ?? 0,
        '정산 상태': statusLabel,
        'CO₂ 절감량(kg)': ((ds.total_weight || 0) * CO2_PER_KG).toFixed(1),
      }
    })

    const ws = XLSX.utils.json_to_sheet(rows)

    // 열 너비 자동 조정
    const colWidths = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 2, 12) }))
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '기사별 정산')

    // 합계 행 추가
    const totalRow = {
      '기사명': '합계',
      '정산 기간': '',
      '운행 상태': '',
      '총 수거량(kg)': settlements.reduce((s, d) => s + (d.total_weight || 0), 0),
      '정산 단가(원/kg)': '',
      '정산 금액(원)': settlements.reduce((s, d) => s + (d.gross_amount || 0), 0),
      '목표 달성률(%)': '',
      '방문 완료율(%)': '',
      '완료 건수': Object.values(driverStats).reduce((s, v) => s + v.visitCount, 0),
      '배정 건수': Object.values(driverStats).reduce((s, v) => s + v.totalAssigned, 0),
      '정산 상태': '',
      'CO₂ 절감량(kg)': (settlements.reduce((s, d) => s + (d.total_weight || 0), 0) * CO2_PER_KG).toFixed(1),
    }
    XLSX.utils.sheet_add_json(ws, [totalRow], { skipHeader: true, origin: -1 })

    const fileName = `커피로_정산내역_${monthLabel}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const monthlyKg    = settlements.reduce((s, d) => s + (d.total_weight || 0), 0)
  const monthlyTotal = settlements.reduce((s, d) => s + (d.gross_amount || 0), 0)
  const pendingCount   = settlements.filter(d => ['PENDING','pending'].includes(d.status)).length
  const confirmedCount = settlements.filter(d => ['CONFIRMED','confirmed'].includes(d.status)).length

  // 기사 목록 (드롭다운용) - 소속 기사 전체
  const driverNames = ['전체', ...allDriverNames]

  // 필터 적용
  const filteredSettlements = settlements.filter(s => {
    if (filterDriver !== '전체' && s.driverName !== filterDriver) return false
    if (filterStatus !== '전체') {
      const statusUp = (s.status || '').toUpperCase()
      if (filterStatus === '대기' && statusUp !== 'PENDING') return false
      if (filterStatus === '확정' && statusUp !== 'CONFIRMED') return false
      if (filterStatus === '지급완료' && statusUp !== 'PAID') return false
    }
    return true
  })

  const displayKg   = monthlyKg >= 1000 ? `${(monthlyKg / 1000).toFixed(2)}ton` : `${monthlyKg.toLocaleString()}kg`
  const co2Saved    = monthlyKg * CO2_PER_KG
  const treesEquiv  = Math.round(co2Saved / TREE_CO2_MONTHLY)

  return (
    <div>
      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-semibold text-white ${
              toast.type === 'success' ? 'bg-eco-green' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <span className="font-bold">!</span>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">정산 관리</h1>
          {!loading && settlements.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleExcelDownload}
              className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              엑셀 다운로드
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {(['today', 'week', 'month'] as const).map(f => (
            <motion.button key={f} whileTap={{ scale: 0.95 }}
              onClick={() => { setDateFilter(f); setCustomRange(null) }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                dateFilter === f && !customRange ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f === 'today' ? '오늘' : f === 'week' ? '이번 주' : '이번 달'}
            </motion.button>
          ))}
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setShowDatePicker(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              customRange ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {customRange ? `${customRange.from.slice(5)} ~ ${customRange.to.slice(5)}` : '기간선택'}
          </motion.button>
        </div>
        {/* 기사/상태 필터 */}
        <div className="flex items-center gap-2 pt-1">
          <select value={filterDriver} onChange={e => setFilterDriver(e.target.value)}
            className="flex-1 text-[11px] font-medium px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 outline-none">
            {driverNames.map(n => <option key={n}>{n}</option>)}
          </select>
          <div className="flex items-center gap-1">
            {['전체','대기','확정','지급완료'].map(s => (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                  filterStatus === s ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : (
          <>
            {/* ── 상단 요약 카드: 전체 수거 퍼포먼스 ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card mb-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">전체 수거 퍼포먼스</span>
              </div>
              <p className="text-3xl font-bold text-white mt-1">{displayKg}</p>
              <p className="text-xs text-white/60 mt-0.5">
                수거 가치 환산 금액 <span className="text-white font-semibold">{monthlyTotal.toLocaleString()}원</span>
              </p>
              <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{pendingCount}</p>
                  <p className="text-[10px] text-white/60">대기</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{confirmedCount}</p>
                  <p className="text-[10px] text-white/60">확정</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{settlements.length}</p>
                  <p className="text-[10px] text-white/60">전체</p>
                </div>
              </div>
            </motion.div>

            {/* ── 기사별 정산 ── */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800">기사별 정산</h2>
              <span className="text-[11px] text-gray-400">{filteredSettlements.length}건</span>
            </div>
            {settlements.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">정산 내역이 없습니다</p>
              </div>
            ) : filteredSettlements.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">필터 조건에 맞는 내역이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredSettlements.map((ds, idx) => {
                  const cfg = statusConfig[ds.status] || statusConfig.PENDING
                  const StatusIcon = cfg.icon
                  const isExpanded = expandedId === ds.id
                  const startDate = new Date(ds.period_start)
                  const endDate = new Date(ds.period_end)
                  const period = ds.periodStr || `${startDate.getMonth()+1}/${startDate.getDate()} ~ ${endDate.getMonth()+1}/${endDate.getDate()}`
                  const isUpdating = updating === ds.id
                  const statusUpper = (ds.status || '').toUpperCase()

                  const stat = driverStats[ds.driver_id]
                  const dsBadge = driverStatusBadge(stat?.isOnline ?? false)
                  const goalPct = MONTHLY_TARGET_KG > 0
                    ? Math.min(100, Math.round(((ds.total_weight || 0) / MONTHLY_TARGET_KG) * 100))
                    : 0
                  const visitRate = stat && stat.totalAssigned > 0
                    ? Math.round((stat.visitCount / stat.totalAssigned) * 100)
                    : 0

                  return (
                    <motion.div key={ds.id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.06 }}
                      className="bg-white rounded-2xl shadow-card overflow-hidden"
                    >
                      <button onClick={() => setExpandedId(isExpanded ? null : ds.id)} className="w-full p-4 text-left">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Truck className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="min-w-0">
                              {/* 이름 + 정산상태 + 운행상태 */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-gray-800">{ds.driverName}</p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${cfg.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {cfg.label}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${dsBadge.cls}`}>
                                  <Circle className="w-2 h-2 fill-current" />
                                  {dsBadge.label}
                                </span>
                              </div>
                              {/* 기간 + 수거량 */}
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">{period}</span>
                                <span className="text-gray-200">·</span>
                                <span className="text-[11px] text-gray-500">{(ds.total_weight || 0).toLocaleString()}kg</span>
                              </div>
                              {/* 목표달성률 + 방문완료율 */}
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1">
                                  <Target className="w-3 h-3 text-amber-500" />
                                  <span className="text-[11px] font-semibold text-amber-600">목표 {goalPct}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3 text-blue-400" />
                                  <span className="text-[11px] font-semibold text-blue-500">방문완료 {visitRate}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <p className="text-sm font-bold text-gray-900">{(ds.gross_amount || 0).toLocaleString()}원</p>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            <div className="p-4 pt-3">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-semibold text-gray-500">정산 정보</span>
                                <span className="text-[11px] text-gray-400">{ds.rate_per_kg || 80}원/kg</span>
                              </div>

                              {/* 수거량 / 금액 */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-gray-50 rounded-lg p-2.5">
                                  <p className="text-[9px] text-gray-400">총 수거량</p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Scale className="w-3 h-3 text-gray-400" />
                                    <p className="text-sm font-bold text-gray-700">{(ds.total_weight || 0).toLocaleString()}kg</p>
                                  </div>
                                </div>
                                <div className="bg-eco-green-100 rounded-lg p-2.5">
                                  <p className="text-[9px] text-eco-green">정산 금액</p>
                                  <p className="text-sm font-bold text-eco-green mt-0.5">{(ds.gross_amount || 0).toLocaleString()}원</p>
                                </div>
                              </div>

                              {/* 목표 달성 프로그레스바 */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> 목표 달성률 (월 {MONTHLY_TARGET_KG}kg 기준)
                                  </span>
                                  <span className={`text-[11px] font-bold ${goalPct >= 100 ? 'text-eco-green' : goalPct >= 60 ? 'text-amber-500' : 'text-red-400'}`}>
                                    {goalPct}%
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${goalPct}%` }}
                                    transition={{ duration: 0.6 }}
                                    className={`h-full rounded-full ${goalPct >= 100 ? 'bg-eco-green' : goalPct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                                  />
                                </div>
                              </div>

                              {/* 방문 완료율 */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" /> 매장 방문 완료율
                                  </span>
                                  <span className="text-[11px] font-bold text-blue-500">
                                    {stat?.visitCount ?? 0}/{stat?.totalAssigned ?? 0}건 ({visitRate}%)
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${visitRate}%` }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="h-full rounded-full bg-blue-400"
                                  />
                                </div>
                              </div>

                              {ds.paid_at && (
                                <p className="text-[11px] text-eco-green mb-3">
                                  지급일: {new Date(ds.paid_at).toLocaleDateString('ko-KR')}
                                </p>
                              )}

                              {/* 액션 버튼 */}
                              <div className="flex gap-2 mt-1">
                                <motion.button whileTap={{ scale: 0.97 }}
                                  onClick={() => navigate('/company/drivers')}
                                  className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  상세 경로 보기
                                </motion.button>

                                {(statusUpper === 'PENDING' || ds.id.startsWith('synth_')) && (
                                  <motion.button whileTap={{ scale: 0.97 }}
                                    disabled={isUpdating}
                                    onClick={() => updateStatus(ds.id, 'CONFIRMED')}
                                    className="flex-1 bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  >
                                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                    실적 확정
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* ── 월간 합계 + ESG ── */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-eco-green" />
                <h3 className="text-sm font-bold text-gray-800">월간 합계</h3>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">총 정산 금액</p>
                  <p className="text-xl font-bold text-gray-900">{monthlyTotal.toLocaleString()}원</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">총 수거량</p>
                  <p className="text-base font-bold text-eco-green">{monthlyKg.toLocaleString()}kg</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400 mb-3">
                <span>기사 {settlements.length}명</span>
                <span>단가 80원/kg</span>
              </div>

              {/* ESG: 탄소 절감 */}
              <div className="bg-gradient-to-r from-green-50 to-eco-green/10 rounded-xl p-3 border border-eco-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <Trees className="w-4 h-4 text-eco-green" />
                  <span className="text-xs font-bold text-eco-green">ESG · 탄소 배출 절감 성과</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400">이번 달 CO₂ 절감량</p>
                    <p className="text-lg font-bold text-eco-green">{co2Saved.toFixed(1)}kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">나무 흡수 환산</p>
                    <div className="flex items-center gap-1 justify-end">
                      <Trees className="w-3.5 h-3.5 text-eco-green" />
                      <p className="text-base font-bold text-eco-green">{treesEquiv}그루 효과</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5">
                  * 커피박 1kg = CO₂ {CO2_PER_KG}kg 절감 기준, 나무 1그루 월 {TREE_CO2_MONTHLY}kg CO₂ 흡수 환산
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* 달력 기간 선택 모달 */}
      <AnimatePresence>
        {showDatePicker && (
          <DateRangePicker
            onClose={() => setShowDatePicker(false)}
            onApply={(from, to) => {
              setCustomRange({ from, to })
              setShowDatePicker(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
