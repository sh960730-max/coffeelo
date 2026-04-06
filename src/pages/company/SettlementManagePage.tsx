import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale, ChevronDown, ChevronUp, CheckCircle,
  Calendar, TrendingUp, Truck, Loader2, CreditCard,
  Trees, Target, MapPin, BarChart3, Circle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const MONTHLY_TARGET_KG = 300 // 기사 1인당 월 목표 수거량(kg)
const CO2_PER_KG = 0.5        // 커피박 1kg 당 CO2 절감(kg)
const TREE_CO2_MONTHLY = 1.83 // 나무 1그루 월 CO2 흡수량(kg)

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: '대기',    color: 'bg-amber-50 text-amber-600',      icon: Calendar },
  CONFIRMED: { label: '확정',    color: 'bg-blue-50 text-blue-600',        icon: CheckCircle },
  PAID:      { label: '지급완료', color: 'bg-eco-green-100 text-eco-green', icon: CreditCard },
  pending:   { label: '대기',    color: 'bg-amber-50 text-amber-600',      icon: Calendar },
  confirmed: { label: '확정',    color: 'bg-blue-50 text-blue-600',        icon: CheckCircle },
  paid:      { label: '지급완료', color: 'bg-eco-green-100 text-eco-green', icon: CreditCard },
}

const driverStatusBadge = (isOnline: boolean | null) =>
  isOnline
    ? { label: '운행중', cls: 'bg-green-100 text-green-600' }
    : { label: '퇴근',   cls: 'bg-gray-100 text-gray-400' }

