import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const sections = [
  { title: '제1조 (목적)', content: '이 약관은 커피로(이하 "회사")가 제공하는 커피박 수거 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.' },
  { title: '제2조 (정의)', content: '"서비스"란 회사가 제공하는 커피박 수거 신청, 수거 현황 조회, 정산 관리 등 일체의 서비스를 의미합니다.\n"이용자"란 이 약관에 따라 서비스를 이용하는 카페 점주, 수거 기사, 소속회사 관리자를 말합니다.\n"커피박"이란 커피 음료 제조 후 발생하는 커피 찌꺼기를 의미합니다.' },
  { title: '제3조 (약관의 효력 및 변경)', content: '이 약관은 서비스 화면에 게시하거나 이용자에게 공지함으로써 효력이 발생합니다. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 날부터 효력이 발생합니다.' },
  { title: '제4조 (서비스 이용)', content: '서비스는 회사의 심사를 통해 가입 승인된 이용자에 한하여 제공됩니다. 이용자는 서비스를 통해 커피박 수거를 신청하고, 수거 현황 및 정산 내역을 확인할 수 있습니다.' },
  { title: '제5조 (이용자의 의무)', content: '이용자는 다음 행위를 하여서는 안 됩니다.\n① 타인의 정보를 도용하는 행위\n② 서비스 운영을 방해하는 행위\n③ 허위 정보를 등록하거나 수거를 신청하는 행위\n④ 기타 법령에 위반되는 행위' },
  { title: '제6조 (서비스 제공의 중단)', content: '회사는 시스템 점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.' },
  { title: '제7조 (책임의 한계)', content: '회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우 서비스 제공에 관한 책임이 면제됩니다.' },
  { title: '부칙', content: '이 약관은 2024년 1월 1일부터 시행합니다.' },
]

export default function CafeTermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">이용약관</h1>
      </header>

      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-eco-green" />
            <p className="text-xs font-semibold text-eco-green">커피로 서비스 이용약관</p>
          </div>
          <p className="text-[11px] text-gray-400">최종 수정일: 2024년 1월 1일</p>
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
