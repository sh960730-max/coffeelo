import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Scale, Loader2, X, Camera, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function WeighRecordsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? ''

  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [photoViewUrl, setPhotoViewUrl] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!companyName) return
    const load = async () => {
      const db = supabase as any
      const { data: drivers } = await db.from('drivers')
        .select('id, name').eq('company', companyName)
      if (!drivers || drivers.length === 0) { setLoading(false); return }

      const driverMap: Record<string, string> = {}
      drivers.forEach((d: any) => { driverMap[d.id] = d.name })
      const driverIds = drivers.map((d: any) => d.id)

      const { data } = await db.from('weigh_ins')
        .select('*')
        .in('driver_id', driverIds)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false })
        .limit(100)

      if (data) {
        setRecords(data.map((w: any) => ({ ...w, driverName: driverMap[w.driver_id] || '알 수 없음' })))
      }
      setLoading(false)
    }
    load()
  }, [companyName])

  const totalNet = records.reduce((s, r) => s + (r.net_weight || 0), 0)

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
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : (
          <>
            {/* 요약 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card mb-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">전체 계량 기록</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalNet.toLocaleString()} kg</p>
              <p className="text-xs text-white/60 mt-0.5">총 {records.length}건</p>
            </motion.div>

            {records.length === 0 ? (
              <div className="text-center py-16">
                <Scale className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">계량 기록이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((w, idx) => {
                  const date = new Date(w.created_at)
                  const dateStr = `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
                  const isExpanded = expandedId === w.id
                  const hasPhotos = w.loaded_photo_url || w.empty_photo_url

                  return (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white rounded-2xl shadow-card overflow-hidden"
                    >
                      {/* 헤더 */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : w.id)}
                        className="w-full px-4 py-3.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-eco-green-100 rounded-xl flex items-center justify-center">
                            <Scale className="w-4.5 h-4.5 text-eco-green" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800">{w.driverName}</p>
                              {hasPhotos && (
                                <span className="flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-semibold">
                                  <Camera className="w-2.5 h-2.5" /> 사진
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400">{dateStr}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-eco-green">{(w.net_weight || 0).toLocaleString()} kg</p>
                            <p className="text-[10px] text-amber-500">{((w.net_weight || 0) * 80).toLocaleString()}원</p>
                          </div>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-300" />
                            : <ChevronDown className="w-4 h-4 text-gray-300" />
                          }
                        </div>
                      </button>

                      {/* 상세 */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            <div className="px-4 py-4">
                              {/* 무게 정보 */}
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                  <p className="text-[10px] text-gray-400">적재 무게</p>
                                  <p className="text-sm font-bold text-gray-700 mt-0.5">{(w.loaded_weight || 0).toLocaleString()} kg</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                  <p className="text-[10px] text-gray-400">공차 무게</p>
                                  <p className="text-sm font-bold text-gray-700 mt-0.5">{(w.empty_weight || 0).toLocaleString()} kg</p>
                                </div>
                                <div className="bg-eco-green-100 rounded-xl p-3 text-center">
                                  <p className="text-[10px] text-eco-green">순수 무게</p>
                                  <p className="text-sm font-bold text-eco-green mt-0.5">{(w.net_weight || 0).toLocaleString()} kg</p>
                                </div>
                              </div>

                              {/* 계량판 사진 */}
                              {hasPhotos ? (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-2">계량판 사진</p>
                                  <div className="flex gap-2">
                                    {w.loaded_photo_url && (
                                      <button
                                        onClick={() => setPhotoViewUrl(w.loaded_photo_url)}
                                        className="flex-1"
                                      >
                                        <img
                                          src={w.loaded_photo_url}
                                          className="w-full h-32 object-cover rounded-xl border border-gray-100"
                                        />
                                        <p className="text-[11px] text-gray-400 text-center mt-1">적재 시 계량판</p>
                                      </button>
                                    )}
                                    {w.empty_photo_url && (
                                      <button
                                        onClick={() => setPhotoViewUrl(w.empty_photo_url)}
                                        className="flex-1"
                                      >
                                        <img
                                          src={w.empty_photo_url}
                                          className="w-full h-32 object-cover rounded-xl border border-gray-100"
                                        />
                                        <p className="text-[11px] text-gray-400 text-center mt-1">공차 시 계량판</p>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                                  <Camera className="w-4 h-4 text-gray-300" />
                                  <p className="text-xs text-gray-400">사진 없음</p>
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
            )}
          </>
        )}
      </div>

      {/* 사진 전체화면 뷰어 */}
      <AnimatePresence>
        {photoViewUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setPhotoViewUrl(null)}
          >
            <button className="absolute top-5 right-5 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={photoViewUrl}
              className="max-w-full max-h-full object-contain p-4"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
