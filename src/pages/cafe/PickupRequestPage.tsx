import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Package, Scale, Clock, MessageSquare,
  CheckCircle2, ChevronDown, Coffee
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ContainerType = 'BOX' | 'BAG'
type TimeSlot = 'AM_1' | 'AM_2' | 'PM_1' | 'PM_2'

const timeSlots: { key: TimeSlot; label: string; time: string }[] = [
  { key: 'AM_1', label: '오전 1', time: '09:00 ~ 10:30' },
  { key: 'AM_2', label: '오전 2', time: '10:30 ~ 12:00' },
  { key: 'PM_1', label: '오후 1', time: '13:00 ~ 14:30' },
  { key: 'PM_2', label: '오후 2', time: '14:30 ~ 16:00' },
]

const weightPresets = [5, 10, 15, 20, 25]

export default function PickupRequestPage() {
  const navigate = useNavigate()
  const [containerType, setContainerType] = useState<ContainerType>('BOX')
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState(10)
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('AM_1')
  const [memo, setMemo] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const containerOptions: { key: ContainerType; label: string; icon: string }[] = [
    { key: 'BOX', label: '박스', icon: '📦' },
    { key: 'BAG', label: '봉지', icon: '🛍️' },
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Dummy submission - Supabase integration later
    console.log('수거 신청 데이터:', {
      containerType,
      quantity,
      estimatedWeight: weight,
      timeSlot,
      memo,
      requestedAt: new Date().toISOString(),
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSubmitting(false)
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
          <h1 className="text-lg font-bold text-gray-900">수거 신청</h1>
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
              onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-eco-green transition-colors"
            />
            <span className="text-sm font-bold text-gray-500">kg</span>
          </div>

          <div className="flex items-center gap-2">
            {weightPresets.map(w => (
              <motion.button
                key={w}
                whileTap={{ scale: 0.9 }}
                onClick={() => setWeight(w)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  weight === w
                    ? 'bg-eco-green text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {w}kg
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 희망 수거 시간 */}
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

          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(slot => (
              <motion.button
                key={slot.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTimeSlot(slot.key)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  timeSlot === slot.key
                    ? 'border-eco-green bg-eco-green-100'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <p className={`text-xs font-bold ${
                  timeSlot === slot.key ? 'text-eco-green' : 'text-gray-700'
                }`}>
                  {slot.label}
                </p>
                <p className={`text-[11px] mt-0.5 ${
                  timeSlot === slot.key ? 'text-eco-green/70' : 'text-gray-400'
                }`}>
                  {slot.time}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 메모 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
          transition={{ delay: 0.3 }}
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
                {timeSlots.find(s => s.key === timeSlot)?.time}
              </span>
            </div>
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
          transition={{ delay: 0.35 }}
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
                    {timeSlots.find(s => s.key === timeSlot)?.time}
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
