import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Scale, Loader2, ChevronDown, ChevronUp, Truck, Calendar, X, Image as ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

type WeighRecord = {
  id: string
  loadedWeight: number
  emptyWeight: number
  netWeight: number
  loadedPhotoUrl: string | null
  emptyPhotoUrl: string | null
  createdAt: string
}

type DriverRecord = {
  id: string
  name: string
  phone: string
  totalKg: number
  weighCount: number
  weighIns: WeighRecord[]
}

export default function WeighRecordsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? ''

  const [driverRecords, setDriverRecords] = useState<DriverRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [monthFilter, setMonthFilter] = useState<'all' | 'month'>('month')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!companyName) return
    load()
  }, [companyName, monthFilter])

  const load = async () => {
    setLoading(true)
    const db = supabase as any

    // 소속 기사 조회
    const { data: drivers } = await db.from('drivers')
      .select('id, name, phone')
      .eq('company', companyName)
      .eq('status', 'APPROVED')
      .order('name')

    if (!drivers || drivers.length === 0) { setLoading(false); return }

    const driverIds = drivers.map((d: any) => d.id)

    // weigh_ins 조회
    let query = db.from('weigh_ins')
      .select('id, driver_id, loaded_weight, empty_weight, net_weight, loaded_photo_url, empty_photo_url, created_at')
      .in('driver_id', driverIds)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false })

    if (monthFilter === 'month') {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      query = query.gte('created_at', firstOfMonth)
    }

    const { data: weighIns } = await query

    // 기사별로 그룹핑
    const records: DriverRecord[] = drivers.map((d: any) => {
      const driverWeighIns: WeighRecord[] = ((weighIns || []) as any[])
        .filter((w: any) => w.driver_id === d.id)
        .map((w: any) => ({
          id: w.id,
          loadedWeight: w.loaded_weight ?? 0,
          emptyWeight: w.empty_weight ?? 0,
          netWeight: w.net_weight ?? 0,
          loadedPhotoUrl: w.loaded_photo_url ?? null,
          emptyPhotoUrl: w.empty_photo_url ?? null,
          createdAt: w.created_at,
        }))

      return {
        id: d.id,
        name: d.name,
        phone: d.phone,
        totalKg: driverWeighIns.reduce((s, w) => s + w.netWeight, 0),
        weighCount: driverWeighIns.length,
        weighIns: driverWeighIns,
      }
    }).filter((d: DriverRecord) => d.weighCount > 0)

    setDriverRecords(records)
    setLoading(false)
  }

  const totalKg = driverRecords.reduce((s, d) => s + d.totalKg, 0)
  const totalCount = driverRecords.reduce((s, d) => s + d.weighCount, 0)

  const formatDate = (iso: string) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">집하장 계량 기록</h1>
      </header>

      <div className="px-5 py-4">
        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          {(['month', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setMonthFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                monthFilter === f ? 'bg-eco-green text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {f === 'month' ? '이번 달' : '전체'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card mb-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">{monthFilter === 'month' ? '이번 달' : '전체'} 계량 기록</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalKg.toLocaleString()} kg</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-white/60">총 {totalCount}건</p>
                <p className="text-xs text-white/60">기사 {driverRecords.length}명</p>
              </div>
            </motion.div>

            {driverRecords.length === 0 ? (
              <div className="text-center py-16">
                <Scale className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">계량 기록이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {driverRecords.map((driver, idx) => {
                  const isExpanded = expandedId === driver.id
                  return (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl shadow-card overflow-hidden"
                    >
                      {/* 기사 헤더 */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : driver.id)}
                        className="w-full px-4 py-3.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-eco-green-100 rounded-xl flex items-center justify-center">
                            <Truck className="w-5 h-5 text-eco-green" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800">{driver.name}</p>
                            <p className="text-[11px] text-gray-400">{driver.weighCount}회 계량</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-eco-green">{driver.totalKg.toLocaleString()} kg</p>
                            <p className="text-[10px] text-gray-400">총 순중량</p>
                          </div>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-300 ml-1" />
                            : <ChevronDown className="w-4 h-4 text-gray-300 ml-1" />
                          }
                        </div>
                      </button>

                      {/* 계량 상세 목록 */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            <div className="px-4 py-3 space-y-3">
                              {driver.weighIns.map((w) => (
                                <div key={w.id} className="py-3 border-b border-gray-50 last:border-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" />
                                      <p className="text-[10px] text-gray-400">{formatDate(w.createdAt)}</p>
                                    </div>
                                    <span className="text-sm font-bold text-eco-green">
                                      {w.netWeight.toLocaleString()} kg
                                    </span>
                                  </div>

                                  {/* 중량 상세 */}
                                  <div className="flex gap-3 mb-2">
                                    <span className="text-[10px] text-gray-400">
                                      적재 <span className="font-semibold text-gray-600">{w.loadedWeight} kg</span>
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      공차 <span className="font-semibold text-gray-600">{w.emptyWeight} kg</span>
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      순중량 <span className="font-semibold text-eco-green">{w.netWeight} kg</span>
                                    </span>
                                  </div>

                                  {/* 사진 */}
                                  {(w.loadedPhotoUrl || w.emptyPhotoUrl) && (
                                    <div className="flex gap-2">
                                      {w.loadedPhotoUrl && (
                                        <button
                                          onClick={() => setPhotoUrl(w.loadedPhotoUrl)}
                                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                                        >
                                          <img src={w.loadedPhotoUrl} alt="적재" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1">
                                            <span className="text-[8px] text-white font-bold">적재</span>
                                          </div>
                                        </button>
                                      )}
                                      {w.emptyPhotoUrl && (
                                        <button
                                          onClick={() => setPhotoUrl(w.emptyPhotoUrl)}
                                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                                        >
                                          <img src={w.emptyPhotoUrl} alt="공차" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1">
                                            <span className="text-[8px] text-white font-bold">공차</span>
                                          </div>
                                        </button>
                                      )}
                                      {!w.loadedPhotoUrl && !w.emptyPhotoUrl && (
                                        <div className="flex items-center gap-1 text-gray-300">
                                          <ImageIcon className="w-3 h-3" />
                                          <span className="text-[10px]">사진 없음</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 사진 전체보기 모달 */}
      <AnimatePresence>
        {photoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPhotoUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-full max-h-full"
              onClick={e => e.stopPropagation()}
            >
              <img src={photoUrl} alt="계량 사진" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
              <button
                onClick={() => setPhotoUrl(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
