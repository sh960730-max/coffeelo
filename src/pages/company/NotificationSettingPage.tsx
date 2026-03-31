import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Truck, CreditCard, Megaphone, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Setting {
  id: string
  icon: any
  label: string
  desc: string
  enabled: boolean
}

export default function NotificationSettingPage() {
  const navigate = useNavigate()

  const [settings, setSettings] = useState<Setting[]>([
    { id: 'pickup_request', icon: Truck, label: '수거 요청 알림', desc: '새로운 수거 요청이 들어올 때', enabled: true },
    { id: 'pickup_complete', icon: Truck, label: '수거 완료 알림', desc: '기사가 수거를 완료했을 때', enabled: true },
    { id: 'settlement', icon: CreditCard, label: '정산 알림', desc: '정산이 확정되거나 지급될 때', enabled: true },
    { id: 'announcement', icon: Megaphone, label: '공지사항 알림', desc: '새 공지사항이 등록될 때', enabled: false },
    { id: 'driver_join', icon: MessageSquare, label: '기사 가입 승인 요청', desc: '새 기사 가입 신청이 들어올 때', enabled: true },
  ])

  const toggle = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">알림 설정</h1>
        </div>
      </header>

      <div className="px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-eco-green-100 rounded-2xl px-4 py-3 mb-5"
        >
          <Bell className="w-4 h-4 text-eco-green flex-shrink-0" />
          <p className="text-xs text-eco-green leading-relaxed">
            앱 알림을 받으려면 기기 설정에서 알림 권한을 허용해 주세요.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-100"
        >
          {settings.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * idx }}
                className="flex items-center justify-between px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.label}</p>
                    <p className="text-[11px] text-gray-400">{s.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${s.enabled ? 'bg-eco-green' : 'bg-gray-200'}`}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                    style={{ left: s.enabled ? '22px' : '2px' }}
                  />
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
