import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Scale, Wallet } from 'lucide-react'
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
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  // 날짜별 수입 { '2026-04-06': { amount, count } }
  const [dailyMap, setDailyMap] = useState<Record<string, { amount: number; count: number }>>({})
  const [monthTotal, setMonthTotal] = useState(0)
  const [monthDays, setMonthDays] = useState(0)
  const [settlements, setSettlements] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any
    const load = async () => {
      const from = new Date(year, month, 1).toISOString()
      const to = new Date(year, month + 1, 1).toISOString()

      const { data: pickups } = await db.from('pickups')
        .select('completed_at, settlement_amount')
        .eq('driver_id', driverId)
        .eq('status', 'COMPLETED')
        .gte('completed_at', from)
        .lt('completed_at', to)

      if (pickups) {
        const map: Record<string, { amount: number; count: number }> = {}
        pickups.forEach((p: any) => {
          const key = p.completed_at?.split('T')[0]
          if (!key) return
          if (!map[key]) map[key] = { amount: 0, count: 0 }
          map[key].amount += p.settlement_amount || 0
          map[key].count += 1
        })
        setDailyMap(map)
        const total = pickups.reduce((s: number, p: any) => s + (p.settlement_amount || 0), 0)
        setMonthTotal(total)
        setMonthDays(Object.keys(map).length)
      }

      const { data: settlementsData } = await db.from('settlements')
        .select('*')
        .eq('driver_id', driverId)
        .order('period_start', { ascending: false })
      if (settlementsData) setSettlements(settlementsData)
    }
    load()
  }, [driverId, year, month])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // 달력 셀 계산
  const firstDay = new Date(year, month, 1).getDay() // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // 6행 맞추기
  while (cells.length % 7 !== 0) cells.push(null)

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
              const isToday = key === todayKey
              const isSun = col === 0
              const isSat = col === 6
              const isLastRow = idx >= cells.length - 7

              return (
                <div
                  key={key}
                  className={`h-16 p-1 flex flex-col items-center border-b border-r border-gray-50
                    ${isLastRow ? 'border-b-0' : ''}
                    ${col === 6 ? 'border-r-0' : ''}
                    ${isToday ? 'bg-eco-green-100/40' : ''}`}
                >
                  {/* 날짜 숫자 */}
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                    ${isToday ? 'bg-eco-green text-white' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-gray-700'}`}>
                    {day}
                  </div>

                  {/* 수입 뱃지 */}
                  {data && (
                    <div className="mt-0.5 flex flex-col items-center gap-0.5 w-full">
                      <div className={`w-full text-center text-[9px] font-bold px-0.5 py-0.5 rounded-md
                        ${data.count >= 3 ? 'bg-eco-green text-white' : data.count >= 2 ? 'bg-eco-green/70 text-white' : 'bg-eco-green/20 text-eco-green'}`}>
                        {data.count}건
                      </div>
                      <span className="text-[9px] font-semibold text-gray-600 leading-tight">
                        {fmt만(data.amount)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 범례 */}
        <div className="flex items-center gap-3 mt-2 px-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-eco-green" />
            <span className="text-[10px] text-gray-400">3건 이상</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-eco-green/70" />
            <span className="text-[10px] text-gray-400">2건</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-eco-green/20" />
            <span className="text-[10px] text-gray-400">1건</span>
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
                        {isExpanded ? <ChevronLeft className="w-4 h-4 text-gray-300 rotate-90" /> : <ChevronRight className="w-4 h-4 text-gray-300 -rotate-90" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }}
                        className="border-t border-gray-100 px-4 py-3 space-y-2"
                      >
                        {s.net_amount && (
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
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
