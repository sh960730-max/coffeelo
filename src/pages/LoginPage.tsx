import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Phone, Lock, ArrowRight, Leaf, Truck, Store, Building2, X, MessageCircle, ExternalLink } from 'lucide-react'
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
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpTab, setHelpTab] = useState<'id' | 'pw'>('id')

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
    <div className="min-h-screen bg-gradient-to-b from-eco-green to-eco-green-800 flex flex-col items-center justify-between px-6">
      {/* 상단 여백 확보용 빈 공간 */}
      <div />

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

        <div className="flex items-center justify-between mt-4 px-1">
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="text-white/60 text-sm font-medium"
          >
            계정이 없으신가요? <span className="text-white underline">회원가입</span>
          </button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <button
              type="button"
              onClick={() => { setHelpTab('id'); setShowHelpModal(true) }}
              className="hover:text-white/70 transition-colors underline"
            >
              아이디 찾기
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => { setHelpTab('pw'); setShowHelpModal(true) }}
              className="hover:text-white/70 transition-colors underline"
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </motion.form>

      {/* 아이디/비밀번호 찾기 모달 */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-10"
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">계정 찾기</h2>
                <button onClick={() => setShowHelpModal(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 탭 */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
                <button
                  onClick={() => setHelpTab('id')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${helpTab === 'id' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                >
                  아이디 찾기
                </button>
                <button
                  onClick={() => setHelpTab('pw')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${helpTab === 'pw' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                >
                  비밀번호 찾기
                </button>
              </div>

              {helpTab === 'id' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-blue-700 mb-1">💡 아이디 안내</p>
                    <p className="text-xs text-blue-600 leading-relaxed">
                      커피로의 아이디는 <span className="font-bold">가입 시 등록한 전화번호</span>입니다.<br />
                      전화번호가 기억나지 않으시면 아래 채널로 문의해 주세요.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => window.open('http://pf.kakao.com/_xeSxdMX', '_blank')}
                      className="w-full flex items-center gap-3 p-3.5 bg-yellow-50 rounded-2xl"
                    >
                      <MessageCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-gray-800">카카오톡 문의</p>
                        <p className="text-xs text-gray-400">@커피로 채널 · 평일 09:00~18:00</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { window.location.href = 'tel:0269252927' }}
                      className="w-full flex items-center gap-3 p-3.5 bg-blue-50 rounded-2xl"
                    >
                      <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-gray-800">전화 문의</p>
                        <p className="text-xs text-gray-400">02-6925-2927 · 평일 09:00~18:00</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-amber-700 mb-1">🔑 비밀번호 초기화</p>
                    <p className="text-xs text-amber-600 leading-relaxed">
                      비밀번호를 잊으셨나요? 아래 채널로 문의하시면<br />
                      <span className="font-bold">관리자가 비밀번호를 초기화</span>해 드립니다.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => window.open('http://pf.kakao.com/_xeSxdMX', '_blank')}
                      className="w-full flex items-center gap-3 p-3.5 bg-yellow-50 rounded-2xl"
                    >
                      <MessageCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-gray-800">카카오톡 문의</p>
                        <p className="text-xs text-gray-400">@커피로 채널 · 평일 09:00~18:00</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { window.location.href = 'tel:0269252927' }}
                      className="w-full flex items-center gap-3 p-3.5 bg-blue-50 rounded-2xl"
                    >
                      <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-gray-800">전화 문의</p>
                        <p className="text-xs text-gray-400">02-6925-2927 · 평일 09:00~18:00</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 사업자 정보 푸터 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm mt-10 mb-6 border-t border-white/10 pt-5"
      >
        <p className="text-[11px] text-white/40 font-semibold mb-2.5 tracking-wide">사업자 정보</p>
        <div className="space-y-1.5 text-[11px] text-white/35 leading-relaxed">
          <div className="flex gap-2">
            <span className="text-white/25 flex-shrink-0">상호명</span>
            <span className="text-white/50 font-medium">주식회사 스마트에코시스</span>
          </div>
          <div className="flex gap-2">
            <span className="text-white/25 flex-shrink-0">대표자</span>
            <span className="text-white/50">유승훈</span>
          </div>
          <div className="flex gap-2">
            <span className="text-white/25 flex-shrink-0 whitespace-nowrap">사업자등록번호</span>
            <span className="text-white/50">602-88-03704</span>
          </div>
          <div className="flex gap-2">
            <span className="text-white/25 flex-shrink-0">주소</span>
            <span className="text-white/50">서울시 서초구 논현로83 삼호물산 A빌딩 817호</span>
          </div>
          <div className="flex gap-2">
            <span className="text-white/25 flex-shrink-0">고객센터</span>
            <span className="text-white/50">02-6925-2927</span>
          </div>
        </div>
        <p className="text-[10px] text-white/20 mt-3 text-center">
          Copyright © 주식회사 스마트에코시스. All rights reserved.
        </p>
      </motion.footer>
    </div>
  )
}
