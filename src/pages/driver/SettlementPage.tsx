import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Scale, Wallet, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const statusStyle: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-amber-50 text-amber-600' },
  CONFIRMED: { label: '확정', color: 'bg-blue-50 text-blue-600' },
  PAID: { label: '지급 완료', color: 'bg-eco-green-100 text-eco-green' },
  DISPUTED: { label: '이의 제기', color: 'bg-red-50 text-red-500' },
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function fmt만(amount: number) {
  if (amount === 0) return null
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}만`
  return `${amount.toLocaleString()}`
}

export default function SettlementPage() {
  const { user } = useAuth()
  const driverId = (user as any)?.id

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [dailyMap, setDailyMap] = useState<Record<string, { amount: number; count: number }>>({})
  const [pickupsByDate, setPickupsByDate] = useState<Record<string, any[]>>({})
  const [dateStatusMap, setDateStatusMap] = useState<Record<string, string>>({}) // 날짜 → 정산 상태
  const [monthTotal, setMonthTotal] = useState(0)
  const [monthDays, setMonthDays] = useState(0)
  const [settlements, setSettlements] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any
    const load = async () => {
      const from = new Date(year, month, 1).toISOString()
      const to = new Date(year, month + 1, 1).toISOString()

      // 계량 기록 기준으로 정산 (weigh_ins 테이블)
      const RATE = 80 // 원/kg 기본 단가
      const { data: weighIns } = await db.from('weigh_ins')
        .select('id, created_at, net_weight, loaded_weight, empty_weight, loaded_photo_url, empty_photo_url')
        .eq('driver_id', driverId)
        .eq('status', 'COMPLETED')
        .gte('created_at', from)
        .lt('created_at', to)
        .order('created_at', { ascending: true })

      if (weighIns) {
        const map: Record<string, { amount: number; count: number }> = {}
        const byDate: Record<string, any[]> = {}
        weighIns.forEach((w: any) => {
          const key = w.created_at?.split('T')[0]
          if (!key) return
          const amount = Math.round((w.net_weight || 0) * RATE)
          if (!map[key]) map[key] = { amount: 0, count: 0 }
          map[key].amount += amount
          map[key].count += 1
          if (!byDate[key]) byDate[key] = []
          byDate[key].push({ ...w, amount })
        })
        setDailyMap(map)
        setPickupsByDate(byDate)
        const total = Object.values(map).reduce((s, d) => s + d.amount, 0)
        setMonthTotal(total)
        setMonthDays(Object.keys(map).length)
      }

      const { data: settlementsData } = await db.from('settlements')
        .select('*')
        .eq('driver_id', driverId)
        .gte('period_start', from)
        .lt('period_start', to)
        .order('period_start', { ascending: false })
      if (settlementsData) {
        setSettlements(settlementsData)

        // 날짜 → 정산 상태 맵 빌드
        // ★ UTC 날짜 문자열 기준으로 키 생성 (dailyMap 키와 동일 방식 — 타임존 어긋남 방지)
        const statusPriority: Record<string, number> = { PAID: 3, CONFIRMED: 2, PENDING: 1 }
        const dsMap: Record<string, string> = {}
        settlementsData.forEach((s: any) => {
          const status = (s.status || 'PENDING').toUpperCase()
          // period_start / period_end 의 UTC 날짜 부분만 추출 후 UTC midnight 기준 반복
          const startKey = s.period_start.split('T')[0]
          const endKey   = (s.period_end || s.period_start).split('T')[0]
          const cur = new Date(startKey + 'T00:00:00Z')
          const endD = new Date(endKey + 'T00:00:00Z')
          while (cur <= endD) {
            const k = cur.toISOString().split('T')[0]
            if (!dsMap[k] || (statusPriority[status] || 0) > (statusPriority[dsMap[k]] || 0)) {
              dsMap[k] = status
            }
            cur.setUTCDate(cur.getUTCDate() + 1)
          }
        })
        setDateStatusMap(dsMap)
      }
    }
    load()
  }, [driverId, year, month])

  const prevMonth = () => {
    setSelectedDate(null)
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelectedDate(null)
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedPickups = selectedDate ? (pickupsByDate[selectedDate] ?? []) : []
  const selectedData = selectedDate ? dailyMap[selectedDate] : null
  const selectedDateLabel = selectedDate
    ? `${parseInt(selectedDate.split('-')[1])}월 ${parseInt(selectedDate.split('-')[2])}일`
    : ''

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">정산</h1>
      </header>

      <div className="px-4 py-4">
        {/* 월 네비게이터 */}
        <div className="flex items-center justify-between mb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </motion.button>
          <div className="text-center">
            <p className="text-base font-bold text-gray-900">{year}년 {month + 1}월</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {monthDays}일 근무 · {monthTotal > 0 ? `${(monthTotal / 10000).toFixed(1)}만원` : '수입 없음'}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>

        {/* 달력 */}
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card overflow-hidden"
        >
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((d, i) => (
              <div key={d} className={`py-2 text-center text-[11px] font-bold
                ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} className="h-16 border-b border-r border-gray-50 last:border-r-0" />

              const col = idx % 7
              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const data = dailyMap[key]
              const settlStatus = dateStatusMap[key] // 'CONFIRMED' | 'PAID' | 'PENDING' | undefined
              const isToday = key === todayKey
              const isSelected = key === selectedDate
              const isSun = col === 0
              const isSat = col === 6
              const isLastRow = idx >= cells.length - 7
              const hasData = !!data

              // 배지 색상: 확정(CONFIRMED/PAID)→파랑, 미정산→빨강
              const isConfirmed = settlStatus === 'CONFIRMED' || settlStatus === 'PAID'
              const badgeClass = isConfirmed ? 'bg-blue-500 text-white' : 'bg-red-400 text-white'
              const amtClass   = isConfirmed ? 'text-blue-500' : 'text-red-400'

              return (
                <motion.div
                  key={key}
                  whileTap={hasData ? { scale: 0.92 } : {}}
                  onClick={() => hasData ? setSelectedDate(isSelected ? null : key) : null}
                  className={`h-16 p-1 flex flex-col items-center border-b border-r border-gray-50
                    ${isLastRow ? 'border-b-0' : ''}
                    ${col === 6 ? 'border-r-0' : ''}
                    ${isSelected ? 'bg-blue-50/60' : isToday ? 'bg-gray-50' : ''}
                    ${hasData ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                    ${isSelected ? 'bg-eco-green text-white' : isToday ? 'bg-eco-green text-white' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-gray-700'}`}>
                    {day}
                  </div>

                  {data && (
                    <div className="mt-0.5 flex flex-col items-center gap-0.5 w-full">
                      <div className={`w-full text-center text-[9px] font-bold px-0.5 py-0.5 rounded-md ${badgeClass}`}>
                        {data.count}건
                      </div>
                      <span className={`text-[9px] font-semibold leading-tight ${amtClass}`}>
                        {fmt만(data.amount)}
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* 범례 */}
        <div className="flex items-center gap-3 mt-2 px-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-400" />
            <span className="text-[10px] text-gray-400">미정산</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-[10px] text-gray-400">확정</span>
          </div>
        </div>

        {/* 월 합계 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-gradient-to-r from-eco-green to-eco-green-600 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/70">{month + 1}월 총 수입</p>
              <p className="text-lg font-bold text-white">{monthTotal.toLocaleString()}원</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">근무일</p>
            <p className="text-lg font-bold text-white">{monthDays}일</p>
          </div>
        </motion.div>

        {/* 정산 내역 */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">정산 내역</h3>
          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <Scale className="w-8 h-8 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-400 mt-2">정산 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2.5 mb-8">
              {settlements.map((s, idx) => {
                const isExpanded = expandedId === s.id
                const style = statusStyle[s.status] || statusStyle.PENDING
                const start = new Date(s.period_start)
                const end = new Date(s.period_end)
                const period = `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.07 }}
                    className="bg-white rounded-2xl shadow-card overflow-hidden"
                  >
                    <button onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className="w-full p-4 flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400">{period}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.color}`}>{style.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Scale className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{s.total_weight?.toLocaleString()}kg × {s.rate_per_kg}원/kg</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-gray-900">{s.gross_amount?.toLocaleString()}원</p>
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-gray-400" />
                          : <ChevronUp className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>
                    <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">총 수거량</span>
                            <span className="text-xs text-gray-700 font-medium">{s.total_weight?.toLocaleString()}kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">단가</span>
                            <span className="text-xs text-gray-700 font-medium">{s.rate_per_kg?.toLocaleString()}원/kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">정산금액</span>
                            <span className="text-xs font-bold text-gray-900">{s.gross_amount?.toLocaleString()}원</span>
                          </div>
                          {s.net_amount != null && (
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">실지급액</span>
                              <span className="text-xs font-bold text-eco-green">{s.net_amount?.toLocaleString()}원</span>
                            </div>
                          )}
                          {s.paid_at && (
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">지급일</span>
                              <span className="text-xs text-gray-600">{new Date(s.paid_at).toLocaleDateString('ko-KR')}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 날짜 상세 바텀시트 */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-4 pb-10 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              {/* 날짜 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedDateLabel} 계량 내역</h3>
                  {selectedData && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedData.count}건 · 총 {selectedData.amount.toLocaleString()}원
                    </p>
                  )}
                </div>
                <button onClick={() => setSelectedDate(null)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 계량 목록 */}
              <div className="space-y-2.5">
                {selectedPickups.map((w, idx) => {
                  const date = new Date(w.created_at)
                  const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
                  return (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gray-50 rounded-2xl px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-eco-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Scale className="w-4 h-4 text-eco-green" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">계량 {idx + 1}회차</p>
                            <p className="text-[10px] text-gray-400">{timeStr}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{(w.net_weight || 0).toFixed(1)}kg</p>
                          <p className="text-sm font-bold text-eco-green">{(w.amount || 0).toLocaleString()}원</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 ml-11">
                        적재 {w.loaded_weight?.toFixed(1)}kg → 공차 {w.empty_weight?.toFixed(1)}kg = 순수 {(w.net_weight || 0).toFixed(1)}kg
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {/* 합계 */}
              {selectedData && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">합계</span>
                  <span className="text-base font-bold text-eco-green">{selectedData.amount.toLocaleString()}원</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
