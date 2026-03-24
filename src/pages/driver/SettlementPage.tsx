import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, Calendar, ChevronDown, ChevronUp, Scale, MapPin } from 'lucide-react'
import { dummySettlements, dummyPickups } from '../../lib/dummyData'

const statusStyle: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-amber-50 text-amber-600' },
  CONFIRMED: { label: '확정', color: 'bg-blue-50 text-blue-600' },
  PAID: { label: '지급 완료', color: 'bg-eco-green-100 text-eco-green' },
  DISPUTED: { label: '이의 제기', color: 'bg-red-50 text-red-500' },
}

export default function SettlementPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 요약 데이터 계산
  const completedPickups = dummyPickups.filter(p => p.status === 'COMPLETED')
  const todayAmount = completedPickups
    .filter(p => {
      const d = new Date(p.completed_at || '')
      const today = new Date()
      return d.toDateString() === today.toDateString()
    })
    .reduce((s, p) => s + (p.settlement_amount || 0), 0)

  const weekAmount = dummySettlements[0]?.gross_amount || 0
  const monthAmount = dummySettlements.reduce((s, st) => s + st.gross_amount, 0)

  const summaryCards = [
    { label: '오늘', amount: todayAmount, icon: Wallet, color: 'text-eco-green', bg: 'bg-eco-green-100' },
    { label: '이번 주', amount: weekAmount, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '이번 달', amount: monthAmount, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  // 주간 바 차트 데이터
  const weeklyData = [
    { day: '월', amount: 85600 },
    { day: '화', amount: 78400 },
    { day: '수', amount: 108000 },
    { day: '목', amount: 96000 },
    { day: '금', amount: 68000 },
    { day: '토', amount: 102400 },
    { day: '일', amount: 0 },
  ]
  const maxAmount = Math.max(...weeklyData.map(d => d.amount))

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">정산</h1>
      </header>

      <div className="px-5 py-4">
        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-2.5">
          {summaryCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-3 shadow-card text-center"
              >
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mx-auto`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 mt-2">
                  {card.amount > 0 ? `${(card.amount / 10000).toFixed(1)}만` : '0'}
                </p>
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
          className="bg-white rounded-2xl p-4 shadow-card mt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">이번 주 수입</h3>
            <span className="text-[11px] text-gray-400">3/18 ~ 3/24</span>
          </div>

          <div className="flex items-end gap-1.5 h-28">
            {weeklyData.map((d, i) => {
              const height = d.amount > 0 ? Math.max((d.amount / maxAmount) * 100, 8) : 4
              const isToday = i === 5 // 토요일 (오늘)
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  {d.amount > 0 && (
                    <span className="text-[9px] text-gray-400">{(d.amount / 10000).toFixed(1)}만</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                    className={`w-full rounded-t-md ${
                      isToday ? 'bg-gradient-to-t from-eco-green to-eco-green-300' : d.amount > 0 ? 'bg-gray-200' : 'bg-gray-100'
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? 'text-eco-green' : 'text-gray-400'}`}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 정산 내역 */}
        <div className="mt-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">정산 내역</h3>
          <div className="space-y-2.5">
            {dummySettlements.map((settlement, idx) => {
              const isExpanded = expandedId === settlement.id
              const style = statusStyle[settlement.status]
              const startDate = new Date(settlement.period_start)
              const endDate = new Date(settlement.period_end)
              const periodStr = `${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${endDate.getMonth() + 1}/${endDate.getDate()}`

              return (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  className="bg-white rounded-2xl shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : settlement.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400">{periodStr}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.color}`}>
                            {style.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Scale className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{settlement.total_weight.toLocaleString()}kg</span>
                          </div>
                          <span className="text-xs text-gray-400">×</span>
                          <span className="text-xs text-gray-600">{settlement.rate_per_kg}원/kg</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">
                          {settlement.gross_amount.toLocaleString()}원
                        </p>
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
                      <p className="text-[11px] font-semibold text-gray-500 mb-2">일별 상세</p>
                      {[
                        { date: '3/18 (월)', weight: 1100, amount: 88000 },
                        { date: '3/19 (화)', weight: 980, amount: 78400 },
                        { date: '3/20 (수)', weight: 1350, amount: 108000 },
                        { date: '3/21 (목)', weight: 1200, amount: 96000 },
                        { date: '3/22 (금)', weight: 850, amount: 68000 },
                        { date: '3/23 (토)', weight: 1250, amount: 100000 },
                      ].map(d => (
                        <div key={d.date} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-500">{d.date}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600">{d.weight.toLocaleString()}kg</span>
                            <span className="text-xs font-semibold text-gray-800">{d.amount.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}
                      {settlement.paid_at && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-[11px] text-eco-green">
                            지급일: {new Date(settlement.paid_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* 계좌 정보 */}
        <div className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-8">
          <h3 className="text-sm font-bold text-gray-800 mb-2">정산 계좌</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">국민은행</p>
              <p className="text-sm font-semibold text-gray-800">123-456-789012</p>
            </div>
            <span className="text-xs text-gray-400">박민수</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">매주 월요일 정산, 수요일 지급</p>
        </div>
      </div>
    </div>
  )
}
