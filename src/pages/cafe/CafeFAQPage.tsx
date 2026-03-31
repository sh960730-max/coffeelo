import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const faqs = [
  {
    q: '수거 신청은 어떻게 하나요?',
    a: '앱 하단 메뉴에서 "수거신청" 버튼을 누르고 커피박 예상량을 입력한 후 신청하시면 됩니다. 담당 기사가 배정되면 알림을 받으실 수 있습니다.',
  },
  {
    q: '수거 신청 후 취소할 수 있나요?',
    a: '기사가 배정되기 전까지는 수거 내역 페이지에서 취소 가능합니다. 기사 배정 이후에는 취소가 어려우니 담당 기사에게 직접 연락해 주세요.',
  },
  {
    q: '수거 가능한 시간대는 언제인가요?',
    a: '평일 오전 9시부터 오후 6시까지 수거가 가능합니다. 주말 및 공휴일에는 수거가 어려울 수 있습니다.',
  },
  {
    q: '커피박은 어떻게 보관해야 하나요?',
    a: '수거 전날까지 통풍이 잘 되는 서늘한 곳에 보관해 주세요. 밀폐 용기에 담아두면 냄새와 오염을 방지할 수 있습니다.',
  },
  {
    q: '폐기물 처리비 절감액은 어떻게 계산되나요?',
    a: '커피박 수거량(kg)에 절감 단가(600원/kg)를 곱하여 계산됩니다. 실제 정산 금액은 매월 1일 확정되며 정산 페이지에서 확인할 수 있습니다.',
  },
  {
    q: '수거 최소 수량이 있나요?',
    a: '수거 최소 수량은 5kg입니다. 커피박이 5kg 미만인 경우 다음 수거 때 함께 신청하시길 권장합니다.',
  },
  {
    q: '담당 회사를 변경할 수 있나요?',
    a: '담당 수거 회사 변경은 고객센터(문의하기)를 통해 요청하실 수 있습니다. 변경 승인까지 영업일 기준 2~3일 소요됩니다.',
  },
  {
    q: '앱 사용이 어렵습니다. 도움을 받을 수 있나요?',
    a: '"문의하기" 메뉴에서 카카오톡 채널을 통해 1:1 상담이 가능합니다. 평일 오전 9시부터 오후 6시까지 운영됩니다.',
  },
]

export default function CafeFAQPage() {
  const navigate = useNavigate()
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">자주 묻는 질문</h1>
      </header>

      <div className="px-5 py-4 space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = expandedIdx === idx
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-2xl shadow-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-start gap-3"
              >
                <div className="w-7 h-7 bg-eco-green rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-white">Q</span>
                </div>
                <p className="flex-1 text-sm font-semibold text-gray-800 leading-snug">{faq.q}</p>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  : <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="px-4 py-3 flex gap-3">
                      <div className="w-7 h-7 bg-coffee-brown/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-coffee-brown">A</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed flex-1">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        <div className="bg-eco-green-100 rounded-2xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-eco-green" />
            <p className="text-sm font-semibold text-eco-green">더 궁금한 점이 있으신가요?</p>
          </div>
          <p className="text-xs text-eco-green/70">문의하기 메뉴에서 1:1 상담을 이용해 주세요.</p>
        </div>
      </div>
    </div>
  )
}
