import { motion } from 'framer-motion'
import { Coffee, ArrowRight } from 'lucide-react'

export default function PickupRequestButton() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="px-5 mt-6"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full relative overflow-hidden rounded-2xl p-6 shadow-button hover:shadow-button-hover transition-shadow duration-300"
      >
        {/* 그라데이션 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-eco-green via-eco-green-600 to-coffee-brown" />

        {/* 장식 원형 */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full"
        />

        {/* 콘텐츠 */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white/70 text-xs font-medium">커피박이 쌓였나요?</p>
              <p className="text-white text-lg font-bold mt-0.5">수거 신청하기</p>
            </div>
          </div>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        {/* 하단 안내 */}
        <div className="relative mt-4 pt-3 border-t border-white/15">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-xs">평균 수거 소요시간</p>
            <p className="text-white text-sm font-semibold">약 2시간</p>
          </div>
        </div>
      </motion.button>
    </motion.section>
  )
}
