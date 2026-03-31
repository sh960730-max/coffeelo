import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, MapPin, Phone, Mail, Save, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function CompanyInfoPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const company = user as any

  const [form, setForm] = useState({
    name: company?.name || '',
    address: company?.address || '',
    phone: company?.phone || '',
    email: company?.email || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const db = supabase as any
    await db.from('companies').update({
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
    }).eq('name', company?.name)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">회사 정보</h1>
        </div>
      </header>

      <div className="px-5 py-4">
        {/* 회사 아이콘 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-eco-green to-eco-green-700 rounded-3xl flex items-center justify-center shadow-card mb-3">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <p className="text-base font-bold text-gray-900">{company?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">소속회사 관리자</p>
        </motion.div>

        {/* 정보 폼 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card p-5 space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 block">
              <Building2 className="w-3.5 h-3.5" />
              회사명
            </label>
            <input
              type="text"
              value={form.name}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-400 outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 block">
              <MapPin className="w-3.5 h-3.5" />
              주소
            </label>
            <input
              type="text"
              placeholder="회사 주소"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-eco-green/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 block">
              <Phone className="w-3.5 h-3.5" />
              전화번호
            </label>
            <input
              type="tel"
              placeholder="02-0000-0000"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-eco-green/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 block">
              <Mail className="w-3.5 h-3.5" />
              이메일
            </label>
            <input
              type="email"
              value={form.email || company?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-400 outline-none cursor-not-allowed"
            />
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          disabled={saving}
          onClick={handleSave}
          className="w-full mt-5 bg-eco-green text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <>저장 완료!</>
          ) : (
            <>
              <Save className="w-4 h-4" />
              저장하기
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
