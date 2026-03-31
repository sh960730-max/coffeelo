import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '제1조 (목적)',
    content:
      '이 약관은 스마트에코시스(이하 "회사")가 제공하는 커피로 서비스(이하 "서비스")의 이용에 관한 조건과 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 (정의)',
    content:
      '"서비스"란 회사가 제공하는 커피 찌꺼기 수거 중개 플랫폼을 의미합니다. "기사"란 서비스를 통해 수거 업무를 수행하는 자를 의미합니다.',
  },
  {
    title: '제3조 (서비스 이용)',
    content:
      '서비스는 소속 회사 관리자의 승인 후 이용 가능합니다. 기사는 배정된 매장의 수거 요청에 성실히 응해야 합니다.',
  },
  {
    title: '제4조 (기사의 의무)',
    content:
      '기사는 수거 시 안전 운전 및 관련 법규를 준수해야 합니다. 수거물을 정해진 집하장에 안전하게 운반할 의무가 있습니다.',
  },
  {
    title: '제5조 (서비스 중단)',
    content:
      '회사는 시스템 점검, 장애 등의 사유로 서비스 제공을 일시적으로 중단할 수 있습니다.',
  },
  {
    title: '제6조 (면책조항)',
    content:
      '회사는 천재지변 또는 이에 준하는 불가항력으로 인한 서비스 제공 불가에 대해 책임을 지지 않습니다.',
  },
  {
    title: '제7조 (준거법)',
    content:
      '이 약관의 해석 및 분쟁 해결은 대한민국 법률에 따릅니다.',
  },
];

export default function TermsPage() {
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
        <h1 className="text-base font-bold text-gray-900">이용약관</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-bold text-gray-900 mb-1.5">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">최종 수정일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
