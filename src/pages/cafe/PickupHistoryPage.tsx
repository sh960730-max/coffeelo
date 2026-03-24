import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, ChevronDown, ChevronUp, Package, Scale,
  Clock, CheckCircle2, XCircle, Truck, Coffee
} from 'lucide-react'

interface CafePickupRecord {
  id: string
  date: string
  containerType: 'BOX' | 'BAG'
  quantity: number
  estimatedWeight: number
  actualWeight: number | null
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  driverName: string | null
  timeSlot: string
  settlementAmount: number | null
  completedAt: string | null
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  REQUESTED: { label: '접수됨', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  ASSIGNED: { label: '기사 배정', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Truck },
  IN_PROGRESS: { label: '수거 중', color: 'text-eco-green', bgColor: 'bg-eco-green-100', icon: Truck },
  COMPLETED: { label: '완료', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle2 },
  CANCELLED: { label: '취소', color: 'text-red-500', bgColor: 'bg-red-50', icon: XCircle },
}

const dateFilters = [
  { key: 'today', label: '오늘' },
  { key: 'week', label: '이번 주' },
  { key: 'month', label: '이번 달' },
  { key: 'all', label: '전체' },
]

// 더미 데이터 - 카페 관점의 수거 신청 내역
const dummyCafePickups: CafePickupRecord[] = [
  {
    id: 'cp1', date: '2026-03-24T09:30:00Z', containerType: 'BOX', quantity: 3,
    estimatedWeight: 15, actualWeight: null, status: 'ASSIGNED',
    driverName: '박민수', timeSlot: '오전 10:30 ~ 12:00', settlementAmount: null, completedAt: null,
  },
  {
    id: 'cp2', date: '2026-03-23T14:00:00Z', containerType: 'BOX', quantity: 2,
    estimatedWeight: 10, actualWeight: 12, status: 'COMPLETED',
    driverName: '박민수', timeSlot: '오후 13:00 ~ 14:30', settlementAmount: 960, completedAt: '2026-03-23T14:45:00Z',
  },
  {
    id: 'cp3', date: '2026-03-22T10:00:00Z', containerType: 'BAG', quantity: 5,
    estimatedWeight: 20, actualWeight: 18, status: 'COMPLETED',
    driverName: '이기사', timeSlot: '오전 09:00 ~ 10:30', settlementAmount: 1440, completedAt: '2026-03-22T10:20:00Z',
  },
  {
    id: 'cp4', date: '2026-03-21T11:00:00Z', containerType: 'BOX', quantity: 4,
    estimatedWeight: 25, actualWeight: 23, status: 'COMPLETED',
    driverName: '박민수', timeSlot: '오전 10:30 ~ 12:00', settlementAmount: 1840, completedAt: '2026-03-21T11:30:00Z',
  },
  {
    id: 'cp5', date: '2026-03-20T15:00:00Z', containerType: 'BAG', quantity: 2,
    estimatedWeight: 8, actualWeight: null, status: 'CANCELLED',
    driverName: null, timeSlot: '오후 14:30 ~ 16:00', settlementAmount: null, completedAt: null,
  },
  {
    id: 'cp6', date: '2026-03-19T09:00:00Z', containerType: 'BOX', quantity: 3,
    estimatedWeight: 15, actualWeight: 16, status: 'COMPLETED',
    driverName: '이기사', timeSlot: '오전 09:00 ~ 10:30', settlementAmount: 1280, completedAt: '2026-03-19T09:40:00Z',
  },
  {
    id: 'cp7', date: '2026-03-18T13:00:00Z', containerType: 'BOX', quantity: 2,
    estimatedWeight: 10, actualWeight: 11, status: 'COMPLETED',
    driverName: '박민수', timeSlot: '오후 13:00 ~ 14:30', settlementAmount: 880, completedAt: '2026-03-18T13:35:00Z',
  },
]

export default function PickupHistoryPage() {
  const [dateFilter, setDateFilter] = useState('month')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = dummyCafePickups // In production, filter by date range

  // 요약 통계
  const completedPickups = filtered.filter(p => p.status === 'COMPLETED')
  const totalWeight = completedPickups.reduce((s, p) => s + (p.actualWeight || 0), 0)
  const totalSettlement = completedPickups.reduce((s, p) => s + (p.settlementAmount || 0), 0)

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">수거 내역</h1>

        {/* 날짜 필터 */}
        <div className="flex items-center gap-2 mt-3">
          {dateFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === f.key
                  ? 'bg-eco-green text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            기간선택
          </button>
        </div>
      </header>

      <div className="px-5 py-4">
        {/* 요약 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2.5 mb-5"
        >
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <div className="w-9 h-9 bg-eco-green-100 rounded-lg flex items-center justify-center mx-auto">
              <Package className="w-4.5 h-4.5 text-eco-green" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">{completedPickups.length}건</p>
            <p className="text-[10px] text-gray-400">수거 완료</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mx-auto">
              <Scale className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">{totalWeight}kg</p>
            <p className="text-[10px] text-gray-400">총 수거량</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mx-auto">
              <Coffee className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">{(totalSettlement / 10000).toFixed(1)}만</p>
            <p className="text-[10px] text-gray-400">절감 금액</p>
          </div>
        </motion.div>

        {/* 리스트 */}
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map((pickup, index) => {
              const isExpanded = expandedId === pickup.id
              const config = statusConfig[pickup.status]
              const StatusIcon = config.icon
              const date = new Date(pickup.date)
              const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
              const dayNames = ['일', '월', '화', '수', '목', '금', '토']
              const dayStr = dayNames[date.getDay()]

              return (
                <motion.div
                  key={pickup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : pickup.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                          <StatusIcon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-[10px] text-gray-400">{dateStr} ({dayStr})</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-1">
                            {pickup.containerType === 'BOX' ? '박스' : '봉지'} {pickup.quantity}개
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{pickup.timeSlot}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {pickup.actualWeight ? (
                          <p className="text-sm font-bold text-eco-green">{pickup.actualWeight}kg</p>
                        ) : (
                          <p className="text-sm font-medium text-gray-400">~{pickup.estimatedWeight}kg</p>
                        )}
                        {pickup.settlementAmount && (
                          <p className="text-[10px] text-amber-600 font-semibold">
                            {pickup.settlementAmount.toLocaleString()}원 절감
                          </p>
                        )}
                        <div className="mt-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-300 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-300 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                      >
                        <div className="px-4 py-3 space-y-2">
                          <div className="flex items-center justify-between py-1.5">
                            <span className="text-xs text-gray-500">형태</span>
                            <span className="text-xs font-semibold text-gray-700">
                              {pickup.containerType === 'BOX' ? '박스' : '봉지'} {pickup.quantity}개
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                            <span className="text-xs text-gray-500">예상 무게</span>
                            <span className="text-xs text-gray-600">{pickup.estimatedWeight}kg</span>
                          </div>
                          {pickup.actualWeight && (
                            <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                              <span className="text-xs text-gray-500">실제 무게</span>
                              <span className="text-xs font-bold text-eco-green">{pickup.actualWeight}kg</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                            <span className="text-xs text-gray-500">수거 기사</span>
                            <span className="text-xs text-gray-700">{pickup.driverName || '미배정'}</span>
                          </div>
                          {pickup.settlementAmount && (
                            <div className="flex items-center justify-between py-1.5 border-t border-gray-50">
                              <span className="text-xs text-gray-500">폐기물 처리비 절감</span>
                              <span className="text-xs font-bold text-amber-600">
                                {pickup.settlementAmount.toLocaleString()}원
                              </span>
                            </div>
                          )}
                          {pickup.completedAt && (
                            <div className="pt-2 border-t border-gray-100">
                              <span className="text-[11px] text-eco-green">
                                완료: {new Date(pickup.completedAt).toLocaleString('ko-KR', {
                                  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Coffee className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-400 mt-3">수거 내역이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
