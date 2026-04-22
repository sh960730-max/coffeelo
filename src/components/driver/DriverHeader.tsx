import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Truck, ChevronDown, X, Megaphone, Package, CheckCircle2, ChevronRight, PhoneIncoming } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const STORAGE_KEY = 'driver_notification_settings'
const READ_KEY = 'driver_notif_read'
const defaultSettings = { call: true, assign: true, complete: true, notice: true, marketing: false }

function getNotifSettings(driverId: string) {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${driverId}`)
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  } catch { return defaultSettings }
}

function getReadIds(driverId: string): Set<string> {
  try {
    const saved = localStorage.getItem(`${READ_KEY}_${driverId}`)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch { return new Set() }
}

interface NotifItem {
  id: string
  type: 'call' | 'assign' | 'complete' | 'notice'
  title: string
  time: string
}

export default function DriverHeader() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const driverId = (user as any)?.id
  const driverName = (user as any)?.name ?? '기사'
  const driverCompany = (user as any)?.company ?? ''
  const driverTruck = (user as any)?.truck_type ?? ''
  const subInfo = [driverCompany, driverTruck].filter(Boolean).join(' · ')

  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [updating, setUpdating] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notifs, setNotifs] = useState<NotifItem[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  const settings = driverId ? getNotifSettings(driverId) : defaultSettings

  // readIds 초기화
  useEffect(() => {
    if (driverId) setReadIds(getReadIds(driverId))
  }, [driverId])

  const fetchNotifications = useCallback(async () => {
    if (!driverId) return
    const db = supabase as any
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const items: NotifItem[] = []

    // 새 수거 콜 알림 (담당 카페의 REQUESTED 상태 — 아직 배정 안 된 것)
    if (settings.call) {
      const { data: assignedCafes } = await db.from('cafes')
        .select('id')
        .eq('driver_id', driverId)
        .eq('status', 'APPROVED')
      const cafeIds = (assignedCafes || []).map((c: any) => c.id)
      if (cafeIds.length > 0) {
        const { data: calls } = await db.from('pickups')
          .select('id, cafe:cafes(name), requested_at, created_at')
          .eq('status', 'REQUESTED')
          .in('cafe_id', cafeIds)
          .gte('created_at', todayStart.toISOString())
          .order('created_at', { ascending: false })
          .limit(10)
        calls?.forEach((c: any) => {
          const t = new Date(c.requested_at ?? c.created_at)
          items.push({
            id: `call_${c.id}`,
            type: 'call',
            title: `${c.cafe?.name ?? '매장'} 새 수거 콜`,
            time: t.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          })
        })
      }
    }

    // 배정 알림
    if (settings.assign) {
      const { data } = await db.from('pickups')
        .select('id, cafe:cafes(name), created_at, requested_at')
        .eq('driver_id', driverId)
        .eq('status', 'ASSIGNED')
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
      data?.forEach((c: any) => {
        const t = new Date(c.requested_at ?? c.created_at)
        items.push({
          id: `assign_${c.id}`,
          type: 'assign',
          title: `${c.cafe?.name ?? '매장'} 수거 배정`,
          time: t.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })
      })
    }

    // 완료 알림
    if (settings.complete) {
      const { data } = await db.from('pickups')
        .select('id, cafe:cafes(name), completed_at, updated_at')
        .eq('driver_id', driverId)
        .eq('status', 'COMPLETED')
        .gte('updated_at', todayStart.toISOString())
        .order('updated_at', { ascending: false })
        .limit(10)
      data?.forEach((c: any) => {
        const t = new Date(c.completed_at ?? c.updated_at)
        items.push({
          id: `complete_${c.id}`,
          type: 'complete',
          title: `${c.cafe?.name ?? '매장'} 수거 완료`,
          time: t.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })
      })
    }

    // 공지사항 알림 (소속 회사 공지만)
    if (settings.notice) {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await db.from('announcements')
        .select('id, title, created_at')
        .eq('company', (user as any)?.company ?? '')
        .gte('created_at', threeDaysAgo)
        .order('created_at', { ascending: false })
        .limit(5)
      data?.forEach((a: any) => {
        const t = new Date(a.created_at)
        items.push({
          id: `ann_${a.id}`,
          type: 'notice',
          title: a.title,
          time: t.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        })
      })
    }

    setNotifs(items)
  }, [driverId, settings.call, settings.assign, settings.complete, settings.notice])

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any

    db.from('drivers').select('is_online').eq('id', driverId).single()
      .then(({ data }: any) => { if (data) setIsOnline(data.is_online ?? false) })

    fetchNotifications()

    // Realtime 구독
    const pickupSub = (supabase as any)
      .channel(`driver-pickups-${driverId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickups', filter: `driver_id=eq.${driverId}` },
        () => fetchNotifications())
      .subscribe()

    const announceSub = (supabase as any)
      .channel('announcements-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' },
        () => fetchNotifications())
      .subscribe()

    return () => {
      ;(supabase as any).removeChannel(pickupSub)
      ;(supabase as any).removeChannel(announceSub)
    }
  }, [driverId, fetchNotifications])

  // 알림 설정 변경 감지
  useEffect(() => {
    const handleStorage = () => fetchNotifications()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [fetchNotifications])

  const visibleNotifs = notifs.filter(n => !readIds.has(n.id))
  const unreadCount = visibleNotifs.length

  const handleReadNotif = (n: NotifItem) => {
    // 읽음 처리
    setReadIds(prev => {
      const next = new Set([...prev, n.id])
      localStorage.setItem(`${READ_KEY}_${driverId}`, JSON.stringify([...next]))
      return next
    })
    // 패널 닫고 해당 페이지로 이동
    setShowNotif(false)
    if (n.type === 'call') {
      const pickupId = n.id.replace('call_', '')
      navigate('/driver', { state: { openCallId: pickupId } })
    } else if (n.type === 'assign') {
      const pickupId = n.id.replace('assign_', '')
      navigate(`/driver/pickup/${pickupId}`)
    } else if (n.type === 'complete') {
      navigate('/driver/pickups')
    } else if (n.type === 'notice') {
      navigate('/driver/announcements')
    }
  }

  const handleReadAll = () => {
    const all = new Set(notifs.map(n => n.id))
    setReadIds(all)
    localStorage.setItem(`${READ_KEY}_${driverId}`, JSON.stringify([...all]))
  }

  const handleToggle = async () => {
    if (updating || !driverId) return
    const next = !isOnline
    setIsOnline(next)
    setUpdating(true)
    await (supabase as any).from('drivers').update({ is_online: next }).eq('id', driverId)
    setUpdating(false)
  }

  const iconConfig = {
    call:     { bg: 'bg-red-50',         color: 'text-red-500',   Icon: PhoneIncoming },
    assign:   { bg: 'bg-eco-green/10',   color: 'text-eco-green', Icon: Package },
    complete: { bg: 'bg-blue-50',        color: 'text-blue-500',  Icon: CheckCircle2 },
    notice:   { bg: 'bg-amber-50',       color: 'text-amber-500', Icon: Megaphone },
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

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotif(true)}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-50"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[9px] text-white font-bold px-0.5">{unreadCount}</span>
              </span>
            )}
          </motion.button>
        </div>

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

              {/* 헤더 */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">알림</h2>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={handleReadAll} className="text-xs text-eco-green font-semibold">
                      모두 읽음
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 알림 목록 */}
              {visibleNotifs.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">새로운 알림이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {visibleNotifs.map((n) => {
                      const cfg = iconConfig[n.type]
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                          transition={{ duration: 0.25 }}
                        >
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleReadNotif(n)}
                            className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 text-left"
                          >
                            <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-800 truncate">{n.title}</p>
                                <div className="w-2 h-2 bg-eco-green rounded-full flex-shrink-0" />
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          </motion.button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
