import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, Phone, Camera, Package, MapPin, Clock, ChevronRight, Coffee, X } from 'lucide-react'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
import type { PickupStop } from '../../pages/driver/HomePage'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const storeTypeLabel = {
  starbucks: { label: '스벅', color: 'bg-green-600 text-white', icon: '★' },
  franchise: { label: '프랜차이즈', color: 'bg-orange-500 text-white', icon: '◆' },
  individual: { label: '개인카페', color: 'bg-purple-500 text-white', icon: '●' },
}

const statusFlow = ['waiting', 'arrived', 'loaded', 'completed'] as const
const statusLabel: Record<string, string> = {
  waiting: '이동 중',
  arrived: '도착',
  loaded: '상차 완료',
  completed: '수거 완료',
}

// 네비게이션 앱 목록 (API 키 불필요 - 주소 텍스트 기반)
const navApps = [
  {
    id: 'kakao',
    name: '카카오맵',
    color: 'bg-yellow-400',
    textColor: 'text-gray-900',
    emoji: '🗺',
    getUrl: (address: string) => {
      const encoded = encodeURIComponent(address)
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
      return isMobile
        ? `kakaomap://search?q=${encoded}`
        : `https://map.kakao.com/link/search/${encoded}`
    },
    fallbackUrl: (address: string) =>
      `https://map.kakao.com/link/search/${encodeURIComponent(address)}`,
  },
  {
    id: 'naver',
    name: '네이버 지도',
    color: 'bg-green-500',
    textColor: 'text-white',
    emoji: '🧭',
    getUrl: (address: string) => {
      const encoded = encodeURIComponent(address)
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
      return isMobile
        ? `nmap://search?query=${encoded}&appname=kr.co.smartecosys`
        : `https://map.naver.com/v5/search/${encoded}`
    },
    fallbackUrl: (address: string) =>
      `https://map.naver.com/v5/search/${encodeURIComponent(address)}`,
  },
  {
    id: 'google',
    name: '구글 지도',
    color: 'bg-blue-500',
    textColor: 'text-white',
    emoji: '📍',
    getUrl: (address: string) =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    fallbackUrl: (address: string) =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  },
]

