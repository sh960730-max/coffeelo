import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Package, Wallet, MoreHorizontal } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { icon: LayoutDashboard, label: '대시보드', path: '/company' },
  { icon: Users, label: '기사관리', path: '/company/drivers' },
  { icon: Package, label: '수거현황', path: '/company/pickups', isCenter: true },
  { icon: Wallet, label: '정산', path: '/company/settlements' },
  { icon: MoreHorizontal, label: '더보기', path: '/company/more' },
]

export default function CompanyBottomNavRouter() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100">
      <div className="max-w-md mx-auto flex items-end justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.path === '/company'
            ? location.pathname === '/company'
            : location.pathname.startsWith(item.path)

          if (item.isCenter) {
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-eco-green to-coffee-brown rounded-2xl flex items-center justify-center shadow-button">
                  <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-semibold text-eco-green mt-1">{item.label}</span>
              </motion.button>
            )
          }

          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center py-1 min-w-[3.5rem]"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isActive ? 'text-eco-green' : 'text-gray-400'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {isActive && (
                  <motion.div
                    layoutId="companyNavDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-eco-green rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-1 transition-colors duration-200 ${
                isActive ? 'text-eco-green font-semibold' : 'text-gray-400 font-medium'
              }`}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
