import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Scale, ChevronDown, ChevronUp, CheckCircle, CreditCard,
  Calendar, TrendingUp, Truck
} from 'lucide-react'

/* ── 더미 기사별 정산 ── */
const driverSettlements = [
  {
    id: 'ds1', driverName: '박민수', period: '3/18 ~ 3/24',
    totalKg: 2350, ratePerKg: 80, amount: 188000,
    status: 'pending' as const,
    dailyBreakdown: [
      { date: '3/18', kg: 350, amount: 28000 },
      { date: '3/19', kg: 310, amount: 24800 },
      { date: '3/20', kg: 420, amount: 33600 },
      { date: '3/21', kg: 380, amount: 30400 },
      { date: '3/22', kg: 290, amount: 23200 },
      { date: '3/23', kg: 340, amount: 27200 },
      { date: '3/24', kg: 260, amount: 20800 },
    ],
  },
  {
    id: 'ds2', driverName: '김영호', period: '3/18 ~ 3/24',
    totalKg: 1980, ratePerKg: 80, amount: 158400,
    status: 'pending' as const,
    dailyBreakdown: [
      { date: '3/18', kg: 300, amount: 24000 },
      { date: '3/19', kg: 280, amount: 22400 },
      { date: '3/20', kg: 320, amount: 25600 },
      { date: '3/21', kg: 290, amount: 23200 },
      { date: '3/22', kg: 260, amount: 20800 },
      { date: '3/23', kg: 310, amount: 24800 },
      { date: '3/24', kg: 220, amount: 17600 },
    ],
  },
  {
    id: 'ds3', driverName: '이준혁', period: '3/18 ~ 3/24',
    totalKg: 1450, ratePerKg: 80, amount: 116000,
    status: 'confirmed' as const,
    dailyBreakdown: [
      { date: '3/18', kg: 220, amount: 17600 },
      { date: '3/19', kg: 200, amount: 16000 },
      { date: '3/20', kg: 250, amount: 20000 },
      { date: '3/21', kg: 210, amount: 16800 },
      { date: '3/22', kg: 180, amount: 14400 },
      { date: '3/23', kg: 230, amount: 18400 },
      { date: '3/24', kg: 160, amount: 12800 },
    ],
  },
  {
    id: 'ds4', driverName: '최지훈', period: '3/11 ~ 3/17',
    totalKg: 2100, ratePerKg: 80, amount: 168000,
    status: 'paid' as const,
    dailyBreakdown: [
      { date: '3/11', kg: 310, amount: 24800 },
      { date: '3/12', kg: 290, amount: 23200 },
      { date: '3/13', kg: 340, amount: 27200 },
      { date: '3/14', kg: 300, amount: 24000 },
      { date: '3/15', kg: 280, amount: 22400 },
      { date: '3/16', kg: 330, amount: 26400 },
      { date: '3/17', kg: 250, amount: 20000 },
    ],
  },
]

const statusConfig = {
  pending: { label: '대기', color: 'bg-amber-50 text-amber-600', icon: Calendar },
  confirmed: { label: '확정', color: 'bg-blue-50 text-blue-600', icon: CheckCircle },
  paid: { label: '지급완료', color: 'bg-eco-green-100 text-eco-green', icon: CreditCard },
}

export default function SettlementManagePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const monthlyTotal = driverSettlements.reduce((s, d) => s + d.amount, 0)
  const monthlyKg = driverSettlements.reduce((s, d) => s + d.totalKg, 0)
  const pendingCount = driverSettlements.filter(d => d.status === 'pending').length
  const confirmedCount = driverSettlements.filter(d => d.status === 'confirmed').length

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">정산 관리</h1>
      </header>

      <div className="px-5 py-4">
        {/* 요약 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card mb-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">이번 달 정산 현황</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{monthlyTotal.toLocaleString()}원</p>
          <p className="text-xs text-white/60 mt-0.5">총 {monthlyKg.toLocaleString()}kg</p>

          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{pendingCount}</p>
              <p className="text-[10px] text-white/60">대기</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{confirmedCount}</p>
              <p className="text-[10px] text-white/60">확정</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{driverSettlements.length}</p>
              <p className="text-[10px] text-white/60">전체</p>
            </div>
          </div>
        </motion.div>

        {/* 기사별 정산 카드 */}
        <h2 className="text-sm font-bold text-gray-800 mb-3">기사별 정산</h2>
        <div className="space-y-2.5">
          {driverSettlements.map((ds, idx) => {
            const cfg = statusConfig[ds.status]
            const StatusIcon = cfg.icon
            const isExpanded = expandedId === ds.id

            return (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.06 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ds.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Truck className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{ds.driverName}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">{ds.period}</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-[11px] text-gray-500">{ds.totalKg.toLocaleString()}kg</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{ds.amount.toLocaleString()}원</p>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-300" />
                        : <ChevronDown className="w-4 h-4 text-gray-300" />
                      }
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-gray-500">일별 상세</span>
                          <span className="text-[11px] text-gray-400">{ds.ratePerKg}원/kg</span>
                        </div>

                        {ds.dailyBreakdown.map(d => (
                          <div key={d.date} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-xs text-gray-500">{d.date}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Scale className="w-3 h-3 text-gray-300" />
                                <span className="text-xs text-gray-600">{d.kg}kg</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-800 w-16 text-right">
                                {d.amount.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* 액션 버튼 */}
                        {ds.status === 'pending' && (
                          <div className="flex items-center gap-2 mt-3">
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className="flex-1 bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              확정
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className="flex-1 bg-eco-green text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              지급완료
                            </motion.button>
                          </div>
                        )}
                        {ds.status === 'confirmed' && (
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            className="w-full mt-3 bg-eco-green text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            지급완료 처리
                          </motion.button>
                        )}
                        {ds.status === 'paid' && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <span className="text-[11px] text-eco-green">지급 완료</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* 월간 합계 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-eco-green" />
            <h3 className="text-sm font-bold text-gray-800">월간 합계</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">총 정산 금액</p>
              <p className="text-xl font-bold text-gray-900">{monthlyTotal.toLocaleString()}원</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">총 수거량</p>
              <p className="text-base font-bold text-eco-green">{monthlyKg.toLocaleString()}kg</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            <span>기사 {driverSettlements.length}명</span>
            <span>단가 80원/kg</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
