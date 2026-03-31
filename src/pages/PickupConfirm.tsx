import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Camera, Scale, Plus, Trash2, Package,
  ChevronDown, ChevronUp, Check, Image, MapPin, Loader2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

/* ── 타입 ── */
interface ContainerItem {
  id: number
  type: 'box' | 'bag'
  weight: string
  photoUrl: string | null
  photoFile: File | null
}

interface StoreData {
  name: string
  storeType: 'starbucks' | 'franchise' | 'individual'
  address: string
  containerType: 'box' | 'bag'
}

const defaultStore: StoreData = {
  name: '알 수 없는 매장',
  storeType: 'individual',
  address: '',
  containerType: 'box',
}

const storeTypeStyle = {
  starbucks: { label: '스벅', bg: 'bg-green-600' },
  franchise: { label: '프랜차이즈', bg: 'bg-orange-500' },
  individual: { label: '개인카페', bg: 'bg-purple-500' },
}

const mapStoreType = (type: string): 'starbucks' | 'franchise' | 'individual' => {
  if (type === 'STARBUCKS') return 'starbucks'
  if (type === 'FRANCHISE') return 'franchise'
  return 'individual'
}

export default function PickupConfirm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const driverId = (user as any)?.id

  const [storeInfo, setStoreInfo] = useState<StoreData>(defaultStore)
  const [loading, setLoading] = useState(true)
  const [containers, setContainers] = useState<ContainerItem[]>([
    { id: 1, type: 'box', weight: '', photoUrl: null, photoFile: null },
  ])
  const [overallPhoto, setOverallPhoto] = useState<string | null>(null)
  const [overallPhotoFile, setOverallPhotoFile] = useState<File | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(1)
  const [showComplete, setShowComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const containerPhotoRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const overallPhotoRef = useRef<HTMLInputElement | null>(null)

  /* 수거 정보 로드 */
  useEffect(() => {
    if (!id) return
    const db = supabase as any
    db.from('pickups')
      .select('*, cafe:cafes(name, address, store_type)')
      .eq('id', id)
      .single()
      .then(({ data }: any) => {
        if (data) {
          const cafe = data.cafe
          const rawType = cafe?.store_type || 'INDIVIDUAL'
          const containerType: 'box' | 'bag' =
            (data.container_type || 'BOX').toUpperCase() === 'BOX' ? 'box' : 'bag'
          const qty = data.quantity || 1
          setStoreInfo({
            name: cafe?.name ?? '알 수 없는 매장',
            storeType: mapStoreType(rawType),
            address: cafe?.address ?? '',
            containerType,
          })
          setContainers(
            Array.from({ length: qty }, (_, i) => ({
              id: i + 1,
              type: containerType,
              weight: '',
              photoUrl: null,
              photoFile: null,
            }))
          )
          setExpandedId(1)
        }
        setLoading(false)
      })
  }, [id])

  const addContainer = () => {
    const newId = Math.max(...containers.map(c => c.id), 0) + 1
    setContainers([...containers, { id: newId, type: storeInfo.containerType, weight: '', photoUrl: null, photoFile: null }])
    setExpandedId(newId)
  }

  const removeContainer = (cid: number) => {
    if (containers.length <= 1) return
    setContainers(containers.filter(c => c.id !== cid))
    if (expandedId === cid) setExpandedId(null)
  }

  const updateWeight = (cid: number, weight: string) => {
    if (weight === '' || /^\d*\.?\d*$/.test(weight)) {
      setContainers(containers.map(c => c.id === cid ? { ...c, weight } : c))
    }
  }

  const handleContainerPhoto = (cid: number, file: File) => {
    const url = URL.createObjectURL(file)
    setContainers(containers.map(c => c.id === cid ? { ...c, photoUrl: url, photoFile: file } : c))
  }

  const handleOverallPhoto = (file: File) => {
    setOverallPhoto(URL.createObjectURL(file))
    setOverallPhotoFile(file)
  }

  const totalWeight = containers.reduce((sum, c) => {
    const w = parseFloat(c.weight)
    return sum + (isNaN(w) ? 0 : w)
  }, 0)

  const allFilled = containers.every(c => c.weight && parseFloat(c.weight) > 0) && overallPhoto
  const filledCount = containers.filter(c => c.weight && parseFloat(c.weight) > 0).length
  const containerLabel = storeInfo.containerType === 'box' ? '박스' : '봉지'
  const typeInfo = storeTypeStyle[storeInfo.storeType]

  /* 수거 확인 완료 저장 */
  const handleComplete = async () => {
    if (!allFilled || !id) return
    setSubmitting(true)
    const db = supabase as any

    // 픽업 상태 업데이트
    await db.from('pickups').update({
      status: 'COMPLETED',
      driver_id: driverId,
      total_weight: totalWeight,
      completed_at: new Date().toISOString(),
      settlement_amount: Math.round(totalWeight * 80),
    }).eq('id', id)

    // 컨테이너 저장
    for (const c of containers) {
      await db.from('containers').insert({
        pickup_id: id,
        type: c.type === 'box' ? 'BOX' : 'BAG',
        weight: parseFloat(c.weight) || 0,
      })
    }

    setSubmitting(false)
    setShowComplete(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-eco-green animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      {/* ── 헤더 ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="flex items-center px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/driver')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          <h1 className="flex-1 text-center text-base font-bold text-gray-900 -ml-10 pointer-events-none">수거 확인</h1>
        </div>
      </motion.header>

      <main className="px-5 pt-4 pb-36">
        {/* ── 매장 정보 카드 ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${typeInfo.bg}`}>
              {typeInfo.label}
            </span>
            <span className="text-xs text-gray-400">도착 완료</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">{storeInfo.name}</h2>
          {storeInfo.address && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{storeInfo.address}</span>
            </div>
          )}
        </motion.div>

        {/* ── 박스/봉지별 무게 측정 ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">{containerLabel}별 무게 측정</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                휴대용 저울로 {containerLabel}마다 개별 측정해 주세요
              </p>
            </div>
            <div className="flex items-center gap-1 bg-eco-green-100 px-2.5 py-1 rounded-lg">
              <Scale className="w-3.5 h-3.5 text-eco-green" />
              <span className="text-xs font-bold text-eco-green">{filledCount}/{containers.length}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence>
              {containers.map((container, index) => {
                const isExpanded = expandedId === container.id
                const hasWeight = container.weight && parseFloat(container.weight) > 0
                const hasPhoto = !!container.photoUrl

                return (
                  <motion.div
                    key={container.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-2xl shadow-card overflow-hidden border-l-4 transition-colors duration-300 ${
                      hasWeight && hasPhoto ? 'border-l-eco-green' : hasWeight ? 'border-l-amber-400' : 'border-l-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : container.id)}
                      className="w-full flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasWeight && hasPhoto ? 'bg-eco-green-100' : 'bg-gray-100'}`}>
                          {hasWeight && hasPhoto
                            ? <Check className="w-5 h-5 text-eco-green" />
                            : <Package className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900">{containerLabel} #{index + 1}</p>
                          {hasWeight
                            ? <p className="text-xs text-eco-green font-semibold">{container.weight} kg{hasPhoto && ' · 사진 완료'}</p>
                            : <p className="text-xs text-gray-400">무게를 입력해 주세요</p>
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {containers.length > 1 && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); removeContainer(container.id) }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </motion.button>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="px-4 pb-4"
                        >
                          <div className="border-t border-gray-100 pt-4">
                            <label className="block mb-1">
                              <span className="text-xs font-semibold text-gray-700">측정 무게 (kg)</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                inputMode="decimal"
                                placeholder="0.0"
                                value={container.weight}
                                onChange={(e) => updateWeight(container.id, e.target.value)}
                                className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-lg font-bold text-gray-900 placeholder-gray-300 border border-gray-200 focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 outline-none transition-all"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">kg</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              {[10, 15, 20, 25, 30].map(w => (
                                <motion.button
                                  key={w}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateWeight(container.id, String(w))}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    container.weight === String(w) ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {w}kg
                                </motion.button>
                              ))}
                            </div>

                            {/* 박스 사진 */}
                            <div className="mt-4">
                              <span className="text-xs font-semibold text-gray-700 mb-1.5 block">{containerLabel} 사진</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                ref={el => { containerPhotoRefs.current[container.id] = el }}
                                onChange={e => { if (e.target.files?.[0]) handleContainerPhoto(container.id, e.target.files[0]) }}
                              />
                              {container.photoUrl ? (
                                <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden">
                                  <img src={container.photoUrl} className="w-full h-full object-cover" />
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => containerPhotoRefs.current[container.id]?.click()}
                                    className="absolute bottom-2 right-2 px-2.5 py-1 bg-white/90 rounded-lg text-[10px] font-semibold text-gray-600 shadow-sm"
                                  >
                                    재촬영
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.button
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => containerPhotoRefs.current[container.id]?.click()}
                                  className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-gray-50"
                                >
                                  <Camera className="w-6 h-6 text-gray-400" />
                                  <span className="text-xs text-gray-400 font-medium">탭하여 촬영</span>
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
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={addContainer}
            className="w-full mt-2.5 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl bg-white"
          >
            <Plus className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-500">{containerLabel} 추가</span>
          </motion.button>
        </motion.div>

        {/* ── 전체 현장 사진 ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5"
        >
          <h3 className="text-base font-bold text-gray-900 mb-2">수거 현장 사진</h3>
          <p className="text-[11px] text-gray-500 mb-3">
            수거한 전체 {containerLabel}를 한 장에 촬영해 주세요 (크로스체크용)
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={overallPhotoRef}
            onChange={e => { if (e.target.files?.[0]) handleOverallPhoto(e.target.files[0]) }}
          />
          {overallPhoto ? (
            <div className="relative w-full h-44 bg-gray-100 rounded-2xl overflow-hidden shadow-card">
              <img src={overallPhoto} className="w-full h-full object-cover" />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => overallPhotoRef.current?.click()}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-semibold text-gray-600 shadow-sm"
              >
                재촬영
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => overallPhotoRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white shadow-card"
            >
              <div className="w-12 h-12 bg-eco-green-100 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-eco-green" />
              </div>
              <span className="text-sm text-gray-500 font-medium">전체 현장 사진 촬영</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── 수거 요약 ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 bg-white rounded-2xl p-4 shadow-card"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-3">수거 요약</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{containerLabel} 수량</span>
              <span className="text-sm font-bold text-gray-900">{containers.length}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">총 무게</span>
              <span className="text-sm font-bold text-eco-green">{totalWeight.toFixed(1)} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">평균 {containerLabel} 무게</span>
              <span className="text-sm font-semibold text-gray-700">
                {containers.length > 0 ? (totalWeight / containers.length).toFixed(1) : '0.0'} kg
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">예상 정산액</span>
                <span className="text-sm font-bold text-amber-600">
                  {(totalWeight * 80).toLocaleString()}원
                  <span className="text-[10px] font-normal text-gray-400 ml-1">(@80원/kg)</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── 하단 확인 버튼 ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-gray-500">
              {filledCount}개 측정 완료 · {overallPhoto ? '현장사진 완료' : '현장사진 필요'}
            </span>
            <span className="text-[11px] font-bold text-eco-green">{totalWeight.toFixed(1)} kg</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-eco-green to-eco-green-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((filledCount + (overallPhoto ? 1 : 0)) / (containers.length + 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <motion.button
            whileHover={allFilled ? { scale: 1.01 } : {}}
            whileTap={allFilled ? { scale: 0.98 } : {}}
            onClick={handleComplete}
            disabled={!allFilled || submitting}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              allFilled ? 'bg-gradient-to-r from-eco-green to-eco-green-600 text-white shadow-button' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            수거 확인 완료
          </motion.button>
        </div>
      </div>

      {/* ── 완료 모달 ── */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                className="w-16 h-16 bg-eco-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <Check className="w-8 h-8 text-eco-green" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mt-4">수거 확인 완료!</h3>
              <p className="text-sm text-gray-500 mt-2">
                {storeInfo.name}에서<br/>
                <span className="font-bold text-eco-green">{containers.length}개 {containerLabel}</span> ·
                <span className="font-bold text-eco-green"> {totalWeight.toFixed(1)}kg</span> 수거
              </p>
              <div className="bg-gray-50 rounded-xl p-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">예상 정산액</span>
                  <span className="text-base font-bold text-amber-600">{(totalWeight * 80).toLocaleString()}원</span>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/driver')}
                  className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600"
                >
                  목록으로
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/driver')}
                  className="flex-1 py-3 bg-eco-green rounded-xl text-sm font-semibold text-white"
                >
                  다음 매장
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
