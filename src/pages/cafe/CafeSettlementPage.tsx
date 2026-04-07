import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Gift, Star, Recycle, Calendar, ChevronDown, ChevronUp,
  Loader2, ShoppingBag, Leaf, Sparkles
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

// 1kg = 100P
const POINTS_PER_KG = 100

interface MonthlyRecord {
  id: string
  month: string
  totalWeight: number
  pickupCount: number
  points: number
  weeks: { label: string; weight: number; pickups: number; points: number }[]
}

interface WeekDay { day: string; weight: number }

export default function CafeSettlementPage() {
  const { user } = useAuth()
  const cafeId = (user as any)?.id

  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [monthWeight, setMonthWeight] = useState(0)
  const [monthCount,  setMonthCount]  = useState(0)

  const [weeklyData, setWeeklyData] = useState<WeekDay[]>(
    ['월', '화', '수', '목', '금', '토', '일'].map(d => ({ day: d, weight: 0 }))
  )
  const [weekLabel, setWeekLabel] = useState('')

  const [totalWeight, setTotalWeight] = useState(0)
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([])

  useEffect(() => {
    if (!cafeId) return
    fetchAll()
  }, [cafeId])

  const fetchAll = async () => {
    setLoading(true)
    const db = supabase as any

    const { data: allPickups } = await db
      .from('pickups')
      .select('id, total_weight, completed_at, created_at')
      .eq('cafe_id', cafeId)
      .eq('status', 'COMPLETED')
      .order('completed_at', { ascending: false })

    if (!allPickups) { setLoading(false); return }

    const now = new Date()

    // 이번 달
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthPickups = allPickups.filter((p: any) =>
      p.completed_at && new Date(p.completed_at) >= firstOfMonth
    )
    const mWeight = thisMonthPickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
    setMonthWeight(Math.round(mWeight * 10) / 10)
    setMonthCount(thisMonthPickups.length)

    // 이번 주 차트
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    setWeekLabel(`${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`)

    const wData: WeekDay[] = ['월', '화', '수', '목', '금', '토', '일'].map(d => ({ day: d, weight: 0 }))
    allPickups.forEach((p: any) => {
      if (!p.completed_at) return
      const d = new Date(p.completed_at)
      if (d < weekStart || d > weekEnd) return
      const dayIdx = (d.getDay() + 6) % 7
      wData[dayIdx].weight = Math.round((wData[dayIdx].weight + (p.total_weight || 0)) * 10) / 10
    })
    setWeeklyData(wData)

    // 누적
    const totW = allPickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
    setTotalWeight(Math.round(totW * 10) / 10)

    // 월별
    const monthMap: Record<string, { pickups: any[] }> = {}
    allPickups.forEach((p: any) => {
      const d = new Date(p.completed_at || p.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthMap[key]) monthMap[key] = { pickups: [] }
      monthMap[key].pickups.push(p)
    })

    const records: MonthlyRecord[] = Object.entries(monthMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([key, { pickups }]) => {
        const [y, m] = key.split('-')
        const w = pickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)

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
              points: Math.round(v.weight * POINTS_PER_KG),
            }
          })

        return {
          id: key,
          month: `${y}년 ${Number(m)}월`,
          totalWeight: Math.round(w * 10) / 10,
          pickupCount: pickups.length,
          points: Math.round(w * POINTS_PER_KG),
          weeks,
        }
      })

    setMonthlyRecords(records)
    setLoading(false)
  }

  const maxWeeklyWeight = Math.max(...weeklyData.map(d => d.weight), 1)
  const todayDayIdx = (new Date().getDay() + 6) % 7

  const totalPoints = Math.round(totalWeight * POINTS_PER_KG)
  const monthPoints = Math.round(monthWeight * POINTS_PER_KG)

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
        <h1 className="text-lg font-bold text-gray-900">리워드</h1>
      </header>

      <div className="px-5 py-4 space-y-4">

        {/* 포인트 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
              <span className="text-xs text-white/70 font-medium">보유 포인트</span>
            </div>
            <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">1kg = {POINTS_PER_KG}P</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-bold text-white">{totalPoints.toLocaleString()}</span>
            <span className="text-lg text-white/80 font-semibold">P</span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">누적 {totalWeight}kg 수거</p>

          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold text-white">+{monthPoints.toLocaleString()}P</p>
              <p className="text-[10px] text-white/60">이번 달 적립</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{monthWeight}kg</p>
              <p className="text-[10px] text-white/60">이번 달 수거</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{monthCount}회</p>
              <p className="text-[10px] text-white/60">수거 횟수</p>
            </div>
          </div>
        </motion.div>

        {/* 리워드 스토어 배너 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-800">리워드 스토어</p>
              <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">준비 중</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">포인트로 다양한 친환경 제품을 구매할 수 있어요</p>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
        </motion.div>

        {/* 요약 카드 3개 */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: '이번 달 적립', value: `${monthPoints.toLocaleString()}P`, icon: Gift,    color: 'text-eco-green', bg: 'bg-eco-green-100' },
            { label: '총 수거량',    value: `${monthWeight}kg`,                  icon: Recycle, color: 'text-blue-600',  bg: 'bg-blue-50' },
            { label: '수거 횟수',    value: `${monthCount}회`,                   icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + idx * 0.08 }}
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
              <p className="text-lg font-bold text-eco-green">{totalPoints.toLocaleString()}P</p>
              <p className="text-[10px] text-gray-500">누적 적립 포인트</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">{Math.round(totalWeight * 0.9 * 10) / 10}kg</p>
              <p className="text-[10px] text-gray-500">CO2 절감</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">{Math.round((totalWeight * 0.9 / 9) * 10) / 10}그루</p>
              <p className="text-[10px] text-gray-500">나무 환산</p>
            </div>
          </div>
        </motion.div>

        {/* 월별 적립 내역 */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">월별 적립 내역</h3>
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
                            +{ms.points.toLocaleString()}P
                          </p>
                          <p className="text-[10px] text-gray-400">적립</p>
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
                                +{w.points.toLocaleString()}P
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

        {/* 포인트 안내 */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-8">
          <h3 className="text-sm font-bold text-gray-800 mb-2">포인트 안내</h3>
          <div className="space-y-1.5">
            <p className="text-[11px] text-gray-500">커피박 수거량에 따라 포인트가 자동으로 적립됩니다.</p>
            <p className="text-[11px] text-gray-500">
              적립 기준: <span className="font-semibold text-eco-green">1kg = {POINTS_PER_KG}P</span>
            </p>
            <p className="text-[11px] text-gray-500">
              적립된 포인트는 <span className="font-semibold text-amber-600">리워드 스토어(오픈 예정)</span>에서 친환경 제품 구매에 사용할 수 있습니다.
            </p>
            <p className="text-[11px] text-gray-400">포인트 내역은 매월 1일 확정됩니다.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
