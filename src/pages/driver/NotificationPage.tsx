import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'driver_notification_settings';

interface Settings {
  call: boolean;
  assign: boolean;
  complete: boolean;
  notice: boolean;
  marketing: boolean;
}

const defaultSettings: Settings = {
  call: true,
  assign: true,
  complete: true,
  notice: false,
  marketing: false,
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storageKey = `${STORAGE_KEY}_${(user as any)?.id ?? 'default'}`;

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const toggle = (key: keyof Settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem(storageKey, JSON.stringify(settings));
    await new Promise(r => setTimeout(r, 300));
    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const toggleItems = [
    { key: 'call' as keyof Settings, label: '콜 알림', description: '새 수거 요청이 들어오면 알림을 받습니다' },
    { key: 'assign' as keyof Settings, label: '수거 배정 알림', description: '수거 요청이 배정되면 알림을 받습니다' },
    { key: 'complete' as keyof Settings, label: '완료 알림', description: '수거가 완료 처리되면 알림을 받습니다' },
    { key: 'notice' as keyof Settings, label: '공지사항 알림', description: '새 공지사항이 등록되면 알림을 받습니다' },
    { key: 'marketing' as keyof Settings, label: '마케팅 알림', description: '프로모션 및 이벤트 소식을 받습니다' },
  ];

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
        <h1 className="text-base font-bold text-gray-900">알림 설정</h1>
      </header>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings[item.key] ? 'bg-eco-green' : 'bg-gray-200'
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ${
                    settings[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
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
            알림 설정이 저장됐습니다
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
