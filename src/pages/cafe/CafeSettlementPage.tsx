import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet, TrendingDown, Calendar, Leaf, Recycle,
  ChevronDown, ChevronUp, ArrowDownRight, Loader2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const dayNames = ['일', '월', '화', '수', '목', '금', '토']

interface MonthlyRecord {
  id: string       // YYYY-MM
  month: string    // 표시용 "2026년 3월"
  totalWeight: number
  pickupCount: number
  savedAmount: number
  weeks: { label: string; weight: number; pickups: number; saved: number }[]
}

interface WeekDay { day: string; weight: number }

export default function CafeSettlementPage() {
  const { user } = useAuth()
  const cafeId = (user as any)?.id

  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 이번 달
  const [monthWeight, setMonthWeight] = useState(0)
  const [monthCount,  setMonthCount]  = useState(0)
  const [monthSaved,  setMonthSaved]  = useState(0)

  // 주간 차트
  const [weeklyData, setWeeklyData] = useState<WeekDay[]>(
    ['월', '화', '수', '목', '금', '토', '일'].map(d => ({ day: d, weight: 0 }))
  )
  const [weekLabel, setWeekLabel] = useState('')

  // 누적
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalSaved,  setTotalSaved]  = useState(0)

  // 월별
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([])

  useEffect(() => {
    if (!cafeId) return
    fetchAll()
  }, [cafeId])

  const fetchAll = async () => {
    setLoading(true)
    const db = supabase as any

    // 완료 수거 전체 (cafe_id 기준)
    const { data: allPickups } = await db
      .from('pickups')
      .select('id, total_weight, completed_at, created_at')
      .eq('cafe_id', cafeId)
      .eq('status', 'COMPLETED')
      .order('completed_at', { ascending: false })

    if (!allPickups) { setLoading(false); return }

    const now = new Date()

    // ── 이번 달 ──
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthPickups = allPickups.filter((p: any) =>
      p.completed_at && new Date(p.completed_at) >= firstOfMonth
    )
    const mWeight = thisMonthPickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
    const mSaved  = Math.round(mWeight * 600)
    setMonthWeight(Math.round(mWeight * 10) / 10)
    setMonthCount(thisMonthPickups.length)
    setMonthSaved(mSaved)

    // ── 이번 주 차트 ──
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // 이번 주 월요일
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const wLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
    setWeekLabel(wLabel)

    const wData: WeekDay[] = ['월', '화', '수', '목', '금', '토', '일'].map(d => ({ day: d, weight: 0 }))
    allPickups.forEach((p: any) => {
      if (!p.completed_at) return
      const d = new Date(p.completed_at)
      if (d < weekStart || d > weekEnd) return
      const dayIdx = (d.getDay() + 6) % 7 // 0=월 ... 6=일
      wData[dayIdx].weight = Math.round((wData[dayIdx].weight + (p.total_weight || 0)) * 10) / 10
    })
    setWeeklyData(wData)

    // ── 누적 ──
    const totW = allPickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
    setTotalWeight(Math.round(totW * 10) / 10)
    setTotalSaved(Math.round(totW * 600))

    // ── 월별 정산 ──
    const monthMap: Record<string, { pickups: any[]; key: string }> = {}
    allPickups.forEach((p: any) => {
      const d = new Date(p.completed_at || p.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthMap[key]) monthMap[key] = { pickups: [], key }
      monthMap[key].pickups.push(p)
    })

    const records: MonthlyRecord[] = Object.entries(monthMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([key, { pickups }]) => {
        const [y, m] = key.split('-')
        const w = pickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
        const saved = Math.round(w * 600)

        // 주차별 분류
        const weekMap: Record<number, { weight: number; pickups: number }> = {}
        pickups.forEach((p: any) => {
          const d = new Date(p.completed_at || p.created_at)
          const weekNum = Math.ceil(d.getDate() / 7)
          if (!weekMap[weekNum]) weekMap[weekNum] = { weight: 0, pickups: 0 }
          weekMap[weekNum].weight += p.total_weight || 0
          weekMap[weekNum].pickups += 1
        })

        const weeks = Object.entries(weekMap)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([wn, v]) => {
            const startDay = (Number(wn) - 1) * 7 + 1
            const endDay   = Math.min(Number(wn) * 7, new Date(Number(y), Number(m), 0).getDate())
            return {
              label: `${m}/${startDay} ~ ${m}/${endDay}`,
              weight: Math.round(v.weight * 10) / 10,
              pickups: v.pickups,
              saved: Math.round(v.weight * 600),
            }
          })

        return {
          id: key,
          month: `${y}년 ${Number(m)}월`,
          totalWeight: Math.round(w * 10) / 10,
          pickupCount: pickups.length,
          savedAmount: saved,
          weeks,
        }
      })

    setMonthlyRecords(records)
    setLoading(false)
  }

  const maxWeeklyWeight = Math.max(...weeklyData.map(d => d.weight), 1)
  const todayDayIdx = (new Date().getDay() + 6) % 7 // 0=월

  const co2Saved   = Math.round(totalWeight * 0.9 * 10) / 10
  const treesEquiv = Math.round((co2Saved / 9) * 10) / 10

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-7 h-7 text-eco-green animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">정산</h1>
      </header>

      <div className="px-5 py-4 space-y-4">

        {/* 메인 절감 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-white/70" />
            <span className="text-xs text-white/70 font-medium">폐기물 처리비 절감</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {monthSaved >= 10000
                ? (monthSaved / 10000).toFixed(1)
                : monthSaved.toLocaleString()}
            </span>
            <span className="text-lg text-white/80 font-semibold">
              {monthSaved >= 10000 ? '만원' : '원'}
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">이번 달 기준</p>

          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{monthWeight}kg</p>
              <p className="text-[10px] text-white/60">커피박 수거</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{monthCount}회</p>
              <p className="text-[10px] text-white/60">수거 횟수</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center gap-0.5 justify-center">
                <ArrowDownRight className="w-3.5 h-3.5 text-green-300" />
                <p className="text-lg font-bold text-white">
                  {monthCount > 0 ? Math.min(Math.round(monthWeight * 0.4), 99) : 0}%
                </p>
              </div>
              <p className="text-[10px] text-white/60">폐기물 감소</p>
            </div>
          </div>
        </motion.div>

        {/* 요약 카드 3개 */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: '이번 달 절감', value: monthSaved >= 10000 ? `${(monthSaved / 10000).toFixed(1)}만` : `${monthSaved}원`, icon: Wallet, color: 'text-eco-green', bg: 'bg-eco-green-100' },
            { label: '총 수거량',    value: `${monthWeight}kg`,                                                                  icon: Recycle, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '수거 횟수',    value: `${monthCount}회`,                                                                    icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className="bg-white rounded-xl p-3 shadow-card text-center"
              >
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mx-auto`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-[10px] text-gray-400">{card.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* 주간 차트 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">이번 주 수거량</h3>
            <span className="text-[11px] text-gray-400">{weekLabel}</span>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {weeklyData.map((d, i) => {
              const height = d.weight > 0 ? Math.max((d.weight / maxWeeklyWeight) * 100, 8) : 4
              const isToday = i === todayDayIdx
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  {d.weight > 0 && (
                    <span className="text-[9px] text-gray-400">{d.weight}kg</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                    className={`w-full rounded-t-md ${
                      isToday
                        ? 'bg-gradient-to-t from-eco-green to-eco-green-300'
                        : d.weight > 0 ? 'bg-gray-200' : 'bg-gray-100'
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? 'text-eco-green' : 'text-gray-400'}`}>
                    {d.day}
                  </span>
                </div>
              )
            })}
          </div>
          {weeklyData.every(d => d.weight === 0) && (
            <p className="text-center text-xs text-gray-400 mt-2">이번 주 완료된 수거가 없습니다</p>
          )}
        </motion.div>

        {/* 환경 기여 효과 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-eco-green/5 to-coffee-brown/5 rounded-2xl p-4 border border-eco-green/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-eco-green" />
            <h3 className="text-sm font-bold text-gray-800">환경 기여 효과</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">{totalWeight}kg</p>
              <p className="text-[10px] text-gray-500">누적 커피박 수거</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">
                {totalSaved >= 10000 ? `${(totalSaved / 10000).toFixed(1)}만` : `${totalSaved}원`}
              </p>
              <p className="text-[10px] text-gray-500">누적 절감 금액</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">{co2Saved}kg</p>
              <p className="text-[10px] text-gray-500">CO2 절감</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">{treesEquiv}그루</p>
              <p className="text-[10px] text-gray-500">나무 환산</p>
            </div>
          </div>
        </motion.div>

        {/* 월별 정산 */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">월별 정산</h3>
          {monthlyRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-card text-center">
              <p className="text-sm text-gray-400">완료된 수거가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {monthlyRecords.map((ms, idx) => {
                const isExpanded = expandedId === ms.id
                return (
                  <motion.div
                    key={ms.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.08 }}
                    className="bg-white rounded-2xl shadow-card overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : ms.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{ms.month}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Recycle className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{ms.totalWeight}kg</span>
                            </div>
                            <span className="text-xs text-gray-400">{ms.pickupCount}회 수거</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-eco-green">
                            {ms.savedAmount.toLocaleString()}원
                          </p>
                          <p className="text-[10px] text-gray-400">절감</p>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-300 ml-auto mt-1" />
                            : <ChevronDown className="w-4 h-4 text-gray-300 ml-auto mt-1" />}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="border-t border-gray-100 px-4 py-3"
                      >
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">주간 상세</p>
                        {ms.weeks.map(w => (
                          <div key={w.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-xs text-gray-500">{w.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-600">{w.weight}kg</span>
                              <span className="text-xs font-semibold text-eco-green">
                                {w.saved.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* 정산 안내 */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-8">
          <h3 className="text-sm font-bold text-gray-800 mb-2">정산 안내</h3>
          <div className="space-y-1.5">
            <p className="text-[11px] text-gray-500">커피박 수거를 통해 폐기물 처리비를 절감할 수 있습니다.</p>
            <p className="text-[11px] text-gray-500">
              평균 절감 단가: <span className="font-semibold text-eco-green">600원/kg</span>
            </p>
            <p className="text-[11px] text-gray-400">정산 내역은 매월 1일 확정됩니다.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
