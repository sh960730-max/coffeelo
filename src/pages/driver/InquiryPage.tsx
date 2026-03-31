import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail } from 'lucide-react';

export default function InquiryPage() {
  const navigate = useNavigate();

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
        <h1 className="text-base font-bold text-gray-900">문의하기</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        {/* 전화 문의 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">전화 문의</p>
              <p className="text-xs text-gray-400 mt-0.5">평일 09:00 - 18:00</p>
              <p className="text-base font-bold text-gray-800 mt-1.5 tracking-wide">02-6925-2927</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { window.location.href = 'tel:0269252927'; }}
            className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            전화하기
          </motion.button>
        </div>

        {/* 이메일 문의 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 flex-shrink-0">
              <Mail className="w-5 h-5 text-eco-green" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">이메일 문의</p>
              <p className="text-xs text-gray-400 mt-0.5">24시간 접수 가능</p>
              <p className="text-sm font-medium text-gray-700 mt-1.5 break-all">sh960730@smartecosys.kr</p>
            </div>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="bg-amber-50 rounded-2xl px-4 py-3">
          <p className="text-xs text-amber-700 leading-relaxed">
            빠른 답변을 위해 문의 시 기사님 성함과 소속 회사를 함께 알려주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
