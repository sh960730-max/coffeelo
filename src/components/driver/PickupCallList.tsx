import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Coffee, ChevronRight, Zap } from 'lucide-react'
import type { PickupCall } from '../../pages/driver/HomePage'

const storeTypeStyle = {
  starbucks: { label: '스벅', bg: 'bg-green-600', text: 'text-white' },
  franchise: { label: '프랜차이즈', bg: 'bg-orange-500', text: 'text-white' },
  individual: { label: '개인카페', bg: 'bg-purple-500', text: 'text-white' },
}

interface PickupCallListProps {
  calls: PickupCall[]
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}

export default function PickupCallList({ calls, onAccept, onDecline }: PickupCallListProps) {
  if (calls.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="px-5 mt-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">대기 중인 콜</h2>
          <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full">
            {calls.length}
          </span>
        </div>
        <button className="text-xs text-eco-green font-medium">거리순 정렬</button>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence>
          {calls.map((call, index) => {
            const typeStyle = storeTypeStyle[call.storeType]
            return (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="bg-white rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeStyle.bg} ${typeStyle.text}`}>
                        {typeStyle.label}
                      </span>
                      {call.isUrgent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          긴급
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium">{call.distance}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{call.storeName}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <p className="text-[11px] text-gray-500 truncate">{call.address}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] text-gray-500">{call.requestedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coffee className="w-3 h-3 text-coffee-brown/60" />
                      <span className="text-[11px] font-medium text-coffee-brown">
                        {call.containerType === 'box' ? `${call.count}박스` : `${call.count}봉지`}
                        {call.estimatedWeight && ` (~${call.estimatedWeight}kg)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDecline(call.id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[11px] font-semibold"
                    >
                      거절
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAccept(call.id)}
                      className="px-3 py-1.5 bg-eco-green text-white rounded-lg text-[11px] font-semibold"
                    >
                      수락
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
