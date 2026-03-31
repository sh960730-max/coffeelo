import { motion } from 'framer-motion'
import { Bell, Truck, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function DriverHeader() {
  const { user } = useAuth()
  const driverName = (user as any)?.name ?? '기사'
  const driverCompany = (user as any)?.company ?? ''
  const driverTruck = (user as any)?.truck_type ?? ''
  const subInfo = [driverCompany, driverTruck].filter(Boolean).join(' · ')
  const [isOnline, setIsOnline] = useState(true)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100"
    >
      <div className="flex items-center justify-between px-5 py-4">
        {/* 프로필 & 로고 */}
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

        <div className="flex items-center gap-2">
          {/* 알림 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-50"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </motion.button>
        </div>
      </div>

      {/* 온/오프라인 토글 바 */}
      <div className="px-5 pb-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 ${
            isOnline
              ? 'bg-eco-green-100 border border-eco-green-200'
              : 'bg-gray-100 border border-gray-200'
          }`}
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
  )
}
