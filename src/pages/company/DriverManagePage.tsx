import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UserPlus, Truck, Phone, ChevronDown, ChevronUp,
  Scale, ClipboardList, Wallet, X, Circle, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Driver {
  id: string
  auth_id: string
  phone: string
  name: string
  company: string
  truck_type: string
  license_plate: string | null
  profile_photo: string | null
  is_online: boolean
  created_at: string
  updated_at: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

const statusConfig = {
  online: { label: '온라인', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-400' },
  collecting: { label: '수거중', textColor: 'text-amber-600', bgColor: 'bg-amber-50', dotColor: 'bg-amber-400' },
  offline: { label: '오프라인', textColor: 'text-gray-500', bgColor: 'bg-gray-100', dotColor: 'bg-gray-300' },
}

type StatusKey = keyof typeof statusConfig

interface DriverDisplay extends Driver {
  statusKey: StatusKey
}

export default function DriverManagePage() {
  const [drivers, setDrivers] = useState<DriverDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', truckType: '1톤 트럭', licensePlate: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  /* ── 기사 목록 불러오기 ── */
  const fetchDrivers = async () => {
    setLoading(true)
    const { data, error } = await db
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const mapped: DriverDisplay[] = (data as Driver[]).map(d => ({
        ...d,
        statusKey: (d.is_online ? 'online' : 'offline') as StatusKey,
      }))
      setDrivers(mapped)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  /* ── 기사 등록 ── */
  const handleRegister = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.licensePlate.trim()) {
      setErrorMsg('이름, 전화번호, 차량번호를 모두 입력해주세요.')
      setSubmitResult('error')
      return
    }

    setSubmitting(true)
    setSubmitResult(null)
    setErrorMsg('')

    const { error } = await db.from('drivers').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      truck_type: form.truckType,
      license_plate: form.licensePlate.trim(),
      company: '그린물류',
      is_online: false,
      // auth_id는 기사가 앱으로 직접 로그인 시 연동됨
    })

    setSubmitting(false)

    if (error) {
      console.error('기사 등록 오류:', error)
      setErrorMsg(error.message || '등록에 실패했습니다. 다시 시도해주세요.')
      setSubmitResult('error')
    } else {
      setSubmitResult('success')
      setForm({ name: '', phone: '', truckType: '1톤 트럭', licensePlate: '' })
      await fetchDrivers()
      setTimeout(() => {
        setShowModal(false)
        setSubmitResult(null)
      }, 1200)
    }
  }

  const filtered = drivers.filter(d =>
    d.name.includes(searchQuery) ||
    (d.license_plate ?? '').includes(searchQuery)
  )

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">기사 관리</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowModal(true); setSubmitResult(null); setErrorMsg('') }}
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
          <span className="text-xs text-gray-400">전체 {drivers.length}명</span>
          <div className="flex items-center gap-3 ml-auto">
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const count = drivers.filter(d => d.statusKey === key).length
              return (
                <div key={key} className="flex items-center gap-1">
                  <Circle className={`w-2 h-2 fill-current ${cfg.textColor}`} />
                  <span className="text-[10px] text-gray-400">{cfg.label} {count}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        )}

        {/* 기사 카드 목록 */}
        {!loading && (
          <div className="space-y-2.5">
            {filtered.map((driver, idx) => {
              const cfg = statusConfig[driver.statusKey]
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
                            <span className="text-[11px] text-gray-400">{driver.truck_type}</span>
                            {driver.license_plate && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-[11px] text-gray-400">{driver.license_plate}</span>
                              </>
                            )}
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

                          {/* 주간 통계 (Supabase 연동 예정) */}
                          <p className="text-[11px] font-semibold text-gray-500 mb-2">이번 주 실적</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-eco-green-100 rounded-lg p-2.5 text-center">
                              <Scale className="w-3.5 h-3.5 text-eco-green mx-auto mb-1" />
                              <p className="text-xs font-bold text-gray-800">-</p>
                              <p className="text-[9px] text-gray-400">수거량</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                              <ClipboardList className="w-3.5 h-3.5 text-blue-600 mx-auto mb-1" />
                              <p className="text-xs font-bold text-gray-800">-</p>
                              <p className="text-[9px] text-gray-400">수거 완료</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                              <Wallet className="w-3.5 h-3.5 text-amber-600 mx-auto mb-1" />
                              <p className="text-xs font-bold text-gray-800">-</p>
                              <p className="text-[9px] text-gray-400">정산액</p>
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-300 text-center mt-1.5">수거 데이터 연동 후 표시됩니다</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {filtered.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 기사가 없습니다'}
                </p>
              </motion.div>
            )}
          </div>
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
            onClick={() => !submitting && setShowModal(false)}
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
                <button onClick={() => !submitting && setShowModal(false)}>
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

              {/* 결과 메시지 */}
              <AnimatePresence>
                {submitResult === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 bg-eco-green-100 text-eco-green rounded-xl px-3 py-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium">기사가 등록되었습니다!</span>
                  </motion.div>
                )}
                {submitResult === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 bg-red-50 text-red-500 rounded-xl px-3 py-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium">{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
                className="w-full mt-4 bg-eco-green text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                onClick={handleRegister}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    등록 중...
                  </>
                ) : '등록하기'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
