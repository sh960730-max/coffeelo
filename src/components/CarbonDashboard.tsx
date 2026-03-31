import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { TreePine, Droplets, Award, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1.5, ease: 'easeOut' })
    const unsubscribe = rounded.on('change', (v) => setDisplay(v))
    return () => { controls.stop(); unsubscribe() }
  }, [value, motionValue, rounded])

  return <>{display}{suffix}</>
}

function CircularProgress({ percentage, co2Kg }: { percentage: number; co2Kg: number }) {
  const size = 140
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="url(#progressGradient)"
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (Math.min(percentage, 100) / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3932" />
            <stop offset="100%" stopColor="#3A7D5C" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] text-gray-500 font-medium">이번 달 탄소 절감</p>
        <p className="text-2xl font-bold text-eco-green mt-0.5">
          <AnimatedNumber value={co2Kg} suffix="kg" />
        </p>
        <p className="text-[10px] text-eco-green-400 font-medium">CO2 절감</p>
      </div>
    </div>
  )
}

const rewardLevels = [
  { name: '씨앗', threshold: 0,   emoji: '🌱' },
  { name: '새싹', threshold: 10,  emoji: '🌿' },
  { name: '나무', threshold: 30,  emoji: '🌳' },
  { name: '숲',   threshold: 60,  emoji: '🏞️' },
  { name: '지구', threshold: 100, emoji: '🌍' },
]

export default function CarbonDashboard() {
  const { user } = useAuth()
  const cafeId = (user as any)?.id

  const [monthKg, setMonthKg] = useState(0)
  const [totalKg, setTotalKg] = useState(0)
  const [pickupCount, setPickupCount] = useState(0)

  useEffect(() => {
    if (!cafeId) return
    fetchStats()
  }, [cafeId])

  const fetchStats = async () => {
    const db = supabase as any
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // 이번 달 완료 수거
    const { data: monthData } = await db
      .from('pickups')
      .select('total_weight')
      .eq('cafe_id', cafeId)
      .eq('status', 'COMPLETED')
      .gte('completed_at', firstOfMonth)

    if (monthData) {
      const kg = monthData.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
      setMonthKg(Math.round(kg * 10) / 10)
    }

    // 전체 완료 수거
    const { data: allData } = await db
      .from('pickups')
      .select('total_weight')
      .eq('cafe_id', cafeId)
      .eq('status', 'COMPLETED')

    if (allData) {
      const kg = allData.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
      setTotalKg(Math.round(kg * 10) / 10)
      setPickupCount(allData.length)
    }
  }

  // CO2 환산 (커피박 1kg당 약 0.9kg CO2 절감)
  const co2Kg = Math.round(monthKg * 0.9 * 10) / 10
  const treesEquiv = Math.round((co2Kg / 9) * 10) / 10

  // 리워드 레벨 계산
  const nextLevel = rewardLevels.find(l => l.threshold > monthKg) || rewardLevels[rewardLevels.length - 1]
  const prevLevel = rewardLevels[rewardLevels.indexOf(nextLevel) - 1] || rewardLevels[0]
  const progressToNext = nextLevel.threshold > prevLevel.threshold
    ? ((monthKg - prevLevel.threshold) / (nextLevel.threshold - prevLevel.threshold)) * 100
    : 100

  // 환경 등급
  const gradeLevel = rewardLevels.filter(l => l.threshold <= monthKg).length
  const gradeName = ['씨앗', '새싹', '나무', '숲', '지구'][Math.min(gradeLevel - 1, 4)] || '씨앗'

  const stats = [
    { icon: TreePine, label: '나무 환산', value: treesEquiv.toString(), unit: '그루', color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: Droplets, label: '누적 수거량', value: totalKg.toString(), unit: 'kg', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: Award, label: '환경 등급', value: `Lv.${gradeLevel}`, unit: gradeName, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="px-5 mt-6 pb-28"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">나의 환경 기여</h2>
        <button className="text-xs text-eco-green font-medium flex items-center gap-0.5">
          자세히 보기
          <TrendingUp className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-center">
          <CircularProgress percentage={progressToNext} co2Kg={co2Kg} />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">{prevLevel.emoji} {prevLevel.name}</span>
            <span className="text-xs font-medium text-eco-green">{nextLevel.emoji} {nextLevel.name}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressToNext, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
              className="h-full bg-gradient-to-r from-eco-green to-eco-green-300 rounded-full"
            />
          </div>
          <p className="text-[11px] text-gray-500 text-center mt-2">
            {nextLevel.threshold > monthKg ? (
              <><span className="text-eco-green font-semibold">{nextLevel.name}</span> 등급까지{' '}
              <span className="text-coffee-brown font-semibold">{Math.round((nextLevel.threshold - monthKg) * 10) / 10}kg</span> 남았어요</>
            ) : (
              <><span className="text-eco-green font-semibold">{nextLevel.name}</span> 등급 달성! 🎉</>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="bg-white rounded-xl p-3 shadow-card text-center"
            >
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.unit}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {pickupCount === 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          수거가 완료되면 환경 기여 통계가 표시됩니다 🌿
        </p>
      )}
    </motion.section>
  )
}
