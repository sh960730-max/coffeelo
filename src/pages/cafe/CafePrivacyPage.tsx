import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const sections = [
  { title: '1. 수집하는 개인정보 항목', content: '회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.\n\n[필수 항목]\n• 이름, 전화번호, 비밀번호\n• 매장명, 매장 주소, 연락처\n• 서비스 이용 기록, 접속 로그' },
  { title: '2. 개인정보 수집 및 이용 목적', content: '• 서비스 회원가입 및 관리\n• 커피박 수거 서비스 제공\n• 정산 내역 관리 및 안내\n• 고객 문의 처리\n• 서비스 개선 및 신규 서비스 개발' },
  { title: '3. 개인정보 보유 및 이용 기간', content: '회원 탈퇴 시까지 보유하며, 탈퇴 후에는 지체없이 파기합니다. 단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.\n\n• 계약 또는 청약철회에 관한 기록: 5년\n• 소비자 불만 또는 분쟁처리 기록: 3년' },
  { title: '4. 개인정보의 제3자 제공', content: '회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 수거 서비스 제공을 위해 소속 수거 회사에 최소한의 정보(매장명, 주소)를 제공할 수 있습니다.' },
  { title: '5. 개인정보 보호책임자', content: '개인정보 보호책임자: 커피로 개인정보팀\n이메일: privacy@coffeelo.kr\n전화: 1588-0000' },
  { title: '6. 이용자의 권리', content: '이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 개인정보 처리에 대한 동의를 철회하거나 가입 해지를 요청할 수 있습니다.' },
  { title: '7. 개인정보의 파기', content: '개인정보 보유기간의 경과 또는 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.' },
]

export default function CafePrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">개인정보처리방침</h1>
      </header>

      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-eco-green" />
            <p className="text-xs font-semibold text-eco-green">커피로 개인정보처리방침</p>
          </div>
          <p className="text-[11px] text-gray-400">최종 수정일: 2024년 1월 1일 · 시행일: 2024년 1월 1일</p>
        </div>

        <div className="space-y-3">
          {sections.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-2xl shadow-card p-4"
            >
              <p className="text-sm font-bold text-gray-800 mb-2">{s.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
            </motion.div>
          ))}
        </div>
        <div className="h-8" />
      </div>
    </div>
  )
}
