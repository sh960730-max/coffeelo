import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState((user as any)?.name ?? '');
  const [phone, setPhone] = useState((user as any)?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (user) {
      setName((user as any).name ?? '');
      setPhone((user as any).phone ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await supabase
      .from('drivers')
      .update({ name, phone })
      .eq('id', (user as any)?.id);
    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-base font-bold text-gray-900">내 정보 수정</h1>
      </header>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">연락처</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="연락처를 입력하세요"
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-eco-green text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장하기'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg z-50"
          >
            <CheckCircle className="w-4 h-4 text-eco-green" />
            저장됐습니다
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
