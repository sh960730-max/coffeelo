import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '수집하는 개인정보',
    content:
      '이름, 연락처, 차량 정보(차종, 번호판), 위치 정보, 수거 이력',
  },
  {
    title: '개인정보 수집 목적',
    content:
      '수거 서비스 제공, 정산 처리, 고객 지원, 서비스 개선',
  },
  {
    title: '개인정보 보유 기간',
    content:
      '서비스 이용 종료 후 5년간 보관 후 파기합니다. 단, 관련 법령에 의한 경우 해당 기간 동안 보관합니다.',
  },
  {
    title: '개인정보 제3자 제공',
    content:
      '회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외입니다.',
  },
  {
    title: '개인정보 처리 위탁',
    content:
      '회사는 서비스 제공을 위해 필요한 경우 개인정보 처리를 외부 업체에 위탁할 수 있으며, 이 경우 사전에 고지합니다.',
  },
  {
    title: '이용자의 권리',
    content:
      '이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 처리 정지를 요청할 수 있습니다.',
  },
  {
    title: '개인정보 보호책임자',
    content:
      '담당자: 개인정보보호팀\n이메일: sh960730@smartecosys.kr\n전화: 02-6925-2927',
  },
];

export default function PrivacyPage() {
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
        <h1 className="text-base font-bold text-gray-900">개인정보처리방침</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-bold text-gray-900 mb-1.5">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">최종 수정일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
