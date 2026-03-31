import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, MapPin, Banknote } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function DriverStats() {
  const { user } = useAuth()
  const driverId = (user as any)?.id

  const [todayStores, setTodayStores] = useState(0)
  const [todayWeight, setTodayWeight] = useState(0)
  const [todayIncome, setTodayIncome] = useState(0)
  const [weeklyData, setWeeklyData] = useState([
    { day: '월', kg: 0 }, { day: '화', kg: 0 }, { day: '수', kg: 0 },
    { day: '목', kg: 0 }, { day: '금', kg: 0 }, { day: '토', kg: 0 }, { day: '일', kg: 0 },
  ])
  const weekTotal = weeklyData.reduce((s, d) => s + d.kg, 0)

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any
    const load = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data: todayPickups } = await db
        .from('pickups').select('total_weight, settlement_amount')
        .eq('driver_id', driverId).eq('status', 'COMPLETED')
        .gte('completed_at', today + 'T00:00:00')
      if (todayPickups) {
        setTodayStores(todayPickups.length)
        setTodayWeight(todayPickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0))
        setTodayIncome(todayPickups.reduce((s: number, p: any) => s + (p.settlement_amount || 0), 0))
      }

      const now = new Date()
      const dow = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow))
      monday.setHours(0, 0, 0, 0)
      const { data: weekPickups } = await db
        .from('pickups').select('completed_at, total_weight')
        .eq('driver_id', driverId).eq('status', 'COMPLETED')
        .gte('completed_at', monday.toISOString())
      if (weekPickups) {
        const days = ['월', '화', '수', '목', '금', '토', '일']
        const acc: Record<string, number> = {}
        weekPickups.forEach((p: any) => {
          const d = new Date(p.completed_at)
          const idx = d.getDay() === 0 ? 6 : d.getDay() - 1
          acc[days[idx]] = (acc[days[idx]] || 0) + (p.total_weight || 0)
        })
        setWeeklyData(days.map(d => ({ day: d, kg: acc[d] || 0 })))
      }
    }
    load()
  }, [driverId])

  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1 })()
  const stats = [
    { icon: MapPin, label: '수거 매장', value: todayStores.toString(), unit: '곳', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Package, label: '총 수거량', value: todayWeight.toLocaleString(), unit: 'kg', color: 'text-eco-green', bg: 'bg-eco-green-100' },
    { icon: Banknote, label: '예상 수입', value: todayIncome.toLocaleString(), unit: '원', color: 'text-amber-600', bg: 'bg-amber-50' },
  ]
  const maxKg = Math.max(...weeklyData.map(d => d.kg), 1)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="px-5 mt-6 pb-28"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">오늘 실적</h2>
        <button className="text-xs text-eco-green font-medium flex items-center gap-0.5">
          전체 보기
          <TrendingUp className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
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
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mx-auto`}>
                <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <p className="text-base font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-[10px] text-gray-400 font-medium">{stat.unit}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-card mt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">이번 주 수거 기록</h3>
        </div>
        <div className="flex items-end gap-1.5 h-24">
          {weeklyData.map((d, i) => {
            const height = d.kg > 0 ? Math.max((d.kg / maxKg) * 100, 8) : 4
            const isToday = i === todayIdx
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                {d.kg > 0 && (
                  <span className="text-[9px] text-gray-400 font-medium">
                    {d.kg >= 1000 ? `${(d.kg / 1000).toFixed(1)}t` : `${d.kg}`}
                  </span>
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.6, delay: 0.7 + i * 0.05, ease: 'easeOut' }}
                  className={`w-full rounded-t-md ${isToday ? 'bg-gradient-to-t from-eco-green to-eco-green-300' : d.kg > 0 ? 'bg-gray-200' : 'bg-gray-100'}`}
                />
                <span className={`text-[10px] font-medium ${isToday ? 'text-eco-green' : 'text-gray-400'}`}>{d.day}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">이번 주 누적</span>
          <span className="text-sm font-bold text-eco-green">{weekTotal.toLocaleString()} kg</span>
        </div>
      </div>
    </motion.section>
  )
}
