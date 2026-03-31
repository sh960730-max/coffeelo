import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  User, Truck, Bell, Megaphone, HelpCircle, MessageCircle,
  FileText, Shield, LogOut, ChevronRight, Coffee
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function MorePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const driver = user as any
  const driverId = driver?.id

  const [monthCount, setMonthCount] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)
  const [announcementCount, setAnnouncementCount] = useState(0)

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any
    const load = async () => {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // 이번 달 완료 수거
      const { data: monthPickups } = await db.from('pickups')
        .select('total_weight')
        .eq('driver_id', driverId).eq('status', 'COMPLETED')
        .gte('completed_at', firstOfMonth)
      if (monthPickups) {
        setMonthCount(monthPickups.length)
      }

      // 전체 수거량 + 완료율
      const { data: allPickups } = await db.from('pickups')
        .select('status, total_weight')
        .eq('driver_id', driverId)
        .in('status', ['COMPLETED', 'CANCELLED'])
      if (allPickups) {
        const completed = allPickups.filter((p: any) => p.status === 'COMPLETED')
        const weight = completed.reduce((s: number, p: any) => s + (p.total_weight || 0), 0)
        setTotalWeight(weight)
        setCompletionRate(allPickups.length > 0 ? Math.round((completed.length / allPickups.length) * 100) : 0)
      }

      // 공지사항 수
      const { count } = await db.from('announcements')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
      if (count != null) setAnnouncementCount(count)
    }
    load()
  }, [driverId])

  const menuSections = [
    {
      title: '내 정보',
      items: [
        { icon: User, label: '내 정보 수정', desc: '이름, 연락처 변경', route: '/driver/profile-edit' },
        { icon: Truck, label: '차량 정보', desc: '차종, 번호판', route: '/driver/vehicle-info' },
        { icon: Bell, label: '알림 설정', desc: '푸시 알림, 콜 알림음', route: '/driver/notifications' },
      ],
    },
    {
      title: '고객지원',
      items: [
        { icon: Megaphone, label: '공지사항', desc: announcementCount > 0 ? `${announcementCount}개의 공지` : '공지사항', route: '/driver/announcements' },
        { icon: HelpCircle, label: '자주 묻는 질문', desc: 'FAQ', route: '/driver/faq' },
        { icon: MessageCircle, label: '문의하기', desc: '전화/이메일', route: '/driver/inquiry' },
      ],
    },
    {
      title: '약관 및 정보',
      items: [
        { icon: FileText, label: '이용약관', desc: '', route: '/driver/terms' },
        { icon: Shield, label: '개인정보처리방침', desc: '', route: '/driver/privacy' },
      ],
    },
  ]

  const weightDisplay = totalWeight >= 1000
    ? `${(totalWeight / 1000).toFixed(1)}t`
    : `${totalWeight.toLocaleString()}kg`

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">더보기</h1>
      </header>

      <div className="px-5 py-4">
        {/* 프로필 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-lg font-bold">{driver?.name || '기사'} 님</h2>
              <p className="text-sm text-white/70">{driver?.company}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/60">{driver?.truck_type}</span>
                {driver?.license_plate && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="text-xs text-white/60">{driver?.license_plate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 월간 실적 요약 */}
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{monthCount}</p>
              <p className="text-[10px] text-white/60">이번 달 수거</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{weightDisplay}</p>
              <p className="text-[10px] text-white/60">총 수거량</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{completionRate}%</p>
              <p className="text-[10px] text-white/60">완료율</p>
            </div>
          </div>
        </motion.div>

        {/* 메뉴 섹션들 */}
        {menuSections.map((section, sIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sIdx * 0.08 }}
            className="mt-5"
          >
            <h3 className="text-xs font-semibold text-gray-400 mb-2 px-1">{section.title}</h3>
            <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-100">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.99, backgroundColor: '#f9fafb' }}
                    onClick={() => navigate(item.route)}
                    className="w-full flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5 text-gray-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        {item.desc && (
                          <p className="text-[11px] text-gray-400">{item.desc}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ))}

        {/* 로그아웃 */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-5 mb-8 flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl shadow-card text-red-500"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="text-sm font-semibold">로그아웃</span>
        </motion.button>

        {/* 앱 버전 */}
        <div className="text-center pb-8">
          <div className="flex items-center justify-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-[11px] text-gray-300">커피로 v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
