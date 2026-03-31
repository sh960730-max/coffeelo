import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Store, MapPin, Phone, Tag, Save, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import KakaoAddressModal from '../../components/KakaoAddressModal'

export default function CafeStoreInfoPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const cafe = user as any

  const [name,    setName]    = useState(cafe?.name    ?? '')
  const [address, setAddress] = useState(cafe?.address ?? '')
  const [phone,   setPhone]   = useState(cafe?.phone   ?? '')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [showAddrModal, setShowAddrModal] = useState(false)

  const storeTypeLabel: Record<string, string> = {
    FRANCHISE: '프랜차이즈', INDIVIDUAL: '개인카페', STARBUCKS: '스타벅스',
  }

  const handleSave = async () => {
    setSaving(true)
    const db = supabase as any
    await db.from('cafes').update({ name, address, phone }).eq('id', cafe?.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">매장 정보</h1>
      </header>

      <div className="px-5 py-6 space-y-4">
        {/* 매장 유형 */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-1">
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

        {/* 수정 폼 */}
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">매장명</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">주소</label>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddrModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-left"
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className={address ? 'text-gray-800' : 'text-gray-400'}>
                {address || '주소 검색 (클릭)'}
              </span>
            </motion.button>
          </div>
          <div>
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
        </div>

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
      </div>

      <KakaoAddressModal
        isOpen={showAddrModal}
        onClose={() => setShowAddrModal(false)}
        onSelect={addr => setAddress(addr)}
      />
    </div>
  )
}
