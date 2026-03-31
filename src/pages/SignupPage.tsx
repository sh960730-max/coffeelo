import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Phone, Lock, User, ArrowRight, ArrowLeft, Leaf, Truck, Store, Building2, MapPin, ChevronDown, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { UserRole } from '../contexts/AuthContext'

const roles: { key: UserRole; label: string; icon: typeof Truck; desc: string }[] = [
  { key: 'driver', label: '기사', icon: Truck, desc: '커피박 수거 기사' },
  { key: 'cafe', label: '점주', icon: Store, desc: '카페 점주' },
  { key: 'company', label: '관리자', icon: Building2, desc: '소속회사 관리자' },
]

const storeTypes = [
  { value: 'FRANCHISE', label: '프랜차이즈', icon: '◆', desc: '브랜드 가맹점' },
  { value: 'INDIVIDUAL', label: '개인카페', icon: '●', desc: '개인 운영 매장' },
]

const truckTypes = [
  { value: '1톤 트럭', label: '1톤' },
  { value: '1.5톤 트럭', label: '1.5톤' },
  { value: '2.5톤 트럭', label: '2.5톤' },
  { value: '5톤 트럭', label: '5톤' },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: 역할선택, 2: 정보입력
  const [selectedRole, setSelectedRole] = useState<UserRole>('cafe')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 점주 전용
  const [cafeName, setCafeName] = useState('')
  const [cafeAddress, setCafeAddress] = useState('')
  const [storeType, setStoreType] = useState('INDIVIDUAL')

  // 기사 전용
  const [truckType, setTruckType] = useState('1톤 트럭')
  const [licensePlate, setLicensePlate] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const companyDropdownRef = useRef<HTMLDivElement>(null)

  // 점주 전용 - 담당 회사
  const [cafeCompanyName, setCafeCompanyName] = useState('')
  const [showCafeCompanyDropdown, setShowCafeCompanyDropdown] = useState(false)
  const cafeCompanyDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const db = supabase as any
    db.from('companies').select('id, name').order('name').then(({ data }: any) => {
      if (data) setCompanies(data)
    })
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target as Node)) {
        setShowCompanyDropdown(false)
      }
      if (cafeCompanyDropdownRef.current && !cafeCompanyDropdownRef.current.contains(e.target as Node)) {
        setShowCafeCompanyDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // 관리자 전용
  const [adminCompanyName, setAdminCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    try {
      // 1. Supabase Auth 회원가입
      const email = `${phone}@coffeelo.kr`
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error('회원가입에 실패했습니다.')

      const authId = authData.user.id

      // 2. 역할별 테이블에 데이터 삽입
      if (selectedRole === 'cafe') {
        const { error: dbError } = await supabase.from('cafes').insert({
          auth_id: authId,
          name: cafeName || name + '의 카페',
          store_type: storeType,
          address: cafeAddress || '주소 미입력',
          phone: phone,
          company: cafeCompanyName || null,
          status: 'PENDING',
        } as any)
        if (dbError) throw new Error(dbError.message)
      } else if (selectedRole === 'driver') {
        // 관리자가 미리 등록한 기사인지 확인
        const { data: preRegistered } = await (supabase as any)
          .from('drivers').select('id, auth_id').eq('phone', phone).maybeSingle()
        if (preRegistered) {
          // 이미 등록된 기사 → auth_id 연결 후 로그인 유도
          if (!preRegistered.auth_id) {
            await (supabase as any).from('drivers').update({ auth_id: authId }).eq('id', preRegistered.id)
            await supabase.auth.signOut()
            navigate('/login', { state: { signupSuccess: true } })
            return
          }
          await supabase.auth.signOut()
          throw new Error('이미 등록된 전화번호입니다. 로그인 페이지에서 로그인해주세요.')
        }
        const { error: dbError } = await (supabase as any).from('drivers').insert({
          auth_id: authId,
          name: name,
          phone: phone,
          company: companyName || '미소속',
          truck_type: truckType,
          license_plate: licensePlate || null,
          status: 'PENDING',
        })
        if (dbError) throw new Error(dbError.message)
      } else if (selectedRole === 'company') {
        const { error: dbError } = await supabase.from('companies').insert({
          auth_id: authId,
          name: adminCompanyName || name + ' 물류',
          phone: companyPhone || phone,
          address: companyAddress || '주소 미입력',
        } as any)
        if (dbError) throw new Error(dbError.message)
      }

      // 3. 로그인 페이지로 이동
      await supabase.auth.signOut()
      navigate('/login', { state: { signupSuccess: true } })
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-green to-eco-green-800 flex flex-col items-center justify-start px-6 py-10 overflow-y-auto">
      {/* 로고 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Coffee className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">회원가입</h1>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Leaf className="w-3 h-3 text-green-300" />
          <span className="text-xs text-green-300 font-medium">커피로 Coffee LO</span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: 역할 선택 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-sm"
          >
            <p className="text-white/60 text-sm text-center mb-4">어떤 역할로 가입하시나요?</p>
            <div className="space-y-3">
              {roles.map((r) => {
                const Icon = r.icon
                const isActive = selectedRole === r.key
                return (
                  <motion.button
                    key={r.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(r.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isActive ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-base font-bold ${isActive ? 'text-white' : 'text-white/50'}`}>{r.label}</p>
                      <p className={`text-xs ${isActive ? 'text-white/70' : 'text-white/30'}`}>{r.desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)}
              className="w-full mt-6 py-4 bg-white text-eco-green rounded-2xl text-base font-bold flex items-center justify-center gap-2"
            >
              다음
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <button
              onClick={() => navigate('/login')}
              className="w-full mt-3 py-3 text-white/50 text-sm font-medium"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </motion.div>
        )}

        {/* Step 2: 정보 입력 */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            onSubmit={handleSubmit}
            className="w-full max-w-sm"
          >
            {/* 뒤로가기 */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-white/60 text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              역할 다시 선택
            </button>

            <div className="space-y-3">
              {/* 공통: 이름 */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                />
              </div>

              {/* 공통: 전화번호 */}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  placeholder="전화번호 (01012345678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                />
              </div>

              {/* 공통: 비밀번호 */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  placeholder="비밀번호 (6자 이상)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                />
              </div>

              {/* 역할별 추가 필드 */}
              {selectedRole === 'cafe' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-2"
                >
                  {/* 수거 담당 회사 드롭다운 */}
                  <div className="relative" ref={cafeCompanyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowCafeCompanyDropdown(!showCafeCompanyDropdown)}
                      className="w-full flex items-center px-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-sm font-medium outline-none focus:border-white/50 transition-colors"
                    >
                      <Building2 className="w-5 h-5 text-white/40 mr-3 flex-shrink-0" />
                      <span className={cafeCompanyName ? 'text-white' : 'text-white/40'}>
                        {cafeCompanyName || '수거 담당 회사 선택'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/40 ml-auto transition-transform ${showCafeCompanyDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showCafeCompanyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
                          animate={{ opacity: 1, y: 0, scaleY: 1 }}
                          exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
                          transition={{ duration: 0.15 }}
                          style={{ transformOrigin: 'top' }}
                          className="absolute left-0 right-0 mt-1 z-50 bg-eco-green-800 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
                        >
                          {companies.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-white/30 text-center">등록된 회사가 없습니다</div>
                          ) : (
                            companies.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setCafeCompanyName(c.name); setShowCafeCompanyDropdown(false) }}
                                className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                              >
                                <span className="font-medium">{c.name}</span>
                                {cafeCompanyName === c.name && <Check className="w-4 h-4 text-eco-green-300" />}
                              </button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-white/50 font-medium">매장 유형</p>
                  <div className="flex gap-2">
                    {storeTypes.map(t => {
                      const isActive = storeType === t.value
                      return (
                        <motion.button
                          key={t.value}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setStoreType(t.value)}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all duration-300 ${
                            isActive
                              ? 'bg-white/20 border-white/50 shadow-lg shadow-white/10'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <span className={`text-xl ${isActive ? 'opacity-100' : 'opacity-40'}`}>{t.icon}</span>
                          <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-white/40'}`}>{t.label}</span>
                          <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-white/30'}`}>{t.desc}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="매장 이름"
                      value={cafeName}
                      onChange={(e) => setCafeName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="매장 주소"
                      value={cafeAddress}
                      onChange={(e) => setCafeAddress(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                    />
                  </div>
                </motion.div>
              )}

              {selectedRole === 'driver' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-2"
                >
                  {/* 소속 회사 드롭다운 */}
                  <div className="relative" ref={companyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                      className="w-full flex items-center px-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-sm font-medium outline-none focus:border-white/50 transition-colors"
                    >
                      <Building2 className="w-5 h-5 text-white/40 mr-3 flex-shrink-0" />
                      <span className={companyName ? 'text-white' : 'text-white/40'}>
                        {companyName || '소속 회사 선택 (없으면 건너뜀)'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/40 ml-auto transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showCompanyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
                          animate={{ opacity: 1, y: 0, scaleY: 1 }}
                          exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
                          transition={{ duration: 0.15 }}
                          style={{ transformOrigin: 'top' }}
                          className="absolute left-0 right-0 mt-1 z-50 bg-eco-green-800 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
                        >
                          {/* 미소속 옵션 */}
                          <button
                            type="button"
                            onClick={() => { setCompanyName(''); setShowCompanyDropdown(false) }}
                            className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-white/50 hover:bg-white/10 transition-colors border-b border-white/10"
                          >
                            <span>소속 없음</span>
                            {!companyName && <Check className="w-4 h-4 text-eco-green-300" />}
                          </button>

                          {companies.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-white/30 text-center">등록된 회사가 없습니다</div>
                          ) : (
                            companies.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setCompanyName(c.name); setShowCompanyDropdown(false) }}
                                className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                              >
                                <span className="font-medium">{c.name}</span>
                                {companyName === c.name && <Check className="w-4 h-4 text-eco-green-300" />}
                              </button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-white/50 font-medium">차량 종류</p>
                  <div className="flex gap-2">
                    {truckTypes.map(t => {
                      const isActive = truckType === t.value
                      return (
                        <motion.button
                          key={t.value}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTruckType(t.value)}
                          className={`flex-1 py-3 rounded-xl border text-center transition-all duration-300 ${
                            isActive
                              ? 'bg-white/20 border-white/50 shadow-lg shadow-white/10'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-white/40'}`}>{t.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="차량 번호판 (예: 12가 3456)"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                    />
                  </div>
                </motion.div>
              )}

              {selectedRole === 'company' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-2"
                >
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="회사 이름"
                      value={adminCompanyName}
                      onChange={(e) => setAdminCompanyName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="회사 주소"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm font-medium outline-none focus:border-white/50"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 text-xs mt-3 text-center">
                {error}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-5 py-4 bg-white text-eco-green rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-button disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-eco-green/30 border-t-eco-green rounded-full animate-spin" />
              ) : (
                <>
                  가입하기
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full mt-3 py-3 text-white/50 text-sm font-medium"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
