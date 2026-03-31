import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Scale, Truck, ArrowRight, Camera } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function DriverWeighStation() {
  const { user } = useAuth()
  const driverId = (user as any)?.id

  const [lastWeigh, setLastWeigh] = useState<{
    loadedWeight: number
    emptyWeight: number
    netWeight: number
    time: string
  } | null>(null)

  useEffect(() => {
    if (!driverId) return
    const db = supabase as any
    db.from('weigh_ins').select('*')
      .eq('driver_id', driverId)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setLastWeigh({
            loadedWeight: data.loaded_weight ?? 0,
            emptyWeight: data.empty_weight ?? 0,
            netWeight: data.net_weight ?? 0,
            time: new Date(data.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          })
        }
      })
  }, [driverId])

  if (!lastWeigh) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="px-5 mt-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">집하장 계량</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card text-center">
          <Scale className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">오늘 집하장 계량 내역이 없습니다</p>
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
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-coffee-brown/10 rounded-xl flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6 text-coffee-brown" />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">적재 무게</p>
            <p className="text-lg font-bold text-gray-900">{lastWeigh.loadedWeight.toLocaleString()}<span className="text-xs font-normal text-gray-500">kg</span></p>
          </div>
          <div className="flex flex-col items-center px-1">
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <p className="text-[9px] text-gray-400 mt-0.5">하차</p>
          </div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">공차 무게</p>
            <p className="text-lg font-bold text-gray-900">{lastWeigh.emptyWeight.toLocaleString()}<span className="text-xs font-normal text-gray-500">kg</span></p>
          </div>
          <div className="flex flex-col items-center px-1">
            <span className="text-gray-300 font-bold">=</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-eco-green-100 rounded-xl flex items-center justify-center mx-auto">
              <Scale className="w-6 h-6 text-eco-green" />
            </div>
            <p className="text-[10px] text-eco-green font-medium mt-2">순수 무게</p>
            <p className="text-lg font-bold text-eco-green">{lastWeigh.netWeight.toLocaleString()}<span className="text-xs font-normal text-eco-green/70">kg</span></p>
          </div>
        </div>

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
