import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Scale, ChevronDown, ChevronUp, CheckCircle,
  Calendar, TrendingUp, Truck, Loader2, CreditCard
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: '대기',    color: 'bg-amber-50 text-amber-600',       icon: Calendar },
  CONFIRMED: { label: '확정',    color: 'bg-blue-50 text-blue-600',         icon: CheckCircle },
  PAID:      { label: '지급완료', color: 'bg-eco-green-100 text-eco-green',  icon: CreditCard },
  pending:   { label: '대기',    color: 'bg-amber-50 text-amber-600',       icon: Calendar },
  confirmed: { label: '확정',    color: 'bg-blue-50 text-blue-600',         icon: CheckCircle },
  paid:      { label: '지급완료', color: 'bg-eco-green-100 text-eco-green',  icon: CreditCard },
}

export default function SettlementManagePage() {
  const { user } = useAuth()
  const companyName = (user as any)?.name ?? ''

  const [settlements, setSettlements] = useState<any[]>([])
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

    // 소속 기사 목록
    const { data: drivers } = await db.from('drivers').select('id, name').eq('company', companyName)
    if (!drivers || drivers.length === 0) { setSettlements([]); setLoading(false); return }

    const driverMap: Record<string, string> = {}
    drivers.forEach((d: any) => { driverMap[d.id] = d.name })
    const driverIds = drivers.map((d: any) => d.id)

    // settlements 테이블 조회
    const { data: settlementsData } = await db.from('settlements')
      .select('*')
      .in('driver_id', driverIds)
      .order('period_start', { ascending: false })

    if (settlementsData && settlementsData.length > 0) {
      setSettlements(settlementsData.map((s: any) => ({
        ...s,
        driverName: driverMap[s.driver_id] || '알 수 없음',
      })))
      setLoading(false)
      return
    }

    // settlements 없으면 이번달 pickups에서 기사별 집계
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data: pickups } = await db.from('pickups')
      .select('driver_id, total_weight, settlement_amount, completed_at')
      .in('driver_id', driverIds)
      .eq('status', 'COMPLETED')
      .gte('completed_at', firstOfMonth)

    if (pickups) {
      const agg: Record<string, { kg: number; amount: number }> = {}
      pickups.forEach((p: any) => {
        if (!agg[p.driver_id]) agg[p.driver_id] = { kg: 0, amount: 0 }
        agg[p.driver_id].kg += p.total_weight || 0
        agg[p.driver_id].amount += p.settlement_amount || 0
      })
      const nowDate = now
      const firstDay = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)
      const periodStr = `${firstDay.getMonth() + 1}/1 ~ ${nowDate.getMonth() + 1}/${nowDate.getDate()}`
      const synth = Object.entries(agg).map(([driverId, v]) => ({
        id: `synth_${driverId}`,
        driver_id: driverId,
        driverName: driverMap[driverId] || '알 수 없음',
        period_start: firstDay.toISOString(),
        period_end: nowDate.toISOString(),
        periodStr,
        total_weight: v.kg,
        rate_per_kg: 80,
        gross_amount: v.amount || Math.round(v.kg * 80),
        status: 'PENDING',
      }))
      setSettlements(synth)
    }
    setLoading(false)
  }

  useEffect(() => { fetchSettlements() }, [companyName])

  const updateStatus = async (settlementId: string, newStatus: string) => {
    setUpdating(settlementId)
    const db = supabase as any

    // synth_ 레코드: DB에 settlement 행 새로 생성 후 상태 저장
    if (settlementId.startsWith('synth_')) {
      const synth = settlements.find(s => s.id === settlementId)
      if (!synth) { setUpdating(null); return }

      const insertPayload: any = {
        driver_id: synth.driver_id,
        period_start: synth.period_start,
        period_end: synth.period_end,
        total_weight: synth.total_weight,
        rate_per_kg: synth.rate_per_kg || 80,
        gross_amount: synth.gross_amount,
        status: newStatus,
      }

      const { data: inserted, error } = await db
        .from('settlements')
        .insert(insertPayload)
        .select()
        .single()

      if (error) {
        console.error('settlements insert error:', error)
        // 컬럼 에러 시 최소 필드만으로 재시도
        const { error: err2 } = await db.from('settlements').insert({
          driver_id: synth.driver_id,
          period_start: synth.period_start,
          total_weight: synth.total_weight,
          gross_amount: synth.gross_amount,
          status: newStatus,
        })
        if (err2) {
          console.error('settlements insert retry error:', err2)
          showToast('저장 실패: ' + (err2.message || '알 수 없는 오류'), 'error')
          setUpdating(null)
          return
        }
      }

      if (inserted || !error) {
        showToast('정산완료 처리되었습니다', 'success')
        await fetchSettlements()
      }
      setUpdating(null)
      return
    }

    // 실제 DB 레코드 업데이트
    const { error } = await db
      .from('settlements')
      .update({ status: newStatus })
      .eq('id', settlementId)

    if (error) {
      console.error('settlements update error:', error)
      showToast('업데이트 실패: ' + (error.message || '알 수 없는 오류'), 'error')
    } else {
      showToast('정산완료 처리되었습니다', 'success')
    }
    await fetchSettlements()
    setUpdating(null)
  }

  const monthlyTotal = settlements.reduce((s, d) => s + (d.gross_amount || 0), 0)
  const monthlyKg = settlements.reduce((s, d) => s + (d.total_weight || 0), 0)
  const pendingCount = settlements.filter(d => d.status === 'PENDING' || d.status === 'pending').length
  const confirmedCount = settlements.filter(d => d.status === 'CONFIRMED' || d.status === 'confirmed').length

  return (
    <div>
      {/* 토스트 알림 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-semibold text-white ${
              toast.type === 'success' ? 'bg-eco-green' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle className="w-4 h-4" />
              : <span className="w-4 h-4 text-center font-bold">!</span>
            }
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
            {/* 요약 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-eco-green to-eco-green-700 rounded-2xl p-5 shadow-card mb-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">이번 달 정산 현황</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{monthlyTotal.toLocaleString()}원</p>
              <p className="text-xs text-white/60 mt-0.5">총 {monthlyKg.toLocaleString()}kg</p>
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

            {/* 기사별 정산 */}
            <h2 className="text-sm font-bold text-gray-800 mb-3">기사별 정산</h2>
            {settlements.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-2" />
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
                  const period = ds.periodStr || `${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${endDate.getMonth() + 1}/${endDate.getDate()}`
                  const isUpdating = updating === ds.id
                  const statusUpper = (ds.status || '').toUpperCase()

                  return (
                    <motion.div key={ds.id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.06 }}
                      className="bg-white rounded-2xl shadow-card overflow-hidden"
                    >
                      <button onClick={() => setExpandedId(isExpanded ? null : ds.id)} className="w-full p-4 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Truck className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-800">{ds.driverName}</p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${cfg.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {cfg.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">{period}</span>
                                <span className="text-gray-200">·</span>
                                <span className="text-[11px] text-gray-500">{(ds.total_weight || 0).toLocaleString()}kg</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
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
                              {ds.paid_at && (
                                <p className="text-[11px] text-eco-green mb-2">
                                  지급일: {new Date(ds.paid_at).toLocaleDateString('ko-KR')}
                                </p>
                              )}

                              {/* 액션 버튼: 대기 상태일 때만 정산완료 버튼 표시 */}
                              {(statusUpper === 'PENDING' || ds.id.startsWith('synth_')) && (
                                <motion.button whileTap={{ scale: 0.97 }}
                                  disabled={isUpdating}
                                  onClick={() => updateStatus(ds.id, 'CONFIRMED')}
                                  className="w-full mt-3 bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                  정산완료
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* 월간 합계 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-6 bg-white rounded-2xl p-4 shadow-card mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-eco-green" />
                <h3 className="text-sm font-bold text-gray-800">월간 합계</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">총 정산 금액</p>
                  <p className="text-xl font-bold text-gray-900">{monthlyTotal.toLocaleString()}원</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">총 수거량</p>
                  <p className="text-base font-bold text-eco-green">{monthlyKg.toLocaleString()}kg</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                <span>기사 {settlements.length}명</span>
                <span>단가 80원/kg</span>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
