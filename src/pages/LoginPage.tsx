import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Coffee, Phone, Lock, ArrowRight, Leaf, Truck, Store, Building2 } from 'lucide-react'
import { useAuth, type UserRole } from '../contexts/AuthContext'

const roles: { key: UserRole; label: string; icon: typeof Truck; desc: string }[] = [
  { key: 'driver', label: '기사', icon: Truck, desc: '수거 기사' },
  { key: 'cafe', label: '점주', icon: Store, desc: '카페 점주' },
  { key: 'company', label: '관리자', icon: Building2, desc: '소속회사' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(phone, password, selectedRole)
    if (result.error) {
      setError(result.error)
      console.error('Login error:', result.error)
    } else {
      const routeMap: Record<UserRole, string> = {
        driver: '/driver',
        cafe: '/cafe',
        company: '/company',
      }
      navigate(routeMap[selectedRole])
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-green to-eco-green-800 flex flex-col items-center justify-center px-6">
      {/* 로고 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Coffee className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">커피로</h1>
        <p className="text-sm text-white/60 mt-1">Coffee LO</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Leaf className="w-3.5 h-3.5 text-green-300" />
          <span className="text-xs text-green-300 font-medium">커피찌꺼기를 가치있게</span>
        </div>
      </motion.div>

      {/* 역할 선택 탭 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm flex items-center gap-2 mb-5"
      >
        {roles.map((r) => {
          const Icon = r.icon
          const isActive = selectedRole === r.key
          return (
            <motion.button
              key={r.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRole(r.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all duration-300 ${
                isActive
                  ? 'bg-white/20 border-white/40'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/40'}`} />
              <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-white/40'}`}>
                {r.label}
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* 로그인 폼 */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm"
      >
        <div className="space-y-3">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="tel"
              placeholder="전화번호"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50 transition-colors"
            />
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-300 text-xs mt-3 text-center"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full mt-5 py-4 bg-white text-eco-green rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-button disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-eco-green/30 border-t-eco-green rounded-full animate-spin" />
          ) : (
            <>
              {selectedRole === 'driver' ? '기사' : selectedRole === 'cafe' ? '점주' : '관리자'} 로그인
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <p className="text-center text-white/40 text-xs mt-4">
          계정이 없으신가요? 소속 회사에 문의해 주세요.
        </p>
      </motion.form>
    </div>
  )
}
