import { motion } from 'framer-motion'
import {
  Store, Bell, Megaphone, HelpCircle, MessageCircle,
  FileText, Shield, LogOut, ChevronRight, Coffee, MapPin
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { dummyAnnouncements } from '../../lib/dummyData'
import type { Cafe } from '../../lib/database.types'

const menuSections = [
  {
    title: '매장 관리',
    items: [
      { icon: Store, label: '매장 정보', desc: '매장명, 주소, 연락처' },
      { icon: Bell, label: '알림 설정', desc: '수거 알림, 정산 알림' },
    ],
  },
  {
    title: '고객지원',
    items: [
      { icon: Megaphone, label: '공지사항', desc: `${dummyAnnouncements.length}개의 공지` },
      { icon: HelpCircle, label: 'FAQ', desc: '자주 묻는 질문' },
      { icon: MessageCircle, label: '문의하기', desc: '카카오톡 채널' },
    ],
  },
  {
    title: '약관 및 정보',
    items: [
      { icon: FileText, label: '이용약관', desc: '' },
      { icon: Shield, label: '개인정보처리방침', desc: '' },
    ],
  },
]

export default function CafeMorePage() {
  const { user, logout } = useAuth()
  const cafe = user as Cafe | null

  return (
    <div>
      {/* 헤더 */}
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
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-lg font-bold">{cafe?.name || '스타벅스 강남역점'}</h2>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-white/60" />
                <p className="text-xs text-white/60">{cafe?.address || '서울 강남구 강남대로 396'}</p>
              </div>
              {cafe?.phone && (
                <p className="text-xs text-white/50 mt-0.5">{cafe.phone}</p>
              )}
            </div>
          </div>

          {/* 월간 요약 */}
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold text-white">12</p>
              <p className="text-[10px] text-white/60">이번 달 수거</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">80kg</p>
              <p className="text-[10px] text-white/60">총 수거량</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">4.8만</p>
              <p className="text-[10px] text-white/60">절감 금액</p>
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
