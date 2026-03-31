import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, XCircle, Coffee, LogOut } from 'lucide-react'
import CafeBottomNavRouter from '../../components/cafe/CafeBottomNavRouter'
import { useAuth } from '../../contexts/AuthContext'

function PendingApprovalScreen() {
  const { logout } = useAuth()
  const { user } = useAuth()
  const companyName = (user as any)?.company
  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-green to-eco-green-800 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">승인 대기 중</h1>
        <p className="text-white/70 text-sm leading-relaxed mb-2">
          가입 신청이 접수되었습니다.
        </p>
        <p className="text-white/70 text-sm leading-relaxed">
          {companyName
            ? <>{companyName} 담당자가 승인하면<br />앱을 이용할 수 있습니다.</>
            : <>담당 회사 관리자가 승인하면<br />앱을 이용할 수 있습니다.</>
          }
        </p>
        <div className="mt-8 bg-white/10 rounded-2xl p-4 text-left">
          <div className="flex items-start gap-3">
            <Coffee className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
            <p className="text-white/60 text-xs leading-relaxed">
              승인은 보통 1~2 영업일 내에 처리됩니다.<br />
              문의사항은 담당 회사 관리자에게 연락해주세요.
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-6 flex items-center gap-2 text-white/50 text-sm mx-auto"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </motion.div>
    </div>
  )
}

function RejectedScreen() {
  const { logout } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-900 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">가입 거부</h1>
        <p className="text-white/70 text-sm leading-relaxed">
          가입 신청이 거부되었습니다.<br />
          담당 회사 관리자에게 문의해주세요.
        </p>
        <button
          onClick={logout}
          className="mt-8 flex items-center gap-2 text-white/50 text-sm mx-auto"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </motion.div>
    </div>
  )
}

export default function CafeLayout() {
  const { user } = useAuth()
  const cafeStatus = (user as any)?.status

  if (cafeStatus === 'PENDING') return <PendingApprovalScreen />
  if (cafeStatus === 'REJECTED') return <RejectedScreen />

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <main className="pb-20">
        <Outlet />
      </main>
      <CafeBottomNavRouter />
    </div>
  )
}
