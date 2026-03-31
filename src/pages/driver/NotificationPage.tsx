import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface ToggleItem {
  key: string;
  label: string;
  description: string;
  value: boolean;
  setter: (v: boolean) => void;
}

export default function NotificationPage() {
  const navigate = useNavigate();

  const [callAlert, setCallAlert] = useState(true);
  const [assignAlert, setAssignAlert] = useState(true);
  const [completeAlert, setCompleteAlert] = useState(true);
  const [noticeAlert, setNoticeAlert] = useState(false);
  const [marketingAlert, setMarketingAlert] = useState(false);

  const toggleItems: ToggleItem[] = [
    { key: 'call', label: '콜 알림', description: '새 수거 요청이 들어오면 알림을 받습니다', value: callAlert, setter: setCallAlert },
    { key: 'assign', label: '수거 배정 알림', description: '수거 요청이 배정되면 알림을 받습니다', value: assignAlert, setter: setAssignAlert },
    { key: 'complete', label: '완료 알림', description: '수거가 완료 처리되면 알림을 받습니다', value: completeAlert, setter: setCompleteAlert },
    { key: 'notice', label: '공지사항 알림', description: '새 공지사항이 등록되면 알림을 받습니다', value: noticeAlert, setter: setNoticeAlert },
    { key: 'marketing', label: '마케팅 알림', description: '프로모션 및 이벤트 소식을 받습니다', value: marketingAlert, setter: setMarketingAlert },
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

      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => item.setter(!item.value)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.value ? 'bg-eco-green' : 'bg-gray-200'
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ${
                    item.value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