function StopCard({
  stop,
  index,
  onPickupConfirm,
}: {
  stop: PickupStop
  index: number
  onPickupConfirm?: (id: string) => void
}) {
  const typeInfo = storeTypeLabel[stop.storeType]
  const currentIdx = statusFlow.indexOf(stop.status as typeof statusFlow[number])
  const isActive = stop.status === 'arrived'
  const [showNavSheet, setShowNavSheet] = useState(false)

  const handleNavSelect = (app: typeof navApps[0]) => {
    const url = app.getUrl(stop.address)
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)

    if (isMobile && (app.id === 'kakao' || app.id === 'naver')) {
      // 앱 딥링크 시도 → 앱 없으면 웹으로 폴백
      const fallback = app.fallbackUrl(stop.address)
      const timer = setTimeout(() => {
        window.open(fallback, '_blank')
      }, 1500)
      window.location.href = url
      // 페이지가 앱으로 전환되면 타이머 취소
      window.addEventListener('blur', () => clearTimeout(timer), { once: true })
    } else {
      window.open(url, '_blank')
    }
    setShowNavSheet(false)
  }

  const handleCall = () => {
    if (stop.phone) {
      window.location.href = `tel:${stop.phone.replace(/[^0-9]/g, '')}`
    }
  }

  return (
    <>
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
              <div className={`h-1 rounded-full transition-all duration-500 ${
                idx <= currentIdx ? 'bg-eco-green' : 'bg-gray-200'
              }`} />
            </div>
          ))}
        </div>

        {/* 액션 버튼들 */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNavSheet(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-eco-green text-white rounded-xl text-xs font-semibold"
          >
            <Navigation className="w-3.5 h-3.5" />
            길안내
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCall}
            disabled={!stop.phone}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold ${
              stop.phone ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            전화
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onPickupConfirm?.(stop.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-coffee-brown text-white rounded-xl text-xs font-semibold"
          >
            <Camera className="w-3.5 h-3.5" />
            수거확인
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 네비게이션 앱 선택 바텀시트 */}
      <AnimatePresence>
        {showNavSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowNavSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-4 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              {/* 목적지 */}
              <div className="flex items-start gap-2 mb-5 bg-gray-50 rounded-2xl px-4 py-3">
                <Navigation className="w-4 h-4 text-eco-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">목적지</p>
                  <p className="text-sm font-bold text-gray-900">{stop.storeName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stop.address}</p>
                </div>
                <button onClick={() => setShowNavSheet(false)} className="ml-auto">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <p className="text-xs font-semibold text-gray-500 mb-3">앱 선택</p>
              <div className="space-y-2.5">
                {navApps.map((app) => (
                  <motion.button
                    key={app.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNavSelect(app)}
                    className="w-full flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3.5"
                  >
                    <div className={`w-11 h-11 ${app.color} rounded-2xl flex items-center justify-center text-xl`}>
                      {app.emoji}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{app.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

interface ActivePickupCardProps {
  pickups: PickupStop[]
  onPickupConfirm?: (id: string) => void
}

export default function ActivePickupCard({ pickups, onPickupConfirm }: ActivePickupCardProps) {
  const { user } = useAuth()
  const driverCompany = (user as any)?.company ?? ''
  const totalBoxes = pickups.reduce((sum, s) => s.containerType === 'box' ? sum + s.estimatedCount : sum, 0)
  const totalBags = pickups.reduce((sum, s) => s.containerType === 'bag' ? sum + s.estimatedCount : sum, 0)

  const [depotAddress, setDepotAddress] = useState<string | null>(null)
  const [showDepotNav, setShowDepotNav] = useState(false)
  const [displayPickups, setDisplayPickups] = useState(pickups)
  const [sortedByDist, setSortedByDist] = useState(false)
  const [sortingLoading, setSortingLoading] = useState(false)

  useEffect(() => {
    setSortedByDist(false)
    setDisplayPickups(pickups)
  }, [pickups])

  const handleSortByDistance = () => {
    if (sortedByDist) {
      setSortedByDist(false)
      setDisplayPickups(pickups)
      return
    }
    if (!navigator.geolocation) return
    setSortingLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: myLat, longitude: myLng } = pos.coords
        const sorted = [...pickups].sort((a, b) => {
          const kmA = a.lat != null && a.lng != null ? haversine(myLat, myLng, a.lat, a.lng) : Infinity
          const kmB = b.lat != null && b.lng != null ? haversine(myLat, myLng, b.lat, b.lng) : Infinity
          return kmA - kmB
        })
        setDisplayPickups(sorted)
        setSortedByDist(true)
        setSortingLoading(false)
      },
      () => setSortingLoading(false),
      { timeout: 8000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    if (!driverCompany) return
    ;(supabase as any)
      .from('companies')
      .select('address')
      .eq('name', driverCompany)
      .single()
      .then(({ data }: any) => {
        if (data?.address) setDepotAddress(data.address)
      })
  }, [driverCompany])

  const handleDepotNavSelect = (app: typeof navApps[0]) => {
    const address = depotAddress || driverCompany
    const url = app.getUrl(address)
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
    if (isMobile && (app.id === 'kakao' || app.id === 'naver')) {
      const fallback = app.fallbackUrl(address)
      const timer = setTimeout(() => { window.open(fallback, '_blank') }, 1500)
      window.location.href = url
      window.addEventListener('blur', () => clearTimeout(timer), { once: true })
    } else {
      window.open(url, '_blank')
    }
    setShowDepotNav(false)
  }

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
            {pickups.length}곳 · {totalBoxes > 0 && `박스 ${totalBoxes}개`}{totalBoxes > 0 && totalBags > 0 && ' · '}{totalBags > 0 && `봉지 ${totalBags}개`}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleSortByDistance}
          disabled={sortingLoading}
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
            sortedByDist ? 'bg-eco-green text-white' : 'bg-eco-green-100 text-eco-green'
          }`}
        >
          {sortingLoading
            ? <span className="w-3 h-3 border border-eco-green border-t-transparent rounded-full animate-spin" />
            : <Navigation className="w-3 h-3" />
          }
          {sortedByDist ? '거리순 ✓' : '거리순 정렬'}
        </motion.button>
      </div>

      {/* 경로 순서 카드 리스트 */}
      <div className="space-y-2.5">
        {displayPickups.map((stop, index) => (
          <StopCard key={stop.id} stop={stop} index={index} onPickupConfirm={onPickupConfirm} />
        ))}
      </div>

      {/* 집하장 이동 버튼 */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDepotNav(true)}
        className="w-full mt-3 flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-dashed border-gray-300"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-coffee-brown" />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500">수거 완료 후</p>
            <p className="text-sm font-semibold text-gray-800">{driverCompany} 집하장으로 이동</p>
          </div>
        </div>
        <Navigation className="w-4 h-4 text-eco-green" />
      </motion.button>

      {/* 집하장 네비게이션 바텀시트 */}
      <AnimatePresence>
        {showDepotNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDepotNav(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-4 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-start gap-2 mb-5 bg-gray-50 rounded-2xl px-4 py-3">
                <MapPin className="w-4 h-4 text-coffee-brown mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">목적지 (집하장)</p>
                  <p className="text-sm font-bold text-gray-900">{driverCompany} 집하장</p>
                  {depotAddress && <p className="text-xs text-gray-500 mt-0.5">{depotAddress}</p>}
                </div>
                <button onClick={() => setShowDepotNav(false)} className="ml-auto">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-xs font-semibold text-gray-500 mb-3">앱 선택</p>
              <div className="space-y-2.5">
                {navApps.map((app) => (
                  <motion.button
                    key={app.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDepotNavSelect(app)}
                    className="w-full flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3.5"
                  >
                    <div className={`w-11 h-11 ${app.color} rounded-2xl flex items-center justify-center text-xl`}>
                      {app.emoji}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{app.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
