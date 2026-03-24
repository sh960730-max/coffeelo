import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Coffee, ChevronRight, Zap } from 'lucide-react'

interface PickupCall {
  id: number
  storeName: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  distance: string
  containerType: 'box' | 'bag'
  count: number
  estimatedWeight?: number
  requestedTime: string
  isUrgent: boolean
}

const storeTypeStyle = {
  starbucks: { label: '스벅', bg: 'bg-green-600', text: 'text-white' },
  franchise: { label: '프랜차이즈', bg: 'bg-orange-500', text: 'text-white' },
  individual: { label: '개인카페', bg: 'bg-purple-500', text: 'text-white' },
}

const mockCalls: PickupCall[] = [
  {
    id: 101,
    storeName: '스타벅스 선릉역점',
    storeType: 'starbucks',
    address: '서울 강남구 선릉로 525',
    distance: '2.3km',
    containerType: 'box',
    count: 4,
    requestedTime: '오후 3:00 ~ 4:00',
    isUrgent: true,
  },
  {
    id: 102,
    storeName: '커피랑도서관 서초점',
    storeType: 'individual',
    address: '서울 서초구 서초대로 301',
    distance: '3.8km',
    containerType: 'bag',
    count: 3,
    estimatedWeight: 20,
    requestedTime: '오후 4:00 ~ 5:00',
    isUrgent: false,
  },
  {
    id: 103,
    storeName: '스타벅스 대치역점',
    storeType: 'starbucks',
    address: '서울 강남구 삼성로 510',
    distance: '4.1km',
    containerType: 'box',
    count: 6,
    requestedTime: '오후 5:00 ~ 6:00',
    isUrgent: false,
  },
]

export default function PickupCallList() {
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
            {mockCalls.length}
          </span>
        </div>
        <button className="text-xs text-eco-green font-medium">거리순 정렬</button>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence>
          {mockCalls.map((call, index) => {
            const typeStyle = storeTypeStyle[call.storeType]
            return (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
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
                      className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[11px] font-semibold"
                    >
                      거절
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
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
