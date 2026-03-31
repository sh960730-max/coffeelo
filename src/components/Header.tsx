import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Leaf, X, Truck, CheckCircle2, Megaphone, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface NotifItem {
  id: string
  type: 'pickup' | 'announcement'
  title: string
  body: string
  time: string
  read: boolean
}

const pickupStatusLabel: Record<string, { label: string; icon: typeof Truck }> = {
  ASSIGNED:  { label: '기사가 배정되었습니다', icon: Truck },
  EN_ROUTE:  { label: '기사가 이동 중입니다', icon: Truck },
  ARRIVED:   { label: '기사가 도착했습니다', icon: Truck },
  COMPLETED: { label: '수거가 완료되었습니다', icon: CheckCircle2 },
}

export default function Header() {
  const { user } = useAuth()
  const cafeId  = (user as any)?.id
  const cafeName = (user as any)?.name ?? '사장님'

  const [showPanel, setShowPanel]   = useState(false)
  const [notifs, setNotifs]         = useState<NotifItem[]>([])
  const [readIds, setReadIds]       = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!cafeId) return
    loadNotifs()
  }, [cafeId])

  const loadNotifs = async () => {
    const db = supabase as any
    const items: NotifItem[] = []

    // 최근 수거 상태 변경 (배정/이동/도착/완료)
    const { data: pickups } = await db
      .from('pickups')
      .select('id, status, updated_at, created_at')
      .eq('cafe_id', cafeId)
      .in('status', ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED'])
      .order('updated_at', { ascending: false })
      .limit(10)

    if (pickups) {
      pickups.forEach((p: any) => {
        const cfg = pickupStatusLabel[p.status]
        if (!cfg) return
        const t = new Date(p.updated_at || p.created_at)
        items.push({
          id: `pickup_${p.id}_${p.status}`,
          type: 'pickup',
          title: cfg.label,
          body: `${t.getMonth() + 1}월 ${t.getDate()}일 수거 요청`,
          time: t.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          read: false,
        })
      })
    }

    // 공지사항
    const { data: announcements } = await db
      .from('announcements')
      .select('id, title, content, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (announcements) {
      announcements.forEach((a: any) => {
        const t = new Date(a.created_at)
        items.push({
          id: `ann_${a.id}`,
          type: 'announcement',
          title: a.title,
          body: a.content?.slice(0, 40) + (a.content?.length > 40 ? '...' : ''),
          time: t.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric' }),
          read: false,
        })
      })
    }

    // 시간순 정렬
    items.sort((a, b) => b.time.localeCompare(a.time))
    setNotifs(items)
  }

  const unreadCount = notifs.filter(n => !readIds.has(n.id)).length

  const handleOpen = () => {
    setShowPanel(true)
  }

  const handleClose = () => {
    // 모두 읽음 처리
    setReadIds(new Set(notifs.map(n => n.id)))
    setShowPanel(false)
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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-eco-green to-coffee-brown rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-eco-green tracking-tight">커피로</h1>
              <p className="text-[10px] text-coffee-brown/60 font-medium -mt-0.5 tracking-wider">COFFEE LO</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleOpen}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </motion.button>
        </div>

        {/* 인사말 */}
        <div className="px-5 pb-4">
          <p className="text-gray-500 text-sm">안녕하세요, <span className="font-semibold text-gray-700">{cafeName}</span></p>
          <p className="text-gray-900 text-base font-semibold mt-0.5">
            오늘도 환경을 위한 한 걸음 함께해요
          </p>
        </div>
      </motion.header>

      {/* 알림 패널 */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* 딤 배경 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />

            {/* 바텀시트 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl max-w-md mx-auto flex flex-col"
              style={{ maxHeight: '80vh' }}
            >
              {/* 핸들 */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">알림</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>

              {/* 알림 목록 */}
              <div className="overflow-y-auto flex-1 px-5 pb-8">
                {notifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Bell className="w-10 h-10 opacity-30 mb-3" />
                    <p className="text-sm">알림이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {notifs.map((n) => {
                      const isRead = readIds.has(n.id)
                      const Icon = n.type === 'announcement' ? Megaphone
                        : n.title.includes('완료') ? CheckCircle2
                        : n.title.includes('도착') ? Truck
                        : Truck
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl transition-colors ${
                            isRead ? 'bg-gray-50' : 'bg-eco-green-100/60'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            n.type === 'announcement' ? 'bg-amber-100' :
                            n.title.includes('완료') ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <Icon className={`w-4.5 h-4.5 ${
                              n.type === 'announcement' ? 'text-amber-600' :
                              n.title.includes('완료') ? 'text-green-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm font-semibold ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                {n.title}
                              </p>
                              {!isRead && (
                                <div className="w-2 h-2 bg-eco-green rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                            <p className="text-[11px] text-gray-300 mt-1">{n.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
