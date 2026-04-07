import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TreePine, Leaf, Award, Recycle, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const rewardLevels = [
  { name: '씨앗', threshold: 0,   emoji: '🌱', desc: '환경 여정의 시작' },
  { name: '새싹', threshold: 10,  emoji: '🌿', desc: '싹이 트고 있어요' },
  { name: '나무', threshold: 30,  emoji: '🌳', desc: '든든한 나무로 성장' },
  { name: '숲',   threshold: 60,  emoji: '🏞️', desc: '숲을 이루고 있어요' },
  { name: '지구', threshold: 100, emoji: '🌍', desc: '지구를 지키는 영웅' },
]

interface MonthStat {
  month: string
  kg: number
  co2: number
}

export default function CafeEcoDetailPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const cafeId = (user as any)?.id

  const [totalKg, setTotalKg] = useState(0)
  const [monthlyStats, setMonthlyStats] = useState<MonthStat[]>([])
  const [pickupCount, setPickupCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cafeId) return
    fetchStats()
  }, [cafeId])

  const fetchStats = async () => {
    const db = supabase as any

    // 전체 완료 수거
    const { data: allData } = await db
      .from('pickups')
      .select('total_weight, completed_at, updated_at')
      .eq('cafe_id', cafeId)
      .eq('status', 'COMPLETED')
      .order('completed_at', { ascending: true })

    if (allData) {
      const kg = allData.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
      setTotalKg(Math.round(kg * 10) / 10)
      setPickupCount(allData.length)

      // 최근 6개월 통계 생성
      const monthMap: Record<string, number> = {}
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthMap[key] = 0
      }

      allData.forEach((p: any) => {
        const date = new Date(p.completed_at || p.updated_at)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (key in monthMap) {
          monthMap[key] += p.total_weight || 0
        }
      })

      const stats: MonthStat[] = Object.entries(monthMap).map(([key, kg]) => {
        const [, m] = key.split('-')
        return {
          month: `${parseInt(m)}월`,
          kg: Math.round(kg * 10) / 10,
          co2: Math.round(kg * 0.9 * 10) / 10,
        }
      })
      setMonthlyStats(stats)
    }
    setLoading(false)
  }

  const totalCo2 = Math.round(totalKg * 0.9 * 10) / 10
  const totalTrees = Math.round((totalCo2 / 9) * 10) / 10

  // 현재 달 수거량
  const currentMonthKg = monthlyStats[monthlyStats.length - 1]?.kg ?? 0

  // 등급 계산
  const gradeLevel = rewardLevels.filter(l => l.threshold <= currentMonthKg).length
  const currentGrade = rewardLevels[Math.min(gradeLevel - 1, 4)] || rewardLevels[0]
  const nextGrade = rewardLevels[gradeLevel] || rewardLevels[4]
  const progressToNext = nextGrade.threshold > currentGrade.threshold
    ? Math.min(((currentMonthKg - currentGrade.threshold) / (nextGrade.threshold - currentGrade.threshold)) * 100, 100)
    : 100

  const maxKg = Math.max(...monthlyStats.map(s => s.kg), 1)

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">나의 환경 기여</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-eco-green/30 border-t-eco-green rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-5 py-5 space-y-4">

          {/* 누적 요약 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-eco-green to-eco-green-600 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-white/80" />
              <span className="text-sm font-semibold text-white/90">누적 환경 기여</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalKg}</p>
                <p className="text-[11px] text-white/70 mt-0.5">kg 수거</p>
              </div>
              <div className="text-center border-x border-white/20">
                <p className="text-2xl font-bold">{totalCo2}</p>
                <p className="text-[11px] text-white/70 mt-0.5">kg CO2 절감</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalTrees}</p>
                <p className="text-[11px] text-white/70 mt-0.5">그루 나무</p>
              </div>
            </div>
            <p className="text-[11px] text-white/60 text-center mt-3">
              총 {pickupCount}회 수거 완료 · 커피박 1kg = CO2 0.9kg 절감
            </p>
          </motion.div>

          {/* 월별 수거 현황 차트 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4.5 h-4.5 text-eco-green" />
              <h3 className="text-sm font-bold text-gray-900">월별 수거량</h3>
            </div>

            {monthlyStats.every(s => s.kg === 0) ? (
              <p className="text-center text-xs text-gray-400 py-6">아직 수거 기록이 없습니다</p>
            ) : (
              <div className="flex items-end justify-between gap-1.5 h-28">
                {monthlyStats.map((stat, i) => {
                  const barH = maxKg > 0 ? (stat.kg / maxKg) * 100 : 0
                  const isLast = i === monthlyStats.length - 1
                  return (
                    <div key={stat.month} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-[10px] font-semibold text-eco-green">
                        {stat.kg > 0 ? `${stat.kg}` : ''}
                      </p>
                      <div className="w-full flex items-end" style={{ height: 72 }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(barH, stat.kg > 0 ? 8 : 0)}%` }}
                          transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: 'easeOut' }}
                          className={`w-full rounded-t-lg ${isLast ? 'bg-eco-green' : 'bg-eco-green-100'}`}
                          style={{ minHeight: stat.kg > 0 ? 6 : 0 }}
                        />
                      </div>
                      <p className={`text-[10px] font-medium ${isLast ? 'text-eco-green' : 'text-gray-400'}`}>
                        {stat.month}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* 이번 달 등급 현황 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="text-sm font-bold text-gray-900">이번 달 환경 등급</h3>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {currentGrade.emoji}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{currentGrade.name} 등급</p>
                <p className="text-xs text-gray-500 mt-0.5">{currentGrade.desc}</p>
                <p className="text-xs text-eco-green font-medium mt-1">
                  이번 달 {currentMonthKg}kg 수거
                </p>
              </div>
            </div>

            {nextGrade.threshold > currentMonthKg ? (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-gray-500">{currentGrade.emoji} {currentGrade.name}</span>
                  <span className="text-[11px] text-eco-green font-medium">
                    {nextGrade.emoji} {nextGrade.name}까지 {Math.round((nextGrade.threshold - currentMonthKg) * 10) / 10}kg
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-1">
                <p className="text-sm font-bold text-eco-green">🎉 최고 등급 달성!</p>
              </div>
            )}
          </motion.div>

          {/* 등급 안내 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Recycle className="w-4.5 h-4.5 text-eco-green" />
              <h3 className="text-sm font-bold text-gray-900">등급 기준</h3>
              <span className="text-[10px] text-gray-400 font-normal">월 수거량 기준</span>
            </div>

            <div className="space-y-2.5">
              {rewardLevels.map((level, i) => {
                const isAchieved = currentMonthKg >= level.threshold
                const isCurrent = level.name === currentGrade.name
                return (
                  <div
                    key={level.name}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isCurrent ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{level.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-amber-600' : isAchieved ? 'text-gray-700' : 'text-gray-400'}`}>
                          {level.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">현재</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{level.desc}</p>
                    </div>
                    <span className={`text-xs font-medium ${isAchieved ? 'text-eco-green' : 'text-gray-400'}`}>
                      {i === 0 ? '시작' : `${level.threshold}kg+`}
                    </span>
                    {isAchieved && (
                      <div className="w-5 h-5 bg-eco-green rounded-full flex items-center justify-center flex-shrink-0">
                        <TreePine className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* 환경 기여 의미 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-eco-green-100/60 rounded-2xl p-4"
          >
            <p className="text-[11px] text-eco-green-600 font-medium leading-relaxed text-center">
              ☕ 커피박 1kg 재활용 = CO2 약 0.9kg 절감<br />
              🌳 나무 한 그루 연간 CO2 흡수량 약 9kg 기준<br />
              지구를 위한 작은 실천이 큰 변화를 만듭니다
            </p>
          </motion.div>

        </div>
      )}
    </div>
  )
}
