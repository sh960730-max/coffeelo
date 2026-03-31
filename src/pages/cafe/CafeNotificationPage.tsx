import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Truck, CreditCard, Megaphone, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const notifItems = [
  { key: 'pickup_request',   icon: Truck,         label: '수거 신청 알림',   desc: '수거 신청 완료 시 알림' },
  { key: 'pickup_assigned',  icon: Truck,         label: '기사 배정 알림',   desc: '기사가 배정되면 알림' },
  { key: 'pickup_complete',  icon: Truck,         label: '수거 완료 알림',   desc: '수거가 완료되면 알림' },
  { key: 'settlement',       icon: CreditCard,    label: '정산 알림',        desc: '월별 정산 확정 시 알림' },
  { key: 'announcement',     icon: Megaphone,     label: '공지사항 알림',    desc: '새 공지 등록 시 알림' },
  { key: 'marketing',        icon: MessageCircle, label: '마케팅 알림',      desc: '이벤트 및 혜택 안내' },
]

export default function CafeNotificationPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(notifItems.map(i => [i.key, i.key !== 'marketing']))
  )

  const toggle = (key: string) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">알림 설정</h1>
      </header>

      <div className="px-5 py-6">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-100">
          {notifItems.map((item) => {
            const Icon = item.icon
            const isOn = settings[item.key]
            return (
              <div key={item.key} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOn ? 'bg-eco-green-100' : 'bg-gray-50'}`}>
                    <Icon className={`w-4.5 h-4.5 ${isOn ? 'text-eco-green' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggle(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isOn ? 'bg-eco-green' : 'bg-gray-200'}`}
                >
                  <motion.div
                    animate={{ x: isOn ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </motion.button>
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          알림 설정은 앱 내에서만 적용됩니다.
        </p>
      </div>
    </div>
  )
}
