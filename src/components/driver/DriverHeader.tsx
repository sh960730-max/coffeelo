import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Truck, ChevronDown, X, Megaphone, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function DriverHeader() {
  const { user } = useAuth()
  const driverId = (user as any)?.id
  const driverName = (user as any)?.name ?? '기사'
  const driverCompany = (user as any)?.company ?? ''
  const driverTruck = (user as any)?.truck_type ?? ''
  const subInfo = [driverCompany, driverTruck].filter(Boolean).join(' · ')

  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [updating, setUpdating] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [newCalls, setNewCalls] = useState<any[]>([])

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any

    db.from('drivers').select('is_online').eq('id', driverId).single()
      .then(({ data }: any) => {
        if (data) setIsOnline(data.is_online ?? false)
      })

    // 최근 공지사항 (3일 이내)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    db.from('announcements')
      .select('id, title, created_at')
      .gte('created_at', threeDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }: any) => { if (data) setAnnouncements(data) })

    // 이 기사에게 배정된 신규 콜 (오늘)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    db.from('pickups')
      .select('id, cafe:cafes(name), requested_at')
      .eq('driver_id', driverId)
      .eq('status', 'ASSIGNED')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }: any) => { if (data) setNewCalls(data) })
  }, [driverId])

  const totalCount = announcements.length + newCalls.length

  const handleToggle = async () => {
    if (updating || !driverId) return
    const next = !isOnline
    setIsOnline(next)
    setUpdating(true)
    await (supabase as any).from('drivers').update({ is_online: next }).eq('id', driverId)
    setUpdating(false)
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="flex items-center justify-between px-5 py-4">
          {/* 프로필 */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-eco-green to-eco-green-600 rounded-full flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-base font-bold text-gray-900">{driverName} 기사님</h1>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-500 font-medium">{subInfo}</p>
            </div>
          </div>

          {/* 알림 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotif(true)}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-50"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {totalCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[9px] text-white font-bold px-0.5">{totalCount}</span>
              </span>
            )}
          </motion.button>
        </div>

        {/* 온/오프라인 토글 */}
        <div className="px-5 pb-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleToggle}
            disabled={updating}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 ${
              isOnline ? 'bg-eco-green-100 border border-eco-green-200' : 'bg-gray-100 border border-gray-200'
            } ${updating ? 'opacity-70' : ''}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`text-sm font-semibold ${isOnline ? 'text-eco-green' : 'text-gray-500'}`}>
                {isOnline ? '콜 수신 중' : '오프라인'}
              </span>
            </div>
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ${isOnline ? 'bg-eco-green' : 'bg-gray-300'}`}>
              <motion.div
                animate={{ x: isOnline ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </div>
          </motion.button>
        </div>
      </motion.header>

      {/* 알림 바텀시트 */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowNotif(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-4 pb-10 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">알림</h2>
                <button onClick={() => setShowNotif(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 신규 배정 콜 */}
              {newCalls.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 mb-2">오늘 배정된 수거</p>
                  <div className="space-y-2">
                    {newCalls.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 bg-eco-green-100/60 rounded-2xl px-4 py-3">
                        <div className="w-9 h-9 bg-eco-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-eco-green" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{c.cafe?.name ?? '매장'} 수거 배정</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(c.requested_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 공지사항 */}
              {announcements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">최근 공지사항</p>
                  <div className="space-y-2">
                    {announcements.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(a.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalCount === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">새로운 알림이 없습니다</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
