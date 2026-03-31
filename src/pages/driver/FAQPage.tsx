import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: '수거 요청은 어떻게 수락하나요?',
    answer: "홈 화면의 '대기 중인 콜' 섹션에서 수거 요청을 확인하고 '수락' 버튼을 누르면 됩니다.",
  },
  {
    id: 2,
    question: '수거 완료 후 어떻게 처리하나요?',
    answer: "수거확인 버튼을 눌러 박스별 무게를 측정하고 사진을 촬영한 후 '수거 확인 완료' 버튼을 누르세요.",
  },
  {
    id: 3,
    question: '정산은 언제 이루어지나요?',
    answer: '매월 말일 기준으로 정산이 처리되며, 익월 5일 이내 지급됩니다.',
  },
  {
    id: 4,
    question: '집하장 계량은 어떻게 등록하나요?',
    answer: '하단 계량 탭에서 집하장 도착 후 전체 무게를 측정하고 사진과 함께 등록하시면 됩니다.',
  },
  {
    id: 5,
    question: '수거를 거절할 수 있나요?',
    answer: "네, 대기 중인 콜에서 '거절' 버튼을 누르면 해당 요청은 목록에서 제거됩니다.",
  },
  {
    id: 6,
    question: '담당 매장은 어떻게 배정받나요?',
    answer: '소속 회사 관리자가 매장을 배정합니다. 수거 목록 > 담당 매장 탭에서 확인하세요.',
  },
  {
    id: 7,
    question: '앱 사용 중 문제가 생기면?',
    answer: '고객지원 > 문의하기를 통해 연락주시면 빠르게 도움드리겠습니다.',
  },
  {
    id: 8,
    question: '비밀번호를 변경하고 싶어요.',
    answer: '현재 비밀번호 변경 기능은 고객지원을 통해 처리해드리고 있습니다.',
  },
];

export default function FAQPage() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
        <h1 className="text-base font-bold text-gray-900">자주 묻는 질문</h1>
      </header>

      <div className="px-5 py-4 space-y-2">
        {FAQ_ITEMS.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between gap-3 text-left"
              onClick={() => toggleExpand(item.id)}
            >
              <span className="text-sm font-semibold text-gray-900 leading-snug flex-1">
                Q. {item.question}
              </span>
              <motion.div
                animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {expandedId === item.id && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed pt-3">
                      A. {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
