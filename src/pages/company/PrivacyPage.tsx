import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const sections = [
  {
    title: '1. 수집하는 개인정보 항목',
    content: '회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.\n• 필수항목: 이름, 이메일 주소, 연락처, 소속 회사명\n• 자동수집: 서비스 이용 기록, 접속 로그, 기기 정보',
  },
  {
    title: '2. 개인정보의 수집 및 이용목적',
    content: '수집한 개인정보는 다음의 목적을 위해 활용합니다.\n• 서비스 제공 및 운영\n• 기사 및 매장 관리 서비스 제공\n• 수거 현황 및 정산 내역 관리\n• 고객 문의 및 불만 처리\n• 서비스 개선을 위한 통계 분석',
  },
  {
    title: '3. 개인정보의 보유 및 이용 기간',
    content: '원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 의하여 보존할 필요가 있는 경우 아래와 같이 보관합니다.\n• 계약 또는 청약철회에 관한 기록: 5년\n• 대금결제 및 재화 등의 공급에 관한 기록: 5년\n• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년',
  },
  {
    title: '4. 개인정보의 제3자 제공',
    content: '회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 관계 법령에 의거하여 수사기관 등의 요청이 있는 경우에는 예외로 합니다.',
  },
  {
    title: '5. 개인정보의 파기 절차 및 방법',
    content: '이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.',
  },
  {
    title: '6. 이용자의 권리',
    content: '이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 개인정보 수집 및 이용에 대한 동의를 철회할 수 있습니다. 개인정보 열람, 정정, 삭제, 처리정지 요청은 고객센터를 통해 접수하실 수 있습니다.',
  },
  {
    title: '7. 개인정보 보호책임자',
    content: '개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n• 담당부서: 서비스운영팀\n• 연락처: privacy@coffeero.kr',
  },
]

export default function PrivacyPage() {
  const navigate = useNavigate()

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
          <h1 className="text-lg font-bold text-gray-900">개인정보처리방침</h1>
        </div>
      </header>

      <div className="px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 mb-5"
        >
          <Shield className="w-4 h-4 text-blue-500" />
          <p className="text-xs text-blue-600">최종 업데이트: 2024년 1월 1일</p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-card p-4"
            >
              <h3 className="text-sm font-bold text-gray-800 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{s.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 mb-8 text-center">
          <p className="text-[11px] text-gray-300">커피로 서비스 운영팀</p>
        </div>
      </div>
    </div>
  )
}
