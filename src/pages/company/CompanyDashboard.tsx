import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Scale, ClipboardList, Users, Bell,
  TrendingUp, Truck, Circle, ChevronRight, Package,
  ArrowLeft, MapPin, Clock, Coffee, CheckCircle2, X
} from 'lucide-react'

/* ── 더미 데이터 ── */
const driverStatuses = [
  { id: 'd1', name: '박민수', truckType: '1톤 트럭', status: 'collecting' as const, todayKg: 385, pickups: 12 },
  { id: 'd2', name: '김영호', truckType: '1톤 트럭', status: 'online' as const, todayKg: 210, pickups: 7 },
  { id: 'd3', name: '이준혁', truckType: '0.5톤 트럭', status: 'collecting' as const, todayKg: 320, pickups: 9 },
  { id: 'd4', name: '최지훈', truckType: '1톤 트럭', status: 'offline' as const, todayKg: 335, pickups: 4 },
]

const statusConfig = {
  online: { label: '온라인', color: 'bg-emerald-400', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  collecting: { label: '수거중', color: 'bg-amber-400', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  offline: { label: '오프라인', color: 'bg-gray-300', textColor: 'text-gray-500', bgColor: 'bg-gray-100' },
}

const summaryCards = [
  { label: '총 수거량', value: '1,250kg', icon: Scale, color: 'text-eco-green', bg: 'bg-eco-green-100', trend: '+12%' },
  { label: '수거 건수', value: '32건', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5건' },
  { label: '활동 기사', value: '8명', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', trend: '' },
]

/* ── 기사별 오늘 수거내역 더미 데이터 ── */
interface PickupRecord {
  id: string
  cafeName: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  time: string
  containerType: 'box' | 'bag'
  quantity: number
  weight: number
  status: 'completed' | 'inProgress' | 'assigned'
}

const storeTypeBadge = {
  starbucks: { label: '스벅', bg: 'bg-green-600' },
  franchise: { label: '프랜차이즈', bg: 'bg-orange-500' },
  individual: { label: '개인카페', bg: 'bg-purple-500' },
}

const driverPickups: Record<string, PickupRecord[]> = {
  'd1': [
    { id: 'p1', cafeName: '스타벅스 강남역점', storeType: 'starbucks', address: '강남구 강남대로 396', time: '09:15', containerType: 'box', quantity: 5, weight: 45, status: 'completed' },
    { id: 'p2', cafeName: '스타벅스 역삼역점', storeType: 'starbucks', address: '강남구 역삼로 180', time: '09:52', containerType: 'box', quantity: 3, weight: 28, status: 'completed' },
    { id: 'p3', cafeName: '블루보틀 삼성점', storeType: 'franchise', address: '강남구 테헤란로 521', time: '10:30', containerType: 'bag', quantity: 2, weight: 18, status: 'completed' },
    { id: 'p4', cafeName: '커피랑도서관 서초점', storeType: 'individual', address: '서초구 서초대로 301', time: '11:05', containerType: 'bag', quantity: 3, weight: 22, status: 'completed' },
    { id: 'p5', cafeName: '스타벅스 선릉역점', storeType: 'starbucks', address: '강남구 선릉로 525', time: '11:40', containerType: 'box', quantity: 4, weight: 35, status: 'completed' },
    { id: 'p6', cafeName: '이디야 대치점', storeType: 'franchise', address: '강남구 대치동 512', time: '13:20', containerType: 'box', quantity: 3, weight: 30, status: 'completed' },
    { id: 'p7', cafeName: '할리스 역삼점', storeType: 'franchise', address: '강남구 역삼동 830', time: '13:55', containerType: 'box', quantity: 4, weight: 38, status: 'completed' },
    { id: 'p8', cafeName: '스타벅스 삼성역점', storeType: 'starbucks', address: '강남구 삼성로 510', time: '14:30', containerType: 'box', quantity: 5, weight: 42, status: 'completed' },
    { id: 'p9', cafeName: '커피빈 선릉점', storeType: 'franchise', address: '강남구 선릉로 433', time: '15:10', containerType: 'box', quantity: 3, weight: 32, status: 'completed' },
    { id: 'p10', cafeName: '메가커피 대치점', storeType: 'franchise', address: '강남구 대치동 890', time: '15:45', containerType: 'box', quantity: 4, weight: 38, status: 'completed' },
    { id: 'p11', cafeName: '투썸 역삼점', storeType: 'franchise', address: '강남구 역삼동 720', time: '16:20', containerType: 'box', quantity: 3, weight: 30, status: 'completed' },
    { id: 'p12', cafeName: '스타벅스 대치역점', storeType: 'starbucks', address: '강남구 삼성로 510', time: '', containerType: 'box', quantity: 4, weight: 0, status: 'inProgress' },
  ],
  'd2': [
    { id: 'p1', cafeName: '스타벅스 잠실점', storeType: 'starbucks', address: '송파구 올림픽로 300', time: '09:30', containerType: 'box', quantity: 4, weight: 35, status: 'completed' },
    { id: 'p2', cafeName: '이디야 잠실나루점', storeType: 'franchise', address: '송파구 백제고분로 200', time: '10:15', containerType: 'box', quantity: 3, weight: 25, status: 'completed' },
    { id: 'p3', cafeName: '카페베네 송파점', storeType: 'franchise', address: '송파구 송파대로 120', time: '11:00', containerType: 'bag', quantity: 2, weight: 15, status: 'completed' },
    { id: 'p4', cafeName: '빽다방 가락점', storeType: 'franchise', address: '송파구 가락로 78', time: '11:40', containerType: 'box', quantity: 3, weight: 28, status: 'completed' },
    { id: 'p5', cafeName: '스타벅스 문정점', storeType: 'starbucks', address: '송파구 문정동 640', time: '13:10', containerType: 'box', quantity: 4, weight: 37, status: 'completed' },
    { id: 'p6', cafeName: '투썸 잠실점', storeType: 'franchise', address: '송파구 잠실동 180', time: '13:50', containerType: 'box', quantity: 3, weight: 35, status: 'completed' },
    { id: 'p7', cafeName: '커피나무 방이점', storeType: 'individual', address: '송파구 방이동 44', time: '14:30', containerType: 'bag', quantity: 2, weight: 35, status: 'completed' },
  ],
  'd3': [
    { id: 'p1', cafeName: '스타벅스 서초점', storeType: 'starbucks', address: '서초구 서초대로 250', time: '09:00', containerType: 'box', quantity: 5, weight: 40, status: 'completed' },
    { id: 'p2', cafeName: '할리스 교대점', storeType: 'franchise', address: '서초구 서초중앙로 100', time: '09:45', containerType: 'box', quantity: 3, weight: 25, status: 'completed' },
    { id: 'p3', cafeName: '카페 드 플로르', storeType: 'individual', address: '서초구 방배동 850', time: '10:20', containerType: 'bag', quantity: 4, weight: 30, status: 'completed' },
    { id: 'p4', cafeName: '스타벅스 반포점', storeType: 'starbucks', address: '서초구 반포대로 58', time: '11:10', containerType: 'box', quantity: 4, weight: 35, status: 'completed' },
    { id: 'p5', cafeName: '이디야 양재점', storeType: 'franchise', address: '서초구 양재동 215', time: '11:50', containerType: 'box', quantity: 3, weight: 28, status: 'completed' },
    { id: 'p6', cafeName: '메가커피 서초점', storeType: 'franchise', address: '서초구 서초동 1330', time: '13:20', containerType: 'box', quantity: 4, weight: 35, status: 'completed' },
    { id: 'p7', cafeName: '커피빈 서래마을점', storeType: 'franchise', address: '서초구 반포동 100', time: '14:00', containerType: 'box', quantity: 3, weight: 32, status: 'completed' },
    { id: 'p8', cafeName: '스타벅스 방배점', storeType: 'starbucks', address: '서초구 방배동 470', time: '14:40', containerType: 'box', quantity: 4, weight: 38, status: 'completed' },
    { id: 'p9', cafeName: '빽다방 서초점', storeType: 'franchise', address: '서초구 서초동 1600', time: '', containerType: 'box', quantity: 3, weight: 0, status: 'assigned' },
  ],
  'd4': [
    { id: 'p1', cafeName: '스타벅스 논현점', storeType: 'starbucks', address: '강남구 논현로 680', time: '08:30', containerType: 'box', quantity: 5, weight: 45, status: 'completed' },
    { id: 'p2', cafeName: '투썸 신논현점', storeType: 'franchise', address: '강남구 강남대로 480', time: '09:20', containerType: 'box', quantity: 4, weight: 38, status: 'completed' },
    { id: 'p3', cafeName: '이디야 학동점', storeType: 'franchise', address: '강남구 학동로 230', time: '10:10', containerType: 'box', quantity: 3, weight: 120, status: 'completed' },
    { id: 'p4', cafeName: '카페 모모 압구정', storeType: 'individual', address: '강남구 압구정로 340', time: '11:00', containerType: 'bag', quantity: 2, weight: 132, status: 'completed' },
  ],
}

export default function CompanyDashboard() {
  const [pendingCount] = useState(5)
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)

  const selectedDriverInfo = driverStatuses.find(d => d.id === selectedDriver)
  const selectedPickups = selectedDriver ? (driverPickups[selectedDriver] || []) : []
  const completedPickups = selectedPickups.filter(p => p.status === 'completed')
  const totalWeight = completedPickups.reduce((s, p) => s + p.weight, 0)

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-eco-green to-eco-green-700 px-5 pt-6 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/70">소속회사 관리자</span>
            </div>
            <h1 className="text-xl font-bold text-white">그린물류 관리자</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            {pendingCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {pendingCount}
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* 미처리 수거 요청 배너 */}
        <AnimatePresence>
          {pendingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-300" />
                <span className="text-sm text-white font-medium">미배정 수거 요청 {pendingCount}건</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60" />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="px-5 py-4">
        {/* 오늘의 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 mb-3"
        >
          <TrendingUp className="w-4 h-4 text-eco-green" />
          <h2 className="text-sm font-bold text-gray-800">오늘의 현황</h2>
          <span className="text-[11px] text-gray-400 ml-auto">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </span>
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5">
          {summaryCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-xl p-3 shadow-card text-center"
              >
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mx-auto`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-[10px] text-gray-400">{card.label}</p>
                {card.trend && (
                  <span className="text-[9px] text-eco-green font-semibold">{card.trend}</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* 기사 현황 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">기사 현황</h2>
            <div className="flex items-center gap-3">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1">
                  <Circle className={`w-2 h-2 fill-current ${cfg.textColor}`} />
                  <span className="text-[10px] text-gray-400">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {driverStatuses.map((driver, idx) => {
              const cfg = statusConfig[driver.status]
              return (
                <motion.button
                  key={driver.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDriver(driver.id)}
                  className="w-full bg-white rounded-xl px-4 py-3 shadow-card flex items-center justify-between hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center relative">
                      <Truck className="w-5 h-5 text-gray-500" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${cfg.color} rounded-full border-2 border-white`} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{driver.name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.textColor}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{driver.truckType} · {driver.pickups}건 수거</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{driver.todayKg}kg</p>
                      <p className="text-[10px] text-gray-400">오늘</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* 이번 주 수거 추이 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-4"
        >
          <h3 className="text-sm font-bold text-gray-800 mb-3">이번 주 수거 추이</h3>
          <div className="flex items-end gap-1.5 h-24">
            {[
              { day: '월', kg: 1100 },
              { day: '화', kg: 980 },
              { day: '수', kg: 1350 },
              { day: '목', kg: 1200 },
              { day: '금', kg: 1150 },
              { day: '토', kg: 1250 },
              { day: '일', kg: 0 },
            ].map((d, i) => {
              const maxKg = 1350
              const height = d.kg > 0 ? Math.max((d.kg / maxKg) * 100, 8) : 4
              const isToday = i === new Date().getDay() - 1
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  {d.kg > 0 && (
                    <span className="text-[8px] text-gray-400">{d.kg}</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: 0.6 + i * 0.05 }}
                    className={`w-full rounded-t-md ${
                      isToday
                        ? 'bg-gradient-to-t from-eco-green to-eco-green-300'
                        : d.kg > 0
                          ? 'bg-gray-200'
                          : 'bg-gray-100'
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? 'text-eco-green' : 'text-gray-400'}`}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ── 기사별 오늘 수거내역 모달 ── */}
      <AnimatePresence>
        {selectedDriver && selectedDriverInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedDriver(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center relative">
                      <Truck className="w-5 h-5 text-gray-500" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusConfig[selectedDriverInfo.status].color} rounded-full border-2 border-white`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-gray-900">{selectedDriverInfo.name}</h2>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusConfig[selectedDriverInfo.status].bgColor} ${statusConfig[selectedDriverInfo.status].textColor}`}>
                          {statusConfig[selectedDriverInfo.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{selectedDriverInfo.truckType}</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDriver(null)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </motion.button>
                </div>

                {/* 오늘 요약 */}
                <div className="flex items-center gap-4 mt-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-eco-green">{totalWeight}kg</p>
                    <p className="text-[10px] text-gray-400">총 수거량</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-gray-900">{completedPickups.length}건</p>
                    <p className="text-[10px] text-gray-400">수거 완료</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-amber-600">{selectedPickups.filter(p => p.status !== 'completed').length}건</p>
                    <p className="text-[10px] text-gray-400">진행 중</p>
                  </div>
                </div>
              </div>

              {/* 수거내역 리스트 */}
              <div className="overflow-y-auto max-h-[55vh] px-5 py-3">
                <h3 className="text-xs font-bold text-gray-500 mb-2">오늘 수거 내역</h3>
                <div className="space-y-2">
                  {selectedPickups.map((pickup, idx) => {
                    const badge = storeTypeBadge[pickup.storeType]
                    const isCompleted = pickup.status === 'completed'
                    return (
                      <motion.div
                        key={pickup.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`bg-white rounded-xl p-3.5 border ${isCompleted ? 'border-gray-100' : 'border-eco-green/30 bg-eco-green/5'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${badge.bg}`}>
                                {badge.label}
                              </span>
                              {isCompleted ? (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {pickup.time}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-eco-green flex items-center gap-0.5">
                                  {pickup.status === 'inProgress' ? '수거 중' : '배정됨'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{pickup.cafeName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-gray-400" />
                              <span className="text-[11px] text-gray-400">{pickup.address}</span>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            {isCompleted ? (
                              <>
                                <p className="text-sm font-bold text-gray-900">{pickup.weight}kg</p>
                                <p className="text-[10px] text-gray-400">
                                  {pickup.containerType === 'box' ? '박스' : '봉지'} {pickup.quantity}개
                                </p>
                              </>
                            ) : (
                              <div className="w-8 h-8 bg-eco-green-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-4 h-4 text-eco-green" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
