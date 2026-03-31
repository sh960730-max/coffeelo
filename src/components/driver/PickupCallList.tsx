import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Coffee, ChevronRight, Zap, MessageSquare, X, Package, Navigation } from 'lucide-react'
import type { PickupCall } from '../../pages/driver/HomePage'

// Haversine 거리 계산 (km)
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

const storeTypeStyle = {
  starbucks:  { label: '스벅',      bg: 'bg-green-600',  text: 'text-white' },
  franchise:  { label: '프랜차이즈', bg: 'bg-orange-500', text: 'text-white' },
  individual: { label: '개인카페',  bg: 'bg-purple-500', text: 'text-white' },
}

interface PickupCallListProps {
  calls: PickupCall[]
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}

export default function PickupCallList({ calls, onAccept, onDecline }: PickupCallListProps) {
  const [selectedCall, setSelectedCall] = useState<PickupCall | null>(null)
  const [displayCalls, setDisplayCalls] = useState<PickupCall[]>(calls)
  const [sortedByDist, setSortedByDist] = useState(false)
  const [sortingLoading, setSortingLoading] = useState(false)

  // calls가 바뀌면 정렬 초기화
  useEffect(() => {
    setSortedByDist(false)
    setDisplayCalls(calls)
  }, [calls])

  const handleSortByDistance = () => {
    if (sortedByDist) {
      // 정렬 해제 → 원래 순서(요청시각순)로
      setSortedByDist(false)
      setDisplayCalls(calls)
      return
    }
    if (!navigator.geolocation) {
      alert('이 기기에서 위치 서비스를 지원하지 않습니다.')
      return
    }
    setSortingLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: myLat, longitude: myLng } = pos.coords
        const withDist = calls.map(c => {
          if (c.lat != null && c.lng != null) {
            const km = haversine(myLat, myLng, c.lat, c.lng)
            return { ...c, distance: formatDist(km), _km: km }
          }
          return { ...c, _km: Infinity }
        })
        withDist.sort((a, b) => (a as any)._km - (b as any)._km)
        setDisplayCalls(withDist)
        setSortedByDist(true)
        setSortingLoading(false)
      },
      (err) => {
        console.error('geolocation error:', err)
        alert('위치 정보를 가져올 수 없습니다. 브라우저 위치 권한을 허용해주세요.')
        setSortingLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  if (calls.length === 0) return null

  const handleAccept = (id: string) => {
    setSelectedCall(null)
    onAccept(id)
  }

  const handleDecline = (id: string) => {
    setSelectedCall(null)
    onDecline(id)
  }

  return (
    <>
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
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleSortByDistance}
            disabled={sortingLoading}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              sortedByDist
                ? 'bg-eco-green text-white'
                : 'bg-eco-green-100 text-eco-green'
            }`}
          >
            {sortingLoading
              ? <span className="w-3 h-3 border border-eco-green border-t-transparent rounded-full animate-spin" />
              : <Navigation className="w-3 h-3" />
            }
            {sortedByDist ? '거리순 ✓' : '거리순 정렬'}
          </motion.button>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence>
            {displayCalls.map((call, index) => {
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
                  <button
                    className="flex items-start justify-between w-full text-left"
                    onClick={() => setSelectedCall(call)}
                  >
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
                        {call.distance && call.distance !== '-' && (
                          <span className="text-[10px] font-semibold text-eco-green flex items-center gap-0.5">
                            <Navigation className="w-2.5 h-2.5" />
                            {call.distance}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{call.storeName}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <p className="text-[11px] text-gray-500 truncate">{call.address}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
                  </button>

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

      {/* ── 상세 바텀시트 ── */}
      <AnimatePresence>
        {selectedCall && (
          <>
            {/* 딤 배경 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCall(null)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />

            {/* 바텀시트 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-xl max-w-md mx-auto flex flex-col"
              style={{ maxHeight: '88vh' }}
            >
              {/* 핸들 */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900">콜 상세 정보</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCall(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>

              {/* 스크롤 콘텐츠 */}
              <div className="px-5 overflow-y-auto flex-1 space-y-4 pb-4">
                {/* 매장 정보 */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${storeTypeStyle[selectedCall.storeType].bg} ${storeTypeStyle[selectedCall.storeType].text}`}>
                      {storeTypeStyle[selectedCall.storeType].label}
                    </span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{selectedCall.storeName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500">{selectedCall.address}</p>
                  </div>
                </div>

                {/* 수거 정보 */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">수거 수량</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedCall.containerType === 'box' ? `${selectedCall.count}박스` : `${selectedCall.count}봉지`}
                      {selectedCall.estimatedWeight ? ` · 약 ${selectedCall.estimatedWeight}kg` : ''}
                    </span>
                  </div>
                  {selectedCall.pickupTimeStart && selectedCall.pickupTimeEnd && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">희망 수거 시간</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {selectedCall.pickupTimeStart} ~ {selectedCall.pickupTimeEnd}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">요청 시각</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{selectedCall.requestedTime}</span>
                  </div>
                </div>

                {/* 점주 전달 사항 */}
                {(selectedCall.note || selectedCall.storagePhotoUrl) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-amber-600" />
                      </div>
                      <p className="text-sm font-bold text-amber-800">점주 전달 사항</p>
                    </div>

                    {selectedCall.note && (
                      <div className="bg-white rounded-xl px-3 py-2.5">
                        <p className="text-[11px] font-semibold text-gray-400 mb-1">메모</p>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedCall.note}</p>
                      </div>
                    )}

                    {selectedCall.storagePhotoUrl && (
                      <div>
                        <p className="text-[11px] font-semibold text-amber-700 mb-1.5">보관장소 사진</p>
                        <div className="rounded-xl overflow-hidden">
                          <img
                            src={selectedCall.storagePhotoUrl}
                            alt="보관장소"
                            className="w-full object-cover max-h-52"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 하단 고정 버튼 */}
              <div className="flex gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDecline(selectedCall.id)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold"
                >
                  거절
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAccept(selectedCall.id)}
                  className="flex-1 py-3.5 bg-eco-green text-white rounded-2xl text-sm font-bold"
                >
                  수락
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
