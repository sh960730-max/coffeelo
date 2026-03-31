import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Calendar, ChevronDown, ChevronUp, Package, MapPin, Coffee, Image as ImageIcon, Store, Phone } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Pickup } from '../../lib/database.types'

const statusFilters = [
  { key: 'all', label: '전체' },
  { key: 'COMPLETED', label: '완료' },
  { key: 'CANCELLED', label: '취소' },
]

const dateFilters = [
  { key: 'today', label: '오늘' },
  { key: 'week', label: '이번 주' },
  { key: 'month', label: '이번 달' },
]

const storeTypeStyle: Record<string, { label: string; bg: string; soft: string }> = {
  STARBUCKS:  { label: '스벅',     bg: 'bg-green-600',  soft: 'bg-green-50 text-green-700' },
  FRANCHISE:  { label: '프랜차이즈', bg: 'bg-orange-500', soft: 'bg-orange-50 text-orange-700' },
  INDIVIDUAL: { label: '개인카페',  bg: 'bg-purple-500', soft: 'bg-purple-50 text-purple-700' },
}

export default function PickupListPage() {
  const { user } = useAuth()
  const driverId = (user as any)?.id

  const [mainTab, setMainTab] = useState<'history' | 'assigned'>('history')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('month')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [allPickups, setAllPickups] = useState<Pickup[]>([])
  const [assignedCafes, setAssignedCafes] = useState<any[]>([])
  const [loadingCafes, setLoadingCafes] = useState(false)

  // 수거 목록 조회
  useEffect(() => {
    if (!driverId) return
    const db = supabase as any
    const now = new Date()
    let fromDate: string
    if (dateFilter === 'today') {
      fromDate = now.toISOString().split('T')[0] + 'T00:00:00'
    } else if (dateFilter === 'week') {
      const monday = new Date(now)
      const dow = now.getDay()
      monday.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow))
      monday.setHours(0, 0, 0, 0)
      fromDate = monday.toISOString()
    } else {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      fromDate = first.toISOString()
    }
    db.from('pickups')
      .select('*, cafe:cafes(name, address, store_type), containers(*)')
      .eq('driver_id', driverId)
      .in('status', ['COMPLETED', 'CANCELLED'])
      .gte('created_at', fromDate)
      .order('created_at', { ascending: false })
      .then(({ data }: any) => { if (data) setAllPickups(data) })
  }, [driverId, dateFilter])

  // 담당 매장 조회
  useEffect(() => {
    if (!driverId || mainTab !== 'assigned') return
    setLoadingCafes(true)
    const db = supabase as any
    db.from('cafes')
      .select('id, name, address, phone, type, company')
      .eq('driver_id', driverId)
      .eq('status', 'APPROVED')
      .order('name')
      .then(({ data, error }: any) => {
        console.log('담당 매장 조회:', data, error)
        if (data) setAssignedCafes(data)
        setLoadingCafes(false)
      })
  }, [driverId, mainTab])

  const filtered = allPickups.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (searchQuery && !p.cafe?.name.includes(searchQuery)) return false
    return true
  })

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">수거 목록</h1>

        {/* 메인 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-3">
          <button
            onClick={() => setMainTab('history')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${mainTab === 'history' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
          >
            수거 내역
          </button>
          <button
            onClick={() => setMainTab('assigned')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${mainTab === 'assigned' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
          >
            담당 매장
            {assignedCafes.length > 0 && (
              <span className="bg-eco-green text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {assignedCafes.length}
              </span>
            )}
          </button>
        </div>

        {/* 수거 내역 필터 */}
        {mainTab === 'history' && (
          <>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="매장명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 outline-none focus:border-eco-green transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              {dateFilters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setDateFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    dateFilter === f.key ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                기간선택
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {statusFilters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                    statusFilter === f.key
                      ? 'bg-eco-green-100 text-eco-green border border-eco-green/30'
                      : 'bg-gray-50 text-gray-400 border border-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-gray-400">{filtered.length}건</span>
            </div>
          </>
        )}
      </header>

      <div className="px-5 py-4 space-y-2.5">
        {/* 수거 내역 탭 */}
        {mainTab === 'history' && (
          <>
            <AnimatePresence>
              {filtered.map((pickup, index) => {
                const isExpanded = expandedId === pickup.id
                const typeStyle = storeTypeStyle[pickup.cafe?.store_type || 'INDIVIDUAL']
                const containerCount = pickup.containers?.length || 0
                const date = new Date(pickup.completed_at || pickup.created_at)
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
                const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`

                return (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-card overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : pickup.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${typeStyle.bg}`}>
                              {typeStyle.label}
                            </span>
                            <span className="text-[10px] text-gray-400">{dateStr} {timeStr}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              pickup.status === 'COMPLETED'
                                ? 'bg-eco-green-100 text-eco-green'
                                : 'bg-red-50 text-red-500'
                            }`}>
                              {pickup.status === 'COMPLETED' ? '완료' : '취소'}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900">{pickup.cafe?.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-[11px] text-gray-500 truncate">{pickup.cafe?.address}</span>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-sm font-bold text-eco-green">{pickup.total_weight}kg</p>
                          <p className="text-[10px] text-amber-600 font-semibold">
                            {pickup.settlement_amount?.toLocaleString()}원
                          </p>
                          <div className="mt-1">
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-gray-300 ml-auto" />
                              : <ChevronDown className="w-4 h-4 text-gray-300 ml-auto" />}
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && pickup.containers && pickup.containers.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100"
                        >
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-[11px] font-semibold text-gray-500 mb-2">
                              컨테이너 {containerCount}개 상세
                            </p>
                            {pickup.containers.map((c, ci) => (
                              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-3.5 h-3.5 text-gray-400" />
                                  </div>
                                  <span className="text-xs text-gray-700">
                                    {c.type === 'BOX' ? '박스' : '봉지'} #{ci + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {c.photo_url && <ImageIcon className="w-3.5 h-3.5 text-eco-green" />}
                                  <span className="text-xs font-bold text-gray-900">{c.weight}kg</span>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs text-gray-500">평균 무게</span>
                              <span className="text-xs font-semibold text-gray-700">
                                {(pickup.containers.reduce((s, c) => s + c.weight, 0) / containerCount).toFixed(1)}kg
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Coffee className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-400 mt-3">수거 내역이 없습니다</p>
              </div>
            )}
          </>
        )}

        {/* 담당 매장 탭 */}
        {mainTab === 'assigned' && (
          <>
            {loadingCafes ? (
              <div className="flex justify-center py-20">
                <div className="w-6 h-6 border-2 border-eco-green/30 border-t-eco-green rounded-full animate-spin" />
              </div>
            ) : assignedCafes.length === 0 ? (
              <div className="text-center py-20">
                <Store className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-400 mt-3">배정된 매장이 없습니다</p>
                <p className="text-xs text-gray-300 mt-1">관리자에게 매장 배정을 요청하세요</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-gray-400 px-1">총 {assignedCafes.length}개 매장이 배정되어 있습니다</p>
                {assignedCafes.map((cafe, idx) => {
                  const typeStyle = storeTypeStyle[cafe.type || 'INDIVIDUAL']
                  return (
                    <motion.div
                      key={cafe.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl shadow-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 bg-eco-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Coffee className="w-5 h-5 text-eco-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-gray-800 truncate">{cafe.name}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${typeStyle.soft}`}>
                              {typeStyle.label}
                            </span>
                          </div>
                          {cafe.address && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-[11px] text-gray-500 truncate">{cafe.address}</span>
                            </div>
                          )}
                          {cafe.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-[11px] text-gray-500">{cafe.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
