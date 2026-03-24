import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UserPlus, Truck, Phone, ChevronDown, ChevronUp,
  Scale, ClipboardList, Wallet, X, Circle
} from 'lucide-react'

/* ── 더미 기사 데이터 ── */
const dummyDrivers = [
  {
    id: 'd1', name: '박민수', phone: '010-1234-5678', company: '그린물류',
    truckType: '1톤 트럭', licensePlate: '12가 3456', status: 'online' as const,
    weeklyKg: 2350, weeklyPickups: 42, weeklyAmount: 188000,
  },
  {
    id: 'd2', name: '김영호', phone: '010-2345-6789', company: '그린물류',
    truckType: '1톤 트럭', licensePlate: '34나 7890', status: 'collecting' as const,
    weeklyKg: 1980, weeklyPickups: 35, weeklyAmount: 158400,
  },
  {
    id: 'd3', name: '이준혁', phone: '010-3456-7890', company: '그린물류',
    truckType: '0.5톤 트럭', licensePlate: '56다 1234', status: 'offline' as const,
    weeklyKg: 1450, weeklyPickups: 28, weeklyAmount: 116000,
  },
  {
    id: 'd4', name: '최지훈', phone: '010-4567-8901', company: '그린물류',
    truckType: '1톤 트럭', licensePlate: '78라 5678', status: 'online' as const,
    weeklyKg: 2100, weeklyPickups: 38, weeklyAmount: 168000,
  },
]

const statusConfig = {
  online: { label: '온라인', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-400' },
  collecting: { label: '수거중', textColor: 'text-amber-600', bgColor: 'bg-amber-50', dotColor: 'bg-amber-400' },
  offline: { label: '오프라인', textColor: 'text-gray-500', bgColor: 'bg-gray-100', dotColor: 'bg-gray-300' },
}

export default function DriverManagePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', truckType: '1톤 트럭', licensePlate: '' })

  const filtered = dummyDrivers.filter(d =>
    d.name.includes(searchQuery) || d.licensePlate.includes(searchQuery)
  )

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">기사 관리</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-eco-green text-white text-xs font-semibold px-3 py-2 rounded-xl"
          >
            <UserPlus className="w-3.5 h-3.5" />
            기사 등록
          </motion.button>
        </div>

        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="이름 또는 차량번호 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-eco-green/30"
          />
        </div>
      </header>

      <div className="px-5 py-4">
        {/* 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <span className="text-xs text-gray-400">전체 {dummyDrivers.length}명</span>
          <div className="flex items-center gap-3 ml-auto">
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const count = dummyDrivers.filter(d => d.status === key).length
              return (
                <div key={key} className="flex items-center gap-1">
                  <Circle className={`w-2 h-2 fill-current ${cfg.textColor}`} />
                  <span className="text-[10px] text-gray-400">{cfg.label} {count}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 기사 카드 목록 */}
        <div className="space-y-2.5">
          {filtered.map((driver, idx) => {
            const cfg = statusConfig[driver.status]
            const isExpanded = expandedId === driver.id

            return (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : driver.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center relative">
                        <Truck className="w-5 h-5 text-gray-500" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${cfg.dotColor} rounded-full border-2 border-white`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{driver.name}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.textColor}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">{driver.truckType}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-[11px] text-gray-400">{driver.licensePlate}</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-300" />
                      : <ChevronDown className="w-4 h-4 text-gray-300" />
                    }
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
                        {/* 연락처 */}
                        <div className="flex items-center gap-2 mb-3">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">{driver.phone}</span>
                        </div>

                        {/* 주간 통계 */}
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">이번 주 실적</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-eco-green-100 rounded-lg p-2.5 text-center">
                            <Scale className="w-3.5 h-3.5 text-eco-green mx-auto mb-1" />
                            <p className="text-xs font-bold text-gray-800">{driver.weeklyKg.toLocaleString()}kg</p>
                            <p className="text-[9px] text-gray-400">수거량</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                            <ClipboardList className="w-3.5 h-3.5 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs font-bold text-gray-800">{driver.weeklyPickups}건</p>
                            <p className="text-[9px] text-gray-400">수거 완료</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                            <Wallet className="w-3.5 h-3.5 text-amber-600 mx-auto mb-1" />
                            <p className="text-xs font-bold text-gray-800">{(driver.weeklyAmount / 10000).toFixed(1)}만</p>
                            <p className="text-[9px] text-gray-400">정산액</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
          </motion.div>
        )}
      </div>

      {/* 기사 등록 모달 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">기사 등록</h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">이름</label>
                  <input
                    type="text"
                    placeholder="기사 이름"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">전화번호</label>
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">차량 종류</label>
                  <select
                    value={form.truckType}
                    onChange={e => setForm(f => ({ ...f, truckType: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  >
                    <option>0.5톤 트럭</option>
                    <option>1톤 트럭</option>
                    <option>2.5톤 트럭</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">차량 번호</label>
                  <input
                    type="text"
                    placeholder="00가 0000"
                    value={form.licensePlate}
                    onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full mt-5 bg-eco-green text-white font-semibold py-3 rounded-xl text-sm"
                onClick={() => setShowModal(false)}
              >
                등록하기
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
