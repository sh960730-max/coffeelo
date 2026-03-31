import { motion } from 'framer-motion'
import { Bell, Leaf } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user } = useAuth()
  const cafeName = (user as any)?.name ?? '사장님'

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-eco-green to-coffee-brown rounded-xl flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-eco-green tracking-tight">커피로</h1>
            <p className="text-[10px] text-coffee-brown/60 font-medium -mt-0.5 tracking-wider">COFFEE LO</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </motion.button>
      </div>

      {/* 인사말 */}
      <div className="px-5 pb-4">
        <p className="text-gray-500 text-sm">안녕하세요, <span className="font-semibold text-gray-700">{cafeName}</span></p>
        <p className="text-gray-900 text-base font-semibold mt-0.5">
          오늘도 환경을 위한 한 걸음 함께해요
        </p>
      </div>
    </motion.header>
  )
}
