import { motion } from 'framer-motion'
import { Navigation, Phone, Camera, Package, MapPin, Clock, ChevronRight, Coffee } from 'lucide-react'

interface PickupStop {
  id: number
  storeName: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  containerType: 'box' | 'bag'
  estimatedCount: number
  status: 'waiting' | 'arrived' | 'loaded' | 'completed'
  estimatedWeight?: number
}

const storeTypeLabel = {
  starbucks: { label: '스벅', color: 'bg-green-600 text-white', icon: '★' },
  franchise: { label: '프랜차이즈', color: 'bg-orange-500 text-white', icon: '◆' },
  individual: { label: '개인카페', color: 'bg-purple-500 text-white', icon: '●' },
}

const containerLabel = {
  box: { label: '박스', icon: Package },
  bag: { label: '봉지', icon: Package },
}

const statusFlow = ['waiting', 'arrived', 'loaded', 'completed'] as const
const statusLabel: Record<string, string> = {
  waiting: '이동 중',
  arrived: '도착',
  loaded: '상차 완료',
  completed: '수거 완료',
}

const mockActivePickups: PickupStop[] = [
  {
    id: 1,
    storeName: '스타벅스 강남역점',
    storeType: 'starbucks',
    address: '서울 강남구 강남대로 396',
    containerType: 'box',
    estimatedCount: 5,
    status: 'arrived',
  },
  {
    id: 2,
    storeName: '스타벅스 역삼역점',
    storeType: 'starbucks',
    address: '서울 강남구 역삼로 180',
    containerType: 'box',
    estimatedCount: 3,
    status: 'waiting',
  },
  {
    id: 3,
    storeName: '블루보틀 삼성점',
    storeType: 'franchise',
    address: '서울 강남구 테헤란로 521',
    containerType: 'bag',
    estimatedCount: 2,
    estimatedWeight: 15,
    status: 'waiting',
  },
]

function StopCard({ stop, index, onPickupConfirm }: { stop: PickupStop; index: number; onPickupConfirm?: () => void }) {
  const typeInfo = storeTypeLabel[stop.storeType]
  const currentIdx = statusFlow.indexOf(stop.status as typeof statusFlow[number])
  const isActive = stop.status === 'arrived'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
      className={`bg-white rounded-2xl p-4 shadow-card border-l-4 transition-all duration-300 ${
        isActive ? 'border-l-eco-green shadow-card-hover' : 'border-l-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 font-semibold">#{index + 1}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              isActive ? 'bg-eco-green-100 text-eco-green' : 'bg-gray-100 text-gray-500'
            }`}>
              {statusLabel[stop.status]}
            </span>
          </div>
          <h3 className="text-sm font-bold text-gray-900">{stop.storeName}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500 truncate">{stop.address}</p>
          </div>
        </div>

        <div className="text-right ml-3">
          <div className="flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-coffee-brown/60" />
            <span className="text-sm font-bold text-coffee-brown">
              {stop.containerType === 'box' ? `${stop.estimatedCount}박스` : `${stop.estimatedCount}봉지`}
            </span>
          </div>
          {stop.estimatedWeight && (
            <p className="text-[10px] text-gray-400 mt-0.5">~{stop.estimatedWeight}kg 예상</p>
          )}
        </div>
      </div>

      {/* 상태 미니 스텝퍼 */}
      <div className="flex items-center gap-0.5 mt-3">
        {statusFlow.map((step, idx) => (
          <div key={step} className="flex-1">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                idx <= currentIdx ? 'bg-eco-green' : 'bg-gray-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* 액션 버튼들 - 현재 진행 중인 매장만 */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-eco-green text-white rounded-xl text-xs font-semibold"
          >
            <Navigation className="w-3.5 h-3.5" />
            길안내
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            전화
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPickupConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-coffee-brown text-white rounded-xl text-xs font-semibold"
          >
            <Camera className="w-3.5 h-3.5" />
            수거확인
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ActivePickupCard({ onPickupConfirm }: { onPickupConfirm?: () => void }) {
  const totalBoxes = mockActivePickups.reduce((sum, s) => s.containerType === 'box' ? sum + s.estimatedCount : sum, 0)
  const totalBags = mockActivePickups.reduce((sum, s) => s.containerType === 'bag' ? sum + s.estimatedCount : sum, 0)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="px-5 mt-2"
    >
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">진행 중인 수거</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {mockActivePickups.length}곳 · {totalBoxes > 0 && `박스 ${totalBoxes}개`}{totalBoxes > 0 && totalBags > 0 && ' · '}{totalBags > 0 && `봉지 ${totalBags}개`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-eco-green" />
          <span className="text-xs font-semibold text-eco-green">예상 1시간 20분</span>
        </div>
      </div>

      {/* 경로 순서 카드 리스트 */}
      <div className="space-y-2.5">
        {mockActivePickups.map((stop, index) => (
          <StopCard key={stop.id} stop={stop} index={index} onPickupConfirm={onPickupConfirm} />
        ))}
      </div>

      {/* 집하장 이동 버튼 */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-3 flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-dashed border-gray-300"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-coffee-brown" />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500">수거 완료 후</p>
            <p className="text-sm font-semibold text-gray-800">그린물류 집하장으로 이동</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </motion.button>
    </motion.section>
  )
}
