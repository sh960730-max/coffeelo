import { motion } from 'framer-motion'
import { Scale, Truck, ArrowDown, ArrowRight, Camera } from 'lucide-react'

export default function DriverWeighStation() {
  // 더미 데이터 - 오늘 마지막 계량 결과
  const lastWeigh = {
    loadedWeight: 2850, // kg 적재 시 차량 무게
    emptyWeight: 1600,  // kg 공차 무게
    netWeight: 1250,    // kg 순수 커피박 무게
    time: '오전 11:32',
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="px-5 mt-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">집하장 계량</h2>
        <span className="text-xs text-gray-500">최근 {lastWeigh.time}</span>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-card">
        {/* 계량 플로우 시각화 */}
        <div className="flex items-center justify-between">
          {/* 적재 무게 */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-coffee-brown/10 rounded-xl flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6 text-coffee-brown" />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">적재 무게</p>
            <p className="text-lg font-bold text-gray-900">{lastWeigh.loadedWeight.toLocaleString()}<span className="text-xs font-normal text-gray-500">kg</span></p>
          </div>

          {/* 화살표 */}
          <div className="flex flex-col items-center px-1">
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <p className="text-[9px] text-gray-400 mt-0.5">하차</p>
          </div>

          {/* 공차 무게 */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">공차 무게</p>
            <p className="text-lg font-bold text-gray-900">{lastWeigh.emptyWeight.toLocaleString()}<span className="text-xs font-normal text-gray-500">kg</span></p>
          </div>

          {/* 등호 */}
          <div className="flex flex-col items-center px-1">
            <span className="text-gray-300 font-bold">=</span>
          </div>

          {/* 순수 무게 */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-eco-green-100 rounded-xl flex items-center justify-center mx-auto">
              <Scale className="w-6 h-6 text-eco-green" />
            </div>
            <p className="text-[10px] text-eco-green font-medium mt-2">순수 무게</p>
            <p className="text-lg font-bold text-eco-green">{lastWeigh.netWeight.toLocaleString()}<span className="text-xs font-normal text-eco-green/70">kg</span></p>
          </div>
        </div>

        {/* 매장별 예상 vs 실측 비교 */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">매장별 예상 합계</span>
            <span className="text-xs font-semibold text-gray-700">1,280 kg</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">실측 무게</span>
            <span className="text-xs font-semibold text-eco-green">{lastWeigh.netWeight.toLocaleString()} kg</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">오차율</span>
            <span className="text-xs font-semibold text-amber-500">-2.3%</span>
          </div>
        </div>

        {/* 계량 사진 등록 버튼 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-eco-green/10 text-eco-green rounded-xl text-sm font-semibold border border-eco-green/20"
        >
          <Camera className="w-4 h-4" />
          계량 사진 등록
        </motion.button>
      </div>
    </motion.section>
  )
}
