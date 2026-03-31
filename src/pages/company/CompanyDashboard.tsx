import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Scale, ClipboardList, Users, Bell,
  TrendingUp, Truck, Circle, ChevronRight, Package,
  MapPin, Clock, X, Store, Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface DriverStatus {
  id: string
  name: string
  truckType: string
  status: 'online' | 'collecting' | 'offline'
  todayKg: number
  pickups: number
}

const statusConfig = {
  online: { label: '온라인', color: 'bg-emerald-400', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  collecting: { label: '수거중', color: 'bg-amber-400', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  offline: { label: '오프라인', color: 'bg-gray-300', textColor: 'text-gray-500', bgColor: 'bg-gray-100' },
}

const summaryCardsBase = (weight: number, count: number) => [
  { label: '총 수거량', value: weight > 0 ? `${weight.toLocaleString()}kg` : '0kg', icon: Scale, color: 'text-eco-green', bg: 'bg-eco-green-100', trend: '' },
  { label: '수거 건수', value: `${count}건`, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', trend: '' },
]

/* ── 미배정 수거요청 더미 데이터 ── */
interface UnassignedRequest {
  id: string
  cafeName: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  requestedAt: string
  desiredTime: string
  containerCount: number
  estimatedKg: number
}

const unassignedRequests: UnassignedRequest[] = [
  { id: 'u1', cafeName: '스타벅스 신촌점', storeType: 'starbucks', address: '서대문구 신촌로 25', requestedAt: '09:10', desiredTime: '13:00 - 15:00', containerCount: 4, estimatedKg: 36 },
  { id: 'u2', cafeName: '커피나무 홍대점', storeType: 'individual', address: '마포구 홍대입구로 33', requestedAt: '09:42', desiredTime: '14:00 - 16:00', containerCount: 2, estimatedKg: 18 },
  { id: 'u3', cafeName: '이디야 마포점', storeType: 'franchise', address: '마포구 마포대로 120', requestedAt: '10:05', desiredTime: '15:00 - 17:00', containerCount: 3, estimatedKg: 27 },
  { id: 'u4', cafeName: '블루보틀 합정점', storeType: 'franchise', address: '마포구 양화로 110', requestedAt: '10:33', desiredTime: '14:30 - 16:30', containerCount: 5, estimatedKg: 44 },
  { id: 'u5', cafeName: '카페 드 몽블랑', storeType: 'individual', address: '마포구 성미산로 78', requestedAt: '11:20', desiredTime: '16:00 - 18:00', containerCount: 2, estimatedKg: 15 },
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
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? '관리자'
  const [driverStatuses, setDriverStatuses] = useState<DriverStatus[]>([])
  const [unassignedList, setUnassignedList] = useState<UnassignedRequest[]>([])
  const [todayWeight, setTodayWeight] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [weeklyData, setWeeklyData] = useState([
    { day: '월', kg: 0 }, { day: '화', kg: 0 }, { day: '수', kg: 0 },
    { day: '목', kg: 0 }, { day: '금', kg: 0 }, { day: '토', kg: 0 }, { day: '일', kg: 0 },
  ])
  const pendingCount = unassignedList.length
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [showUnassigned, setShowUnassigned] = useState(false)

  useEffect(() => {
    if (!companyName || companyName === '관리자') return
    const db = supabase as any
    const load = async () => {
      // 1. 소속 기사 목록
      const { data: drivers } = await db.from('drivers').select('*').eq('company', companyName)
      if (drivers) {
        setDriverStatuses(drivers.map((d: any) => ({
          id: d.id, name: d.name, truckType: d.truck_type,
          status: d.is_online ? 'online' : 'offline', todayKg: 0, pickups: 0,
        })))
      }
      // 2. 미배정 수거 요청 (회사 소속 카페의 REQUESTED 상태)
      const { data: companyCafes } = await db.from('cafes').select('id').eq('company', companyName)
      const companyCafeIds = (companyCafes || []).map((c: any) => c.id)
      const unassignedQuery = db
        .from('pickups')
        .select('*, cafe:cafes(name, address, store_type)')
        .eq('status', 'REQUESTED')
        .order('requested_at', { ascending: false })
      const { data: unassigned } = companyCafeIds.length > 0
        ? await unassignedQuery.in('cafe_id', companyCafeIds)
        : await unassignedQuery.limit(0)
      if (unassigned) {
        setUnassignedList(unassigned.map((p: any) => ({
          id: p.id,
          cafeName: p.cafe?.name ?? '알 수 없음',
          storeType: (p.cafe?.store_type === 'STARBUCKS' ? 'starbucks' :
                      p.cafe?.store_type === 'FRANCHISE' ? 'franchise' : 'individual') as any,
          address: p.cafe?.address ?? '-',
          requestedAt: p.requested_at
            ? new Date(p.requested_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            : '-',
          desiredTime: '-',
          containerCount: p.quantity ?? 0,
          estimatedKg: p.estimated_weight ?? 0,
        })))
      }
      // 3. 오늘/이번주 수거 통계 (소속 기사 기준)
      const driverIds = (drivers || []).map((d: any) => d.id)
      if (driverIds.length > 0) {
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const todayStart = todayStr + 'T00:00:00'

        // completed_at 또는 updated_at 기준 오늘 완료 건
        const { data: todayPickups } = await db
          .from('pickups')
          .select('total_weight, driver_id, completed_at, updated_at')
          .in('driver_id', driverIds)
          .eq('status', 'COMPLETED')
          .or(`completed_at.gte.${todayStart},and(completed_at.is.null,updated_at.gte.${todayStart})`)

        if (todayPickups) {
          setTodayWeight(todayPickups.reduce((s: number, p: any) => s + (p.total_weight || 0), 0))
          setTodayCount(todayPickups.length)

          // 기사별 오늘 통계 집계
          const driverKgMap: Record<string, number> = {}
          const driverCountMap: Record<string, number> = {}
          todayPickups.forEach((p: any) => {
            if (!p.driver_id) return
            driverKgMap[p.driver_id] = (driverKgMap[p.driver_id] || 0) + (p.total_weight || 0)
            driverCountMap[p.driver_id] = (driverCountMap[p.driver_id] || 0) + 1
          })
          setDriverStatuses(prev => prev.map(d => ({
            ...d,
            todayKg: driverKgMap[d.id] || 0,
            pickups: driverCountMap[d.id] || 0,
          })))
        }

        const dow = now.getDay()
        const monday = new Date(now)
        monday.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow))
        monday.setHours(0, 0, 0, 0)
        const mondayStr = monday.toISOString()

        const { data: weekPickups } = await db
          .from('pickups')
          .select('completed_at, updated_at, total_weight')
          .in('driver_id', driverIds)
          .eq('status', 'COMPLETED')
          .or(`completed_at.gte.${mondayStr},and(completed_at.is.null,updated_at.gte.${mondayStr})`)

        if (weekPickups) {
          const days = ['월', '화', '수', '목', '금', '토', '일']
          const acc: Record<string, number> = {}
          weekPickups.forEach((p: any) => {
            const ts = p.completed_at || p.updated_at
            if (!ts) return
            const d = new Date(ts)
            const idx = d.getDay() === 0 ? 6 : d.getDay() - 1
            acc[days[idx]] = (acc[days[idx]] || 0) + (p.total_weight || 0)
          })
          setWeeklyData(days.map(d => ({ day: d, kg: acc[d] || 0 })))
        }
      }
    }
    load()
  }, [companyName])

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
            <h1 className="text-xl font-bold text-white">{companyName} 관리자</h1>
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
            <motion.button
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowUnassigned(true)}
              className="w-full bg-white/15 backdrop-blur rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-300" />
                <span className="text-sm text-white font-medium">미배정 수거 요청 {pendingCount}건</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60" />
            </motion.button>
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
          {[...summaryCardsBase(todayWeight, todayCount), { label: '활동 기사', value: `${driverStatuses.length}명`, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', trend: '' }].map((card, idx) => {
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
        {(() => {
          const weekData = weeklyData
          const todayIdx = (() => {
            const d = new Date().getDay()
            return d === 0 ? 6 : d - 1
          })()
          const maxKg = Math.max(...weekData.map(d => d.kg))
          const minKg = Math.min(...weekData.filter(d => d.kg > 0).map(d => d.kg))
          const svgW = 300
          const svgH = 90
          const padL = 6
          const padR = 6
          const padT = 14
          const padB = 4
          const step = (svgW - padL - padR) / (weekData.length - 1)

          const getY = (kg: number) =>
            kg === 0
              ? svgH - padB
              : padT + ((maxKg - kg) / (maxKg - minKg + 1)) * (svgH - padT - padB)

          const points = weekData.map((d, i) => ({
            x: padL + i * step,
            y: getY(d.kg),
            kg: d.kg,
          }))

          // Smooth bezier path
          const pathD = points.reduce((acc, pt, i) => {
            if (i === 0) return `M ${pt.x},${pt.y}`
            const prev = points[i - 1]
            const cpX = (prev.x + pt.x) / 2
            return `${acc} C ${cpX},${prev.y} ${cpX},${pt.y} ${pt.x},${pt.y}`
          }, '')

          // Area fill path
          const areaD = `${pathD} L ${points[points.length - 1].x},${svgH - padB} L ${points[0].x},${svgH - padB} Z`

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">이번 주 수거 추이</h3>
                <span className="text-[10px] text-gray-400">단위: kg</span>
              </div>

              {/* 라인 그래프 SVG */}
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* 가로 가이드라인 */}
                {[0, 0.33, 0.66, 1].map((ratio, i) => {
                  const y = padT + ratio * (svgH - padT - padB)
                  return (
                    <line
                      key={i}
                      x1={padL} y1={y} x2={svgW - padR} y2={y}
                      stroke="#f0f0f0" strokeWidth="1"
                    />
                  )
                })}

                {/* 영역 채우기 */}
                <path d={areaD} fill="url(#areaGrad)" />

                {/* 라인 */}
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                />

                {/* 데이터 포인트 & 값 레이블 */}
                {points.map((pt, i) => {
                  const d = weekData[i]
                  const isToday = i === todayIdx
                  const isActive = d.kg > 0
                  return (
                    <g key={i}>
                      {isActive && (
                        <>
                          {/* 오늘 강조 원 */}
                          {isToday && (
                            <circle
                              cx={pt.x} cy={pt.y} r="7"
                              fill="#22c55e" fillOpacity="0.15"
                            />
                          )}
                          <circle
                            cx={pt.x} cy={pt.y} r={isToday ? 4 : 3}
                            fill={isToday ? '#22c55e' : '#fff'}
                            stroke="#22c55e"
                            strokeWidth={isToday ? 0 : 2}
                          />
                          {/* kg 값 */}
                          <text
                            x={pt.x} y={pt.y - 8}
                            textAnchor="middle"
                            fontSize="8"
                            fill={isToday ? '#22c55e' : '#aaa'}
                            fontWeight={isToday ? 'bold' : 'normal'}
                          >
                            {d.kg >= 1000 ? `${(d.kg / 1000).toFixed(1)}t` : `${d.kg}`}
                          </text>
                        </>
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* 요일 레이블 */}
              <div className="flex justify-between mt-1 px-0.5">
                {weekData.map((d, i) => {
                  const isToday = i === todayIdx
                  return (
                    <span
                      key={d.day}
                      className={`text-[10px] font-medium flex-1 text-center ${isToday ? 'text-eco-green font-bold' : 'text-gray-400'}`}
                    >
                      {d.day}
                    </span>
                  )
                })}
              </div>

              {/* 주간 합계 */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">주간 총 수거량</span>
                <span className="text-sm font-bold text-eco-green">
                  {weekData.reduce((s, d) => s + d.kg, 0).toLocaleString()}kg
                </span>
              </div>
            </motion.div>
          )
        })()}
      </div>

      {/* ── 미배정 수거요청 바텀시트 ── */}
      <AnimatePresence>
        {showUnassigned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowUnassigned(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">미배정 수거 요청</h2>
                      <p className="text-xs text-gray-400">기사 미배정 · {unassignedList.length}건 대기 중</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowUnassigned(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </motion.button>
                </div>
              </div>

              {/* 목록 */}
              <div className="overflow-y-auto max-h-[70vh] px-5 py-3 space-y-2.5">
                {unassignedList.map((req, idx) => {
                  const badge = storeTypeBadge[req.storeType]
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white border border-amber-100 rounded-2xl p-4"
                    >
                      {/* 상단: 매장명 + 요청시각 */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <p className="text-sm font-bold text-gray-900">{req.cafeName}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 shrink-0 ml-2">
                          <Clock className="w-2.5 h-2.5" />
                          {req.requestedAt} 요청
                        </span>
                      </div>

                      {/* 주소 */}
                      <div className="flex items-center gap-1 mb-2.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-[11px] text-gray-500">{req.address}</span>
                      </div>

                      {/* 하단: 희망수거시간 + 수량/무게 */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-blue-50 rounded-lg px-2.5 py-1.5 flex-1">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          <span className="text-[11px] text-blue-600 font-medium">{req.desiredTime}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <Store className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] text-gray-600">{req.containerCount}박스</span>
                        </div>
                        <div className="bg-eco-green-100 rounded-lg px-2.5 py-1.5">
                          <span className="text-[11px] text-eco-green font-semibold">~{req.estimatedKg}kg</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                <div className="h-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
