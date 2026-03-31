import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Search, Plus, X, ChevronDown, ChevronUp,
  MapPin, Package, Scale, Coffee, ArrowLeft, Loader2,
  CheckCircle, XCircle, Clock, Truck, UserCheck
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import KakaoAddressModal from '../../components/KakaoAddressModal'

const typeConfig: Record<string, { label: string; color: string }> = {
  STARBUCKS:  { label: '스벅',       color: 'bg-emerald-50 text-emerald-600' },
  FRANCHISE:  { label: '프랜차이즈', color: 'bg-blue-50 text-blue-600' },
  INDIVIDUAL: { label: '개인',       color: 'bg-amber-50 text-amber-600' },
}

export default function CafeManagePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? ''

  const [tab, setTab] = useState<'active' | 'pending'>('active')
  const [cafes, setCafes] = useState<any[]>([])
  const [pendingCafes, setPendingCafes] = useState<any[]>([])
  const [cafeStats, setCafeStats] = useState<Record<string, { pickups: number; kg: number }>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'FRANCHISE', address: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([])
  const [assigningCafeId, setAssigningCafeId] = useState<string | null>(null)

  useEffect(() => {
    if (!companyName) return
    loadCafes()
  }, [companyName])

  const loadCafes = async () => {
    setLoading(true)
    const db = supabase as any

    // 소속 기사 목록
    const { data: driversData } = await db.from('drivers').select('id, name').eq('company', companyName).eq('status', 'APPROVED')
    if (driversData) setDrivers(driversData)
    const driverIds = (driversData || []).map((d: any) => d.id)

    // 승인된 매장
    const { data: cafeData } = await db.from('cafes').select('*')
      .eq('company', companyName)
      .not('status', 'eq', 'PENDING')
      .not('status', 'eq', 'REJECTED')
      .order('name')
    if (cafeData) setCafes(cafeData)

    // 승인 대기 매장
    const { data: pendingData } = await db.from('cafes').select('*')
      .eq('company', companyName)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
    if (pendingData) setPendingCafes(pendingData)

    // 이번 달 픽업 통계
    if (driverIds.length > 0) {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { data: pickups } = await db.from('pickups')
        .select('cafe_id, total_weight')
        .in('driver_id', driverIds)
        .eq('status', 'COMPLETED')
        .gte('completed_at', firstOfMonth)

      if (pickups) {
        const stats: Record<string, { pickups: number; kg: number }> = {}
        pickups.forEach((p: any) => {
          if (!p.cafe_id) return
          if (!stats[p.cafe_id]) stats[p.cafe_id] = { pickups: 0, kg: 0 }
          stats[p.cafe_id].pickups += 1
          stats[p.cafe_id].kg += p.total_weight || 0
        })
        setCafeStats(stats)
      }
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const db = supabase as any
    await db.from('cafes').insert({
      name: form.name.trim(),
      store_type: form.type,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
    })
    setForm({ name: '', type: 'FRANCHISE', address: '', phone: '' })
    setShowModal(false)
    await loadCafes()
    setSaving(false)
  }

  const handleApprove = async (cafeId: string) => {
    setApproving(cafeId)
    const db = supabase as any
    const { error } = await db.from('cafes').update({ status: 'APPROVED' }).eq('id', cafeId)
    if (error) {
      console.error('승인 오류:', error)
      alert('승인 처리 중 오류가 발생했습니다.\nSupabase RLS 정책을 확인해주세요.\n' + error.message)
      setApproving(null)
      return
    }
    // 즉시 UI 업데이트
    setPendingCafes(prev => prev.filter(c => c.id !== cafeId))
    await loadCafes()
    setApproving(null)
  }

  const handleReject = async (cafeId: string) => {
    setApproving(cafeId)
    const db = supabase as any
    const { error } = await db.from('cafes').update({ status: 'REJECTED' }).eq('id', cafeId)
    if (error) {
      console.error('거부 오류:', error)
      alert('거부 처리 중 오류가 발생했습니다.\n' + error.message)
      setApproving(null)
      return
    }
    // 즉시 UI 업데이트
    setPendingCafes(prev => prev.filter(c => c.id !== cafeId))
    await loadCafes()
    setApproving(null)
  }

  const handleAssignDriver = async (cafeId: string, driverId: string | null) => {
    setAssigningCafeId(cafeId)
    const db = supabase as any
    await db.from('cafes').update({ driver_id: driverId }).eq('id', cafeId)
    setCafes(prev => prev.map(c => c.id === cafeId ? { ...c, driver_id: driverId } : c))
    setAssigningCafeId(null)
  }

  const filtered = cafes.filter(c =>
    c.name?.includes(searchQuery) || c.address?.includes(searchQuery)
  )

  const typeCounts: Record<string, number> = { STARBUCKS: 0, FRANCHISE: 0, INDIVIDUAL: 0 }
  cafes.forEach(c => { if (c.store_type && typeCounts[c.store_type] !== undefined) typeCounts[c.store_type]++ })

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50"
            >
              <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
            </motion.button>
            <h1 className="text-lg font-bold text-gray-900">매장 관리</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-eco-green text-white text-xs font-semibold px-3 py-2 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            매장 등록
          </motion.button>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-3">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'active' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
          >
            등록 매장
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${tab === 'pending' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
          >
            승인 대기
            {pendingCafes.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingCafes.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'active' && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="매장명 또는 주소 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-eco-green/30"
            />
          </div>
        )}
      </header>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : tab === 'pending' ? (
          /* 승인 대기 탭 */
          <div className="space-y-2.5">
            {pendingCafes.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">승인 대기 중인 매장이 없습니다</p>
              </motion.div>
            ) : (
              pendingCafes.map((cafe, idx) => (
                <motion.div
                  key={cafe.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-card p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{cafe.name}</p>
                      {cafe.address && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-300" />
                          <span className="text-[11px] text-gray-400 truncate">{cafe.address}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] bg-amber-50 text-amber-600 font-semibold px-2 py-1 rounded-lg flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      대기중
                    </span>
                  </div>
                  {cafe.phone && (
                    <p className="text-[11px] text-gray-400 mb-3">연락처: {cafe.phone}</p>
                  )}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={approving === cafe.id}
                      onClick={() => handleApprove(cafe.id)}
                      className="flex-1 bg-eco-green text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {approving === cafe.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      승인
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={approving === cafe.id}
                      onClick={() => handleReject(cafe.id)}
                      className="flex-1 bg-red-50 text-red-500 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {approving === cafe.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      거부
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* 등록 매장 탭 */
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-2.5 mb-5"
            >
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <div key={key} className="bg-white rounded-xl p-3 shadow-card text-center">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                  <p className="text-lg font-bold text-gray-800 mt-1">{typeCounts[key] || 0}</p>
                </div>
              ))}
            </motion.div>

            <div className="space-y-2.5">
              {filtered.map((cafe, idx) => {
                const cfg = typeConfig[cafe.store_type] || typeConfig.INDIVIDUAL
                const isExpanded = expandedId === cafe.id
                const stats = cafeStats[cafe.id] || { pickups: 0, kg: 0 }

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
                            {cafe.address && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-gray-300" />
                                <span className="text-[11px] text-gray-400">{cafe.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0" />
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
                                <p className="text-sm font-bold text-gray-800">{stats.pickups}회</p>
                                <p className="text-[10px] text-gray-400">수거 횟수</p>
                              </div>
                              <div className="bg-eco-green-100 rounded-lg p-3 text-center">
                                <Scale className="w-4 h-4 text-eco-green mx-auto mb-1" />
                                <p className="text-sm font-bold text-gray-800">{stats.kg.toLocaleString()}kg</p>
                                <p className="text-[10px] text-gray-400">총 수거량</p>
                              </div>
                            </div>
                            {cafe.phone && (
                              <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2">
                                <span className="text-[11px] text-gray-400">연락처:</span>
                                <span className="text-[11px] text-gray-600">{cafe.phone}</span>
                              </div>
                            )}

                            {/* 기사 배정 */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Truck className="w-3.5 h-3.5 text-gray-400" />
                                <p className="text-[11px] font-semibold text-gray-500">담당 기사 배정</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={cafe.driver_id ?? ''}
                                  onChange={e => handleAssignDriver(cafe.id, e.target.value || null)}
                                  disabled={assigningCafeId === cafe.id}
                                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-eco-green/30 border border-gray-200"
                                >
                                  <option value="">담당 기사 없음</option>
                                  {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                                {assigningCafeId === cafe.id
                                  ? <Loader2 className="w-4 h-4 text-eco-green animate-spin flex-shrink-0" />
                                  : cafe.driver_id
                                    ? <UserCheck className="w-4 h-4 text-eco-green flex-shrink-0" />
                                    : null
                                }
                              </div>
                              {cafe.driver_id && (
                                <p className="text-[10px] text-eco-green mt-1.5 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  {drivers.find(d => d.id === cafe.driver_id)?.name ?? '배정됨'}
                                </p>
                              )}
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
                <p className="text-sm text-gray-400">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 매장이 없습니다'}
                </p>
              </motion.div>
            )}
          </>
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
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">매장명 *</label>
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
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddressModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-left"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className={form.address ? 'text-gray-800' : 'text-gray-400'}>
                      {form.address || '주소 검색 (클릭)'}
                    </span>
                  </motion.button>
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
                disabled={saving || !form.name.trim()}
                className="w-full mt-5 bg-eco-green text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleRegister}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                등록하기
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 카카오 주소 검색 모달 */}
      <KakaoAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={(addr) => setForm(f => ({ ...f, address: addr }))}
      />
    </div>
  )
}
