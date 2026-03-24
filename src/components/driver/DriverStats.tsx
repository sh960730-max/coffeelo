import { motion } from 'framer-motion'
import { TrendingUp, Package, MapPin, Banknote } from 'lucide-react'

const todayStats = [
  { icon: MapPin, label: '수거 매장', value: '8', unit: '곳', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Package, label: '총 수거량', value: '1,250', unit: 'kg', color: 'text-eco-green', bg: 'bg-eco-green-100' },
  { icon: Banknote, label: '예상 수입', value: '187,500', unit: '원', color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function DriverStats() {
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
        {todayStats.map((stat, index) => {
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

      {/* 이번 주 수거 요약 */}
      <div className="bg-white rounded-2xl p-4 shadow-card mt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">이번 주 수거 기록</h3>
          <span className="text-[11px] text-gray-400">3/18 ~ 3/24</span>
        </div>

        {/* 간단한 주간 바 차트 */}
        <div className="flex items-end gap-1.5 h-24">
          {[
            { day: '월', kg: 1100, active: false },
            { day: '화', kg: 980, active: false },
            { day: '수', kg: 1350, active: false },
            { day: '목', kg: 1200, active: false },
            { day: '금', kg: 850, active: false },
            { day: '토', kg: 1250, active: true },
            { day: '일', kg: 0, active: false },
          ].map((d, i) => {
            const maxKg = 1350
            const height = d.kg > 0 ? Math.max((d.kg / maxKg) * 100, 8) : 4
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
                  className={`w-full rounded-t-md ${
                    d.active
                      ? 'bg-gradient-to-t from-eco-green to-eco-green-300'
                      : d.kg > 0
                      ? 'bg-gray-200'
                      : 'bg-gray-100'
                  }`}
                />
                <span className={`text-[10px] font-medium ${d.active ? 'text-eco-green' : 'text-gray-400'}`}>
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">이번 주 누적</span>
          <span className="text-sm font-bold text-eco-green">6,730 kg</span>
        </div>
      </div>
    </motion.section>
  )
}
