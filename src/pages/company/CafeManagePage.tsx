import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Search, Plus, X, ChevronDown, ChevronUp,
  MapPin, Package, Scale, Coffee
} from 'lucide-react'

/* ── 더미 매장 데이터 ── */
const dummyCafes = [
  {
    id: 'c1', name: '스타벅스 강남역점', type: 'STARBUCKS' as const,
    address: '서울 강남구 강남대로 396', phone: '02-1234-5001',
    monthlyPickups: 28, monthlyKg: 1250,
  },
  {
    id: 'c2', name: '스타벅스 역삼역점', type: 'STARBUCKS' as const,
    address: '서울 강남구 역삼로 180', phone: '02-1234-5002',
    monthlyPickups: 24, monthlyKg: 980,
  },
  {
    id: 'c3', name: '블루보틀 삼성점', type: 'FRANCHISE' as const,
    address: '서울 강남구 테헤란로 521', phone: '02-1234-5003',
    monthlyPickups: 18, monthlyKg: 650,
  },
  {
    id: 'c4', name: '스타벅스 선릉역점', type: 'STARBUCKS' as const,
    address: '서울 강남구 선릉로 525', phone: '02-1234-5004',
    monthlyPickups: 22, monthlyKg: 890,
  },
  {
    id: 'c5', name: '커피랑도서관 서초점', type: 'INDIVIDUAL' as const,
    address: '서울 서초구 서초대로 301', phone: '02-1234-5005',
    monthlyPickups: 12, monthlyKg: 380,
  },
  {
    id: 'c6', name: '이디야 역삼점', type: 'FRANCHISE' as const,
    address: '서울 강남구 역삼동 123', phone: '02-1234-5006',
    monthlyPickups: 15, monthlyKg: 520,
  },
]

const typeConfig = {
  STARBUCKS: { label: '스벅', color: 'bg-emerald-50 text-emerald-600' },
  FRANCHISE: { label: '프랜차이즈', color: 'bg-blue-50 text-blue-600' },
  INDIVIDUAL: { label: '개인', color: 'bg-amber-50 text-amber-600' },
}

export default function CafeManagePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'FRANCHISE', address: '', phone: '' })

  const filtered = dummyCafes.filter(c =>
    c.name.includes(searchQuery) || c.address.includes(searchQuery)
  )

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">매장 관리</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-eco-green text-white text-xs font-semibold px-3 py-2 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            매장 등록
          </motion.button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="매장명 또는 주소 검색"
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
          className="grid grid-cols-3 gap-2.5 mb-5"
        >
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const count = dummyCafes.filter(c => c.type === key).length
            return (
              <div key={key} className="bg-white rounded-xl p-3 shadow-card text-center">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                <p className="text-lg font-bold text-gray-800 mt-1">{count}</p>
              </div>
            )
          })}
        </motion.div>

        {/* 매장 목록 */}
        <div className="space-y-2.5">
          {filtered.map((cafe, idx) => {
            const cfg = typeConfig[cafe.type]
            const isExpanded = expandedId === cafe.id

            return (
              <motion.div
                key={cafe.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : cafe.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-coffee-brown" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{cafe.name}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-300" />
                          <span className="text-[11px] text-gray-400">{cafe.address}</span>
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
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">이번 달 실적</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <Package className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                            <p className="text-sm font-bold text-gray-800">{cafe.monthlyPickups}회</p>
                            <p className="text-[10px] text-gray-400">수거 횟수</p>
                          </div>
                          <div className="bg-eco-green-100 rounded-lg p-3 text-center">
                            <Scale className="w-4 h-4 text-eco-green mx-auto mb-1" />
                            <p className="text-sm font-bold text-gray-800">{cafe.monthlyKg.toLocaleString()}kg</p>
                            <p className="text-[10px] text-gray-400">총 수거량</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2">
                          <span className="text-[11px] text-gray-400">연락처:</span>
                          <span className="text-[11px] text-gray-600">{cafe.phone}</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Store className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
          </motion.div>
        )}
      </div>

      {/* 매장 등록 모달 */}
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
                <h2 className="text-base font-bold text-gray-900">매장 등록</h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">매장명</label>
                  <input
                    type="text"
                    placeholder="매장 이름"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">매장 유형</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  >
                    <option value="STARBUCKS">스타벅스</option>
                    <option value="FRANCHISE">프랜차이즈</option>
                    <option value="INDIVIDUAL">개인 카페</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">주소</label>
                  <input
                    type="text"
                    placeholder="매장 주소"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">연락처</label>
                  <input
                    type="tel"
                    placeholder="02-0000-0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
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
