import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle2, Clock, User } from 'lucide-react'

interface PickupItem {
  id: number
  status: 'pending' | 'assigned' | 'inProgress' | 'completed'
  time: string
  driverName?: string
  bags: number
}

const statusConfig = {
  pending: { label: '접수됨', color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  assigned: { label: '기사 배정', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50', icon: User },
  inProgress: { label: '수거 중', color: 'bg-eco-green', textColor: 'text-eco-green', bgColor: 'bg-eco-green-100', icon: Truck },
  completed: { label: '완료', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle2 },
}

const steps = ['pending', 'assigned', 'inProgress', 'completed'] as const

const mockPickups: PickupItem[] = [
  { id: 1, status: 'inProgress', time: '오전 10:00 ~ 11:00', driverName: '박기사', bags: 3 },
  { id: 2, status: 'assigned', time: '오후 2:00 ~ 3:00', driverName: '이기사', bags: 2 },
]

function StatusStepper({ currentStatus }: { currentStatus: PickupItem['status'] }) {
  const currentIdx = steps.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, idx) => {
        const isActive = idx <= currentIdx
        const config = statusConfig[step]
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                  isActive ? config.color : 'bg-gray-200'
                }`}
              />
              <span className={`text-[10px] mt-1 ${isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {config.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PickupStatusCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="px-5 mt-2"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">오늘 수거 예정</h2>
        <span className="text-xs font-semibold text-eco-green bg-eco-green-100 px-2.5 py-1 rounded-full">
          {mockPickups.length}건
        </span>
      </div>

      <div className="space-y-3">
        {mockPickups.map((pickup, index) => {
          const config = statusConfig[pickup.status]
          const StatusIcon = config.icon
          return (
            <motion.div
              key={pickup.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                    <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${config.textColor} ${config.bgColor} px-2 py-0.5 rounded-full`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 font-medium">{pickup.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{pickup.driverName || '배정 대기'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Package className="w-3.5 h-3.5 text-coffee-brown/60" />
                    <span className="text-sm font-semibold text-coffee-brown">{pickup.bags}포대</span>
                  </div>
                </div>
              </div>

              <StatusStepper currentStatus={pickup.status} />
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
