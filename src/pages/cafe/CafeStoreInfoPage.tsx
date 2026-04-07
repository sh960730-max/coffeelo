import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Store, MapPin, Phone, Tag, Save, Loader2, Building2, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function CafeStoreInfoPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const cafe = user as any

  // 연락처
  const [phone,  setPhone]  = useState(cafe?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // 로그인 번호 변경
  const [newLoginPhone, setNewLoginPhone] = useState('')
  const [currentPw,     setCurrentPw]     = useState('')
  const [loginChanging, setLoginChanging] = useState(false)
  const [loginMsg,      setLoginMsg]      = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const storeTypeLabel: Record<string, string> = {
    FRANCHISE: '프랜차이즈', INDIVIDUAL: '개인카페', STARBUCKS: '스타벅스',
  }

  const handleSave = async () => {
    setSaving(true)
    const db = supabase as any
    await db.from('cafes').update({ phone }).eq('id', cafe?.id)
    await refreshUser()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLoginPhoneChange = async () => {
    if (!newLoginPhone.trim() || !currentPw.trim()) {
      setLoginMsg({ type: 'error', text: '새 전화번호와 현재 비밀번호를 모두 입력해 주세요.' })
      return
    }

    setLoginChanging(true)
    setLoginMsg(null)

    // 1) 현재 비밀번호로 재인증
    const currentEmail = `${cafe?.phone}@coffeelo.kr`
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPw,
    })

    if (reAuthError) {
      setLoginMsg({ type: 'error', text: '현재 비밀번호가 올바르지 않습니다.' })
      setLoginChanging(false)
      return
    }

    // 2) Supabase Auth 이메일 변경
    const newEmail = `${newLoginPhone.trim()}@coffeelo.kr`
    const { error: updateError } = await supabase.auth.updateUser({ email: newEmail })

    if (updateError) {
      setLoginMsg({ type: 'error', text: '로그인 번호 변경에 실패했습니다: ' + updateError.message })
      setLoginChanging(false)
      return
    }

    // 3) cafes.phone도 함께 업데이트
    await (supabase as any).from('cafes').update({ phone: newLoginPhone.trim() }).eq('id', cafe?.id)
    setPhone(newLoginPhone.trim())
    await refreshUser()

    setNewLoginPhone('')
    setCurrentPw('')
    setLoginMsg({ type: 'success', text: '로그인 전화번호가 변경되었습니다. 다음 로그인 시 새 번호를 사용하세요.' })
    setLoginChanging(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">매장 정보</h1>
      </header>

      <div className="px-5 py-6 space-y-4">
        {/* 담당 수거업체 */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">담당 수거업체</p>
              <p className="text-sm font-semibold text-gray-800">{cafe?.company ?? '미지정'}</p>
            </div>
          </div>
        </div>

        {/* 매장 유형 */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-eco-green-100 rounded-xl flex items-center justify-center">
              <Tag className="w-4.5 h-4.5 text-eco-green" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">매장 유형</p>
              <p className="text-sm font-semibold text-gray-800">
                {storeTypeLabel[cafe?.store_type] ?? '개인카페'}
              </p>
            </div>
          </div>
        </div>

        {/* 잠긴 필드 */}
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">매장명</label>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Lock className="w-3 h-3" />
                <span>담당 업체 문의</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 rounded-xl">
              <Store className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500">{cafe?.name ?? '-'}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">주소</label>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Lock className="w-3 h-3" />
                <span>담당 업체 문의</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 rounded-xl">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500">{cafe?.address ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* 연락처 */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">연락처</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="02-0000-0000"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
            />
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center -mt-1">
          매장명·주소 변경은 담당 수거업체에 문의해 주세요
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            saved ? 'bg-green-500 text-white' : 'bg-eco-green text-white'
          } disabled:opacity-50`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? '저장되었습니다!' : '저장하기'}
        </motion.button>

        {/* 로그인 번호 변경 */}
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">로그인 전화번호 변경</p>
              <p className="text-[11px] text-gray-400">현재: {cafe?.phone}</p>
            </div>
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={newLoginPhone}
              onChange={e => setNewLoginPhone(e.target.value)}
              placeholder="새 전화번호 (숫자만)"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="현재 비밀번호 확인"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <AnimatePresence>
            {loginMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs ${
                  loginMsg.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {loginMsg.type === 'success'
                  ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  : <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                {loginMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLoginPhoneChange}
            disabled={loginChanging}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-amber-500 text-white disabled:opacity-50"
          >
            {loginChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            로그인 번호 변경
          </motion.button>
        </div>
      </div>
    </div>
  )
}
