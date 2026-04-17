import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Camera, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function DriverWeighStation() {
  const { user } = useAuth()
  const driverId = (user as any)?.id
  const navigate = useNavigate()

  const [todayWeighs, setTodayWeighs] = useState<any[]>([])
  const [photoViewUrl, setPhotoViewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    db.from('weigh_ins').select('*')
      .eq('driver_id', driverId)
      .eq('status', 'COMPLETED')
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd)
      .order('created_at', { ascending: false })
      .then(({ data }: any) => {
        if (data) setTodayWeighs(data)
      })
  }, [driverId])

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="px-5 mt-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">집하장 계량</h2>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/driver/weigh')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-eco-green/10 text-eco-green rounded-lg text-xs font-semibold border border-eco-green/20"
          >
            <Camera className="w-3.5 h-3.5" />
            계량 등록
          </motion.button>
        </div>

        {todayWeighs.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 shadow-card text-center">
            <Scale className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">오늘 집하장 계량 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayWeighs.map((w) => {
              const date = new Date(w.created_at)
              return (
                <div key={w.id} className="bg-white rounded-xl p-3.5 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">
                      {date.getMonth() + 1}/{date.getDate()} {date.getHours()}:{String(date.getMinutes()).padStart(2, '0')}
                    </p>
                    <div className="text-right">
                      <p className="text-base font-bold text-eco-green">{w.net_weight?.toLocaleString()} kg</p>
                      <p className="text-[10px] text-amber-600">{((w.net_weight || 0) * 80).toLocaleString()}원</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    적재 {w.loaded_weight?.toLocaleString()}kg → 공차 {w.empty_weight?.toLocaleString()}kg
                  </p>
                  {(w.loaded_photo_url || w.empty_photo_url) && (
                    <div className="flex gap-2 mt-2">
                      {w.loaded_photo_url && (
                        <button onClick={() => setPhotoViewUrl(w.loaded_photo_url)} className="flex-1">
                          <img src={w.loaded_photo_url} className="w-full h-16 object-cover rounded-lg" />
                          <p className="text-[10px] text-gray-400 text-center mt-0.5">적재</p>
                        </button>
                      )}
                      {w.empty_photo_url && (
                        <button onClick={() => setPhotoViewUrl(w.empty_photo_url)} className="flex-1">
                          <img src={w.empty_photo_url} className="w-full h-16 object-cover rounded-lg" />
                          <p className="text-[10px] text-gray-400 text-center mt-0.5">공차</p>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </motion.section>

      {/* 사진 전체화면 뷰어 */}
      <AnimatePresence>
        {photoViewUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
            onClick={() => setPhotoViewUrl(null)}
          >
            <button className="absolute top-5 right-5 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
            <img src={photoViewUrl} className="max-w-full max-h-full object-contain rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
