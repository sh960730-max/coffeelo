import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Package, Scale, Clock, MessageSquare,
  CheckCircle2, ChevronDown, Camera, Image, MapPin
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

type ContainerType = 'BOX' | 'BAG'

/* ── 시간 옵션 (00시 ~ 24시, 1시간 단위) ── */
const hours = Array.from({ length: 25 }, (_, i) => i) // 0~24

const weightPresets = [5, 10, 15, 20, 25]

export default function PickupRequestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const cafeId = (user as any)?.id
  const [containerType, setContainerType] = useState<ContainerType>('BOX')
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState<string>('10')
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(12)
  const [memo, setMemo] = useState('')
  const [storagePhoto, setStoragePhoto] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setStoragePhoto(url)
  }
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const containerOptions: { key: ContainerType; label: string; icon: string }[] = [
    { key: 'BOX', label: '박스', icon: '📦' },
    { key: 'BAG', label: '봉지', icon: '🛍️' },
  ]

  const formatHour = (h: number) => {
    if (h === 0) return '00:00'
    if (h === 24) return '24:00'
    return `${String(h).padStart(2, '0')}:00`
  }

  /* 보관장소 사진 촬영 시뮬레이션 */
  const takeStoragePhoto = () => {
    setStoragePhoto('storage_photo.jpg')
  }

  const handleSubmit = async () => {
    if (!cafeId) return
    setIsSubmitting(true)

    const db = supabase as any
    const { error } = await db.from('pickups').insert({
      cafe_id: cafeId,
      status: 'REQUESTED',
      container_type: containerType,
      quantity: quantity,
      estimated_weight: parseFloat(weight) || 0,
      pickup_time_start: formatHour(startHour),
      pickup_time_end: formatHour(endHour),
      note: memo || null,
    })

    setIsSubmitting(false)

    if (error) {
      alert('수거 신청에 실패했습니다.\n' + error.message)
      return
    }

    setShowSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/cafe')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900 pointer-events-none">수거 신청</h1>
        </div>
      </motion.header>

      <div className="px-5 py-4 space-y-4">
        {/* 형태 선택 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-eco-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-eco-green" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">형태</h3>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 transition-colors focus:border-eco-green"
            >
              <div className="flex items-center gap-2">
                <span>{containerOptions.find(c => c.key === containerType)?.icon}</span>
                <span className="text-sm font-medium text-gray-800">
                  {containerOptions.find(c => c.key === containerType)?.label}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden"
                >
                  {containerOptions.map(option => (
                    <button
                      key={option.key}
                      onClick={() => { setContainerType(option.key); setShowDropdown(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        containerType === option.key ? 'bg-eco-green-100' : ''
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span className={`text-sm font-medium ${
                        containerType === option.key ? 'text-eco-green' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 수량 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">수량</h3>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              -
            </motion.button>
            <div className="flex-1 text-center">
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-2xl font-bold text-gray-900 bg-transparent outline-none"
              />
              <p className="text-[11px] text-gray-400 -mt-1">
                {containerType === 'BOX' ? '박스' : '봉지'}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="w-10 h-10 bg-eco-green-100 rounded-xl flex items-center justify-center text-lg font-bold text-eco-green hover:bg-eco-green-200 transition-colors"
            >
              +
            </motion.button>
          </div>
        </motion.div>

        {/* 예상 무게 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">예상 무게</h3>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <input
              type="number"
              min={1}
              max={999}
              value={weight}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || /^\d+$/.test(val)) setWeight(val)
              }}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-eco-green transition-colors"
            />
            <span className="text-sm font-bold text-gray-500">kg</span>
          </div>

          <div className="flex items-center gap-2">
            {weightPresets.map(w => (
              <motion.button
                key={w}
                whileTap={{ scale: 0.9 }}
                onClick={() => setWeight(String(w))}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  weight === String(w)
                    ? 'bg-eco-green text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {w}kg
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 희망 수거 시간 (00시 ~ 24시) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">희망 수거 시간</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* 시작 시간 */}
            <div className="flex-1">
              <label className="text-[11px] text-gray-400 font-medium mb-1 block">시작</label>
              <select
                value={startHour}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setStartHour(val)
                  if (val >= endHour) setEndHour(Math.min(24, val + 1))
                }}
                className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-eco-green transition-colors appearance-none cursor-pointer"
              >
                {hours.filter(h => h < 24).map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>

            <span className="text-gray-400 font-bold mt-5">~</span>

            {/* 종료 시간 */}
            <div className="flex-1">
              <label className="text-[11px] text-gray-400 font-medium mb-1 block">종료</label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(parseInt(e.target.value))}
                className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-eco-green transition-colors appearance-none cursor-pointer"
              >
                {hours.filter(h => h > startHour).map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 빠른 선택 버튼 */}
          <div className="flex items-center gap-1.5 mt-3">
            {[
              { label: '오전', start: 9, end: 12 },
              { label: '오후', start: 13, end: 18 },
              { label: '저녁', start: 18, end: 22 },
              { label: '종일', start: 0, end: 24 },
            ].map(preset => {
              const isActive = startHour === preset.start && endHour === preset.end
              return (
                <motion.button
                  key={preset.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setStartHour(preset.start); setEndHour(preset.end) }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* 보관장소 사진 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">보관장소 사진</h3>
            <span className="text-[10px] text-gray-400">(선택)</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-3 ml-10">
            수거 기사님이 쉽게 찾을 수 있도록 보관 위치를 촬영해 주세요
          </p>

          {storagePhoto ? (
            <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-teal-100/50 to-eco-green/10 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-10 h-10 text-teal-500 mx-auto" />
                  <p className="text-sm text-teal-600 font-semibold mt-2">사진 등록 완료</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCameraClick}
                className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 rounded-lg text-[11px] font-semibold text-gray-600 shadow-sm"
              >
                재촬영
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCameraClick}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-teal-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium">탭하여 보관장소 촬영</span>
            </motion.button>

          )}

          {/* 카메라 input (hidden) - 항상 마운트 */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </motion.div>

        {/* 메모 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">메모</h3>
            <span className="text-[10px] text-gray-400">(선택)</span>
          </div>

          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="수거 시 참고사항을 입력해 주세요. (예: 뒷문으로 와주세요)"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-eco-green transition-colors resize-none"
          />
        </motion.div>

        {/* 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-eco-green/5 to-coffee-brown/5 rounded-2xl p-5 border border-eco-green/10"
        >
          <h3 className="text-sm font-bold text-gray-800 mb-3">신청 요약</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">형태</span>
              <span className="text-xs font-semibold text-gray-800">
                {containerType === 'BOX' ? '박스' : '봉지'} {quantity}개
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">예상 무게</span>
              <span className="text-xs font-semibold text-gray-800">{weight}kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">희망 시간</span>
              <span className="text-xs font-semibold text-gray-800">
                {formatHour(startHour)} ~ {formatHour(endHour)}
              </span>
            </div>
            {storagePhoto && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">보관장소 사진</span>
                <span className="text-xs font-semibold text-teal-600">등록 완료</span>
              </div>
            )}
            {memo && (
              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-500">메모</span>
                <span className="text-xs text-gray-600 text-right max-w-[60%]">{memo}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 신청 버튼 */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-eco-green to-eco-green-600 text-white text-base font-bold rounded-2xl shadow-button hover:shadow-button-hover transition-shadow disabled:opacity-60 disabled:cursor-not-allowed mb-8"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
            />
          ) : (
            '신청하기'
          )}
        </motion.button>
      </div>

      {/* 성공 모달 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
                className="w-20 h-20 bg-eco-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-eco-green" />
              </motion.div>

              <h2 className="text-xl font-bold text-gray-900 mt-5">신청 완료!</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                수거 신청이 접수되었습니다.<br />
                기사님 배정 후 알림을 드릴게요.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">예상 수거 시간</span>
                  <span className="font-semibold text-eco-green">
                    {formatHour(startHour)} ~ {formatHour(endHour)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-400">예상 무게</span>
                  <span className="font-semibold text-gray-800">{weight}kg</span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowSuccess(false); navigate('/cafe') }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl"
                >
                  홈으로
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowSuccess(false); navigate('/cafe/history') }}
                  className="flex-1 py-3 bg-eco-green text-white text-sm font-semibold rounded-xl"
                >
                  수거내역 보기
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
