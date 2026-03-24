import { motion } from 'framer-motion'
import {
  Building2, Bell, FileText, LogOut, ChevronRight, Coffee,
  MapPin, Phone, Shield, Store, Megaphone, Users
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const menuSections = [
  {
    title: '관리',
    items: [
      { icon: Store, label: '매장 관리', desc: '등록된 매장 조회/관리', path: '/company/cafes' },
      { icon: Megaphone, label: '공지사항', desc: '공지 작성 및 관리', path: '/company/announcements' },
      { icon: Users, label: '기사 관리', desc: '소속 기사 조회', path: '/company/drivers' },
    ],
  },
  {
    title: '설정',
    items: [
      { icon: Building2, label: '회사 정보', desc: '회사 정보 수정' },
      { icon: Bell, label: '알림 설정', desc: '푸시 알림, 정산 알림' },
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

export default function CompanyMorePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">더보기</h1>
      </header>

      <div className="px-5 py-4">
        {/* 회사 프로필 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-lg font-bold">그린물류</h2>
              <p className="text-sm text-white/70">소속회사 관리자</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/80">서울 강남구 테헤란로 123</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/80">02-555-1234</span>
            </div>
          </div>

          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold text-white">4</p>
              <p className="text-[10px] text-white/60">소속 기사</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">6</p>
              <p className="text-[10px] text-white/60">등록 매장</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">4.7t</p>
              <p className="text-[10px] text-white/60">이번 달</p>
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
                    onClick={() => 'path' in item && item.path && navigate(item.path)}
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
            <span className="text-[11px] text-gray-300">커피로 v1.0.0 (관리자)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
