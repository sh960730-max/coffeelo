import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet, TrendingDown, Calendar, Leaf, Recycle,
  ChevronDown, ChevronUp, ArrowDownRight
} from 'lucide-react'

// 카페 관점: 폐기물 처리비 절감 정산
const monthlySavings = [
  {
    id: 'ms1',
    month: '2026년 3월',
    totalWeight: 80,
    pickupCount: 12,
    wasteDisposalSaved: 48000,  // 폐기물 처리비 절감액
    details: [
      { week: '3/17 ~ 3/23', weight: 23, pickups: 4, saved: 13800 },
      { week: '3/10 ~ 3/16', weight: 28, pickups: 4, saved: 16800 },
      { week: '3/3 ~ 3/9', weight: 18, pickups: 2, saved: 10800 },
      { week: '3/1 ~ 3/2', weight: 11, pickups: 2, saved: 6600 },
    ],
  },
  {
    id: 'ms2',
    month: '2026년 2월',
    totalWeight: 95,
    pickupCount: 15,
    wasteDisposalSaved: 57000,
    details: [
      { week: '2/24 ~ 2/28', weight: 22, pickups: 3, saved: 13200 },
      { week: '2/17 ~ 2/23', weight: 25, pickups: 4, saved: 15000 },
      { week: '2/10 ~ 2/16', weight: 28, pickups: 4, saved: 16800 },
      { week: '2/3 ~ 2/9', weight: 20, pickups: 4, saved: 12000 },
    ],
  },
]

// 주간 차트 데이터 (이번 주 수거량)
const weeklyData = [
  { day: '월', weight: 5 },
  { day: '화', weight: 3 },
  { day: '수', weight: 8 },
  { day: '목', weight: 6 },
  { day: '금', weight: 0 },
  { day: '토', weight: 4 },
  { day: '일', weight: 0 },
]

export default function CafeSettlementPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const maxWeight = Math.max(...weeklyData.map(d => d.weight))
  const thisMonthData = monthlySavings[0]

  const summaryCards = [
    {
      label: '이번 달 절감',
      amount: thisMonthData.wasteDisposalSaved,
      icon: Wallet,
      color: 'text-eco-green',
      bg: 'bg-eco-green-100',
    },
    {
      label: '총 수거량',
      amount: thisMonthData.totalWeight,
      unit: 'kg',
      icon: Recycle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '수거 횟수',
      amount: thisMonthData.pickupCount,
      unit: '회',
      icon: Calendar,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">정산</h1>
      </header>

      <div className="px-5 py-4">
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
              {(thisMonthData.wasteDisposalSaved / 10000).toFixed(1)}
            </span>
            <span className="text-lg text-white/80 font-semibold">만원</span>
          </div>
          <p className="text-xs text-white/50 mt-1">이번 달 기준</p>

          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{thisMonthData.totalWeight}kg</p>
              <p className="text-[10px] text-white/60">커피박 수거</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{thisMonthData.pickupCount}회</p>
              <p className="text-[10px] text-white/60">수거 횟수</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center gap-0.5 justify-center">
                <ArrowDownRight className="w-3.5 h-3.5 text-green-300" />
                <p className="text-lg font-bold text-white">32%</p>
              </div>
              <p className="text-[10px] text-white/60">폐기물 감소</p>
            </div>
          </div>
        </motion.div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {summaryCards.map((card, idx) => {
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
                <p className="text-sm font-bold text-gray-900 mt-2">
                  {card.unit
                    ? `${card.amount}${card.unit}`
                    : `${(card.amount / 10000).toFixed(1)}만`
                  }
                </p>
                <p className="text-[10px] text-gray-400">{card.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* 주간 수거량 차트 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-card mt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">이번 주 수거량</h3>
            <span className="text-[11px] text-gray-400">3/18 ~ 3/24</span>
          </div>

          <div className="flex items-end gap-1.5 h-28">
            {weeklyData.map((d, i) => {
              const height = d.weight > 0 ? Math.max((d.weight / maxWeight) * 100, 8) : 4
              const isToday = i === 0 // 월요일 (오늘 기준)
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
                        : d.weight > 0
                          ? 'bg-gray-200'
                          : 'bg-gray-100'
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? 'text-eco-green' : 'text-gray-400'}`}>
                    {d.day}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 환경 기여 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-eco-green/5 to-coffee-brown/5 rounded-2xl p-4 mt-4 border border-eco-green/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-eco-green" />
            <h3 className="text-sm font-bold text-gray-800">환경 기여 효과</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">175kg</p>
              <p className="text-[10px] text-gray-500">누적 커피박 수거</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">105만</p>
              <p className="text-[10px] text-gray-500">누적 절감 금액</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">73kg</p>
              <p className="text-[10px] text-gray-500">CO2 절감</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-eco-green">8.2그루</p>
              <p className="text-[10px] text-gray-500">나무 환산</p>
            </div>
          </div>
        </motion.div>

        {/* 월별 정산 내역 */}
        <div className="mt-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">월별 정산</h3>
          <div className="space-y-2.5">
            {monthlySavings.map((ms, idx) => {
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
                          {ms.wasteDisposalSaved.toLocaleString()}원
                        </p>
                        <p className="text-[10px] text-gray-400">절감</p>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-300 ml-auto mt-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-300 ml-auto mt-1" />
                        )}
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
                      {ms.details.map(d => (
                        <div key={d.week} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-500">{d.week}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600">{d.weight}kg</span>
                            <span className="text-xs font-semibold text-eco-green">
                              {d.saved.toLocaleString()}원
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
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-8">
          <h3 className="text-sm font-bold text-gray-800 mb-2">정산 안내</h3>
          <div className="space-y-1.5">
            <p className="text-[11px] text-gray-500">
              커피박 수거를 통해 폐기물 처리비를 절감할 수 있습니다.
            </p>
            <p className="text-[11px] text-gray-500">
              평균 절감 단가: <span className="font-semibold text-eco-green">600원/kg</span>
            </p>
            <p className="text-[11px] text-gray-400">
              정산 내역은 매월 1일 확정됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
