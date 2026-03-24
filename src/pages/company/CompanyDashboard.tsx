import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Scale, ClipboardList, Users, Bell,
  TrendingUp, Truck, Circle, ChevronRight, Package
} from 'lucide-react'

/* ── 더미 데이터 ── */
const driverStatuses = [
  { id: 'd1', name: '박민수', truckType: '1톤 트럭', status: 'collecting' as const, todayKg: 385, pickups: 12 },
  { id: 'd2', name: '김영호', truckType: '1톤 트럭', status: 'online' as const, todayKg: 210, pickups: 7 },
  { id: 'd3', name: '이준혁', truckType: '0.5톤 트럭', status: 'collecting' as const, todayKg: 320, pickups: 9 },
  { id: 'd4', name: '최지훈', truckType: '1톤 트럭', status: 'offline' as const, todayKg: 335, pickups: 4 },
]

const statusConfig = {
  online: { label: '온라인', color: 'bg-emerald-400', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  collecting: { label: '수거중', color: 'bg-amber-400', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  offline: { label: '오프라인', color: 'bg-gray-300', textColor: 'text-gray-500', bgColor: 'bg-gray-100' },
}

const summaryCards = [
  { label: '총 수거량', value: '1,250kg', icon: Scale, color: 'text-eco-green', bg: 'bg-eco-green-100', trend: '+12%' },
  { label: '수거 건수', value: '32건', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5건' },
  { label: '활동 기사', value: '8명', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', trend: '' },
]

export default function CompanyDashboard() {
  const [pendingCount] = useState(5)

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-eco-green to-eco-green-700 px-5 pt-6 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/70">소속회사 관리자</span>
            </div>
            <h1 className="text-xl font-bold text-white">그린물류 관리자</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            {pendingCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {pendingCount}
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* 미처리 수거 요청 배너 */}
        <AnimatePresence>
          {pendingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-300" />
                <span className="text-sm text-white font-medium">미배정 수거 요청 {pendingCount}건</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60" />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="px-5 py-4">
        {/* 오늘의 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 mb-3"
        >
          <TrendingUp className="w-4 h-4 text-eco-green" />
          <h2 className="text-sm font-bold text-gray-800">오늘의 현황</h2>
          <span className="text-[11px] text-gray-400 ml-auto">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </span>
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5">
          {summaryCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-xl p-3 shadow-card text-center"
              >
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mx-auto`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-[10px] text-gray-400">{card.label}</p>
                {card.trend && (
                  <span className="text-[9px] text-eco-green font-semibold">{card.trend}</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* 기사 현황 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">기사 현황</h2>
            <div className="flex items-center gap-3">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1">
                  <Circle className={`w-2 h-2 fill-current ${cfg.textColor}`} />
                  <span className="text-[10px] text-gray-400">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {driverStatuses.map((driver, idx) => {
              const cfg = statusConfig[driver.status]
              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                  className="bg-white rounded-xl px-4 py-3 shadow-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center relative">
                      <Truck className="w-5 h-5 text-gray-500" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${cfg.color} rounded-full border-2 border-white`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{driver.name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.textColor}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{driver.truckType} · {driver.pickups}건 수거</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{driver.todayKg}kg</p>
                    <p className="text-[10px] text-gray-400">오늘</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* 빠른 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-4"
        >
          <h3 className="text-sm font-bold text-gray-800 mb-3">이번 주 수거 추이</h3>
          <div className="flex items-end gap-1.5 h-24">
            {[
              { day: '월', kg: 1100 },
              { day: '화', kg: 980 },
              { day: '수', kg: 1350 },
              { day: '목', kg: 1200 },
              { day: '금', kg: 1150 },
              { day: '토', kg: 1250 },
              { day: '일', kg: 0 },
            ].map((d, i) => {
              const maxKg = 1350
              const height = d.kg > 0 ? Math.max((d.kg / maxKg) * 100, 8) : 4
              const isToday = i === new Date().getDay() - 1
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  {d.kg > 0 && (
                    <span className="text-[8px] text-gray-400">{d.kg}</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: 0.6 + i * 0.05 }}
                    className={`w-full rounded-t-md ${
                      isToday
                        ? 'bg-gradient-to-t from-eco-green to-eco-green-300'
                        : d.kg > 0
                          ? 'bg-gray-200'
                          : 'bg-gray-100'
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? 'text-eco-green' : 'text-gray-400'}`}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