export default function SettlementManagePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const companyName = (user as any)?.name ?? ''

  const [settlements, setSettlements] = useState<any[]>([])
  const [driverStats, setDriverStats] = useState<Record<string, { visitCount: number; totalAssigned: number; isOnline: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const fetchSettlements = async () => {
    if (!companyName) return
    setLoading(true)
    const db = supabase as any

    // 소속 기사 목록 + 온라인 상태
    const { data: drivers } = await db.from('drivers').select('id, name, is_online').eq('company', companyName)
    if (!drivers || drivers.length === 0) { setSettlements([]); setLoading(false); return }

    const driverMap: Record<string, string> = {}
    const onlineMap: Record<string, boolean> = {}
    drivers.forEach((d: any) => {
      driverMap[d.id] = d.name
      onlineMap[d.id] = d.is_online ?? false
    })
    const driverIds = drivers.map((d: any) => d.id)

    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // 이번달 전체 픽업 (배정+완료) → 방문완료율 계산
    const { data: allPickups } = await db.from('pickups')
      .select('driver_id, status, total_weight, settlement_amount, completed_at')
      .in('driver_id', driverIds)
      .gte('created_at', firstOfMonth)

    const statsMap: Record<string, { visitCount: number; totalAssigned: number; isOnline: boolean }> = {}
    driverIds.forEach((id: string) => {
      statsMap[id] = { visitCount: 0, totalAssigned: 0, isOnline: onlineMap[id] }
    })
    ;(allPickups || []).forEach((p: any) => {
      if (!p.driver_id) return
      statsMap[p.driver_id].totalAssigned++
      if (p.status === 'COMPLETED') statsMap[p.driver_id].visitCount++
    })
    setDriverStats(statsMap)

    // settlements 테이블 조회
    const { data: settlementsData } = await db.from('settlements')
      .select('*')
      .in('driver_id', driverIds)
      .gte('period_start', firstOfMonth)
      .order('period_start', { ascending: false })

    const settledDriverIds = new Set((settlementsData || []).map((s: any) => s.driver_id))

    // 미정산 기사 → pickups 집계
    const completedPickups = (allPickups || []).filter((p: any) => p.status === 'COMPLETED')
    const agg: Record<string, { kg: number; amount: number }> = {}
    completedPickups.forEach((p: any) => {
      if (!p.driver_id || settledDriverIds.has(p.driver_id)) return
      if (!agg[p.driver_id]) agg[p.driver_id] = { kg: 0, amount: 0 }
      agg[p.driver_id].kg += p.total_weight || 0
      agg[p.driver_id].amount += p.settlement_amount || 0
    })

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodStr = `${firstDay.getMonth() + 1}/1 ~ ${now.getMonth() + 1}/${now.getDate()}`
    const synthList = Object.entries(agg).map(([driverId, v]) => ({
      id: `synth_${driverId}`,
      driver_id: driverId,
      driverName: driverMap[driverId] || '알 수 없음',
      period_start: firstDay.toISOString(),
      period_end: now.toISOString(),
      periodStr,
      total_weight: v.kg,
      rate_per_kg: 80,
      gross_amount: v.amount || Math.round(v.kg * 80),
      status: 'PENDING',
    }))

    const realList = (settlementsData || []).map((s: any) => ({
      ...s,
      driverName: driverMap[s.driver_id] || '알 수 없음',
    }))
    setSettlements([...realList, ...synthList])
    setLoading(false)
  }

  useEffect(() => { fetchSettlements() }, [companyName])

  const updateStatus = async (settlementId: string, newStatus: string) => {
    setUpdating(settlementId)
    const db = supabase as any

    if (settlementId.startsWith('synth_')) {
      const synth = settlements.find(s => s.id === settlementId)
      if (!synth) { setUpdating(null); return }
      const { error } = await db.from('settlements').insert({
        driver_id: synth.driver_id,
        period_start: synth.period_start,
        period_end: synth.period_end,
        total_weight: synth.total_weight,
        rate_per_kg: synth.rate_per_kg || 80,
        gross_amount: synth.gross_amount,
        status: newStatus,
      })
      if (error) {
        showToast('저장 실패: ' + (error.message || '알 수 없는 오류'), 'error')
      } else {
        showToast('실적이 확정되었습니다')
        await fetchSettlements()
      }
      setUpdating(null)
      return
    }

    const { error } = await db.from('settlements').update({ status: newStatus }).eq('id', settlementId)
    if (error) {
      showToast('업데이트 실패: ' + (error.message || '알 수 없는 오류'), 'error')
    } else {
      showToast('실적이 확정되었습니다')
    }
    await fetchSettlements()
    setUpdating(null)
  }

  const monthlyKg    = settlements.reduce((s, d) => s + (d.total_weight || 0), 0)
  const monthlyTotal = settlements.reduce((s, d) => s + (d.gross_amount || 0), 0)
  const pendingCount   = settlements.filter(d => ['PENDING','pending'].includes(d.status)).length
  const confirmedCount = settlements.filter(d => ['CONFIRMED','confirmed'].includes(d.status)).length

  const displayKg   = monthlyKg >= 1000 ? `${(monthlyKg / 1000).toFixed(2)}ton` : `${monthlyKg.toLocaleString()}kg`
  const co2Saved    = monthlyKg * CO2_PER_KG
  const treesEquiv  = Math.round(co2Saved / TREE_CO2_MONTHLY)

  return (
    <div>
      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-semibold text-white ${
              toast.type === 'success' ? 'bg-eco-green' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <span className="font-bold">!</span>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">정산 관리</h1>
      </header>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : (
          <>
            {/* ── 상단 요약 카드: 전체 수거 퍼포먼스 ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card mb-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">전체 수거 퍼포먼스</span>
              </div>
              <p className="text-3xl font-bold text-white mt-1">{displayKg}</p>
              <p className="text-xs text-white/60 mt-0.5">
                수거 가치 환산 금액 <span className="text-white font-semibold">{monthlyTotal.toLocaleString()}원</span>
              </p>
              <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{pendingCount}</p>
                  <p className="text-[10px] text-white/60">대기</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{confirmedCount}</p>
                  <p className="text-[10px] text-white/60">확정</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{settlements.length}</p>
                  <p className="text-[10px] text-white/60">전체</p>
                </div>
              </div>
            </motion.div>

            {/* ── 기사별 정산 ── */}
            <h2 className="text-sm font-bold text-gray-800 mb-3">기사별 정산</h2>
            {settlements.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">정산 내역이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {settlements.map((ds, idx) => {
                  const cfg = statusConfig[ds.status] || statusConfig.PENDING
                  const StatusIcon = cfg.icon
                  const isExpanded = expandedId === ds.id
                  const startDate = new Date(ds.period_start)
                  const endDate = new Date(ds.period_end)
                  const period = ds.periodStr || `${startDate.getMonth()+1}/${startDate.getDate()} ~ ${endDate.getMonth()+1}/${endDate.getDate()}`
                  const isUpdating = updating === ds.id
                  const statusUpper = (ds.status || '').toUpperCase()

                  const stat = driverStats[ds.driver_id]
                  const dsBadge = driverStatusBadge(stat?.isOnline ?? false)
                  const goalPct = MONTHLY_TARGET_KG > 0
                    ? Math.min(100, Math.round(((ds.total_weight || 0) / MONTHLY_TARGET_KG) * 100))
                    : 0
                  const visitRate = stat && stat.totalAssigned > 0
                    ? Math.round((stat.visitCount / stat.totalAssigned) * 100)
                    : 0

                  return (
                    <motion.div key={ds.id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.06 }}
                      className="bg-white rounded-2xl shadow-card overflow-hidden"
                    >
                      <button onClick={() => setExpandedId(isExpanded ? null : ds.id)} className="w-full p-4 text-left">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Truck className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="min-w-0">
                              {/* 이름 + 정산상태 + 운행상태 */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-gray-800">{ds.driverName}</p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${cfg.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {cfg.label}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${dsBadge.cls}`}>
                                  <Circle className="w-2 h-2 fill-current" />
                                  {dsBadge.label}
                                </span>
                              </div>
                              {/* 기간 + 수거량 */}
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">{period}</span>
                                <span className="text-gray-200">·</span>
                                <span className="text-[11px] text-gray-500">{(ds.total_weight || 0).toLocaleString()}kg</span>
                              </div>
                              {/* 목표달성률 + 방문완료율 */}
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1">
                                  <Target className="w-3 h-3 text-amber-500" />
                                  <span className="text-[11px] font-semibold text-amber-600">목표 {goalPct}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3 text-blue-400" />
                                  <span className="text-[11px] font-semibold text-blue-500">방문완료 {visitRate}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <p className="text-sm font-bold text-gray-900">{(ds.gross_amount || 0).toLocaleString()}원</p>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            <div className="p-4 pt-3">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-semibold text-gray-500">정산 정보</span>
                                <span className="text-[11px] text-gray-400">{ds.rate_per_kg || 80}원/kg</span>
                              </div>

                              {/* 수거량 / 금액 */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-gray-50 rounded-lg p-2.5">
                                  <p className="text-[9px] text-gray-400">총 수거량</p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Scale className="w-3 h-3 text-gray-400" />
                                    <p className="text-sm font-bold text-gray-700">{(ds.total_weight || 0).toLocaleString()}kg</p>
                                  </div>
                                </div>
                                <div className="bg-eco-green-100 rounded-lg p-2.5">
                                  <p className="text-[9px] text-eco-green">정산 금액</p>
                                  <p className="text-sm font-bold text-eco-green mt-0.5">{(ds.gross_amount || 0).toLocaleString()}원</p>
                                </div>
                              </div>

                              {/* 목표 달성 프로그레스바 */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> 목표 달성률 (월 {MONTHLY_TARGET_KG}kg 기준)
                                  </span>
                                  <span className={`text-[11px] font-bold ${goalPct >= 100 ? 'text-eco-green' : goalPct >= 60 ? 'text-amber-500' : 'text-red-400'}`}>
                                    {goalPct}%
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${goalPct}%` }}
                                    transition={{ duration: 0.6 }}
                                    className={`h-full rounded-full ${goalPct >= 100 ? 'bg-eco-green' : goalPct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                                  />
                                </div>
                              </div>

                              {/* 방문 완료율 */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" /> 매장 방문 완료율
                                  </span>
                                  <span className="text-[11px] font-bold text-blue-500">
                                    {stat?.visitCount ?? 0}/{stat?.totalAssigned ?? 0}건 ({visitRate}%)
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${visitRate}%` }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="h-full rounded-full bg-blue-400"
                                  />
                                </div>
                              </div>

                              {ds.paid_at && (
                                <p className="text-[11px] text-eco-green mb-3">
                                  지급일: {new Date(ds.paid_at).toLocaleDateString('ko-KR')}
                                </p>
                              )}

                              {/* 액션 버튼 */}
                              <div className="flex gap-2 mt-1">
                                <motion.button whileTap={{ scale: 0.97 }}
                                  onClick={() => navigate('/company/drivers')}
                                  className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  상세 경로 보기
                                </motion.button>

                                {(statusUpper === 'PENDING' || ds.id.startsWith('synth_')) && (
                                  <motion.button whileTap={{ scale: 0.97 }}
                                    disabled={isUpdating}
                                    onClick={() => updateStatus(ds.id, 'CONFIRMED')}
                                    className="flex-1 bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  >
                                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                    실적 확정
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* ── 월간 합계 + ESG ── */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-eco-green" />
                <h3 className="text-sm font-bold text-gray-800">월간 합계</h3>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">총 정산 금액</p>
                  <p className="text-xl font-bold text-gray-900">{monthlyTotal.toLocaleString()}원</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">총 수거량</p>
                  <p className="text-base font-bold text-eco-green">{monthlyKg.toLocaleString()}kg</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400 mb-3">
                <span>기사 {settlements.length}명</span>
                <span>단가 80원/kg</span>
              </div>

              {/* ESG: 탄소 절감 */}
              <div className="bg-gradient-to-r from-green-50 to-eco-green/10 rounded-xl p-3 border border-eco-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <Trees className="w-4 h-4 text-eco-green" />
                  <span className="text-xs font-bold text-eco-green">ESG · 탄소 배출 절감 성과</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400">이번 달 CO₂ 절감량</p>
                    <p className="text-lg font-bold text-eco-green">{co2Saved.toFixed(1)}kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">나무 흡수 환산</p>
                    <div className="flex items-center gap-1 justify-end">
                      <Trees className="w-3.5 h-3.5 text-eco-green" />
                      <p className="text-base font-bold text-eco-green">{treesEquiv}그루 효과</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5">
                  * 커피박 1kg = CO₂ {CO2_PER_KG}kg 절감 기준, 나무 1그루 월 {TREE_CO2_MONTHLY}kg CO₂ 흡수 환산
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
