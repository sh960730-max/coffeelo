import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const sections = [
  {
    title: '제1조 (목적)',
    content: '본 약관은 커피로(이하 "회사")가 제공하는 커피박 수거 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 (정의)',
    content: '"서비스"란 회사가 제공하는 커피박 수거 및 관리 플랫폼을 의미합니다. "이용자"란 본 약관에 동의하고 서비스를 이용하는 기업 및 개인을 말합니다. "관리자"란 소속 회사를 대표하여 서비스를 관리하는 사용자를 말합니다.',
  },
  {
    title: '제3조 (약관의 효력 및 변경)',
    content: '본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다. 회사는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 사전 고지합니다.',
  },
  {
    title: '제4조 (서비스의 제공)',
    content: '회사는 커피박 수거 요청 접수, 수거 기사 배정, 수거 현황 관리, 정산 내역 관리 등의 서비스를 제공합니다. 서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 정기 점검이나 기술적 사유로 일시 중단될 수 있습니다.',
  },
  {
    title: '제5조 (이용자의 의무)',
    content: '이용자는 서비스 이용 시 관계 법령, 본 약관의 규정, 이용안내 및 주의사항을 준수하여야 합니다. 이용자는 타인의 개인정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.',
  },
  {
    title: '제6조 (책임 제한)',
    content: '회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.',
  },
  {
    title: '제7조 (분쟁 해결)',
    content: '서비스 이용에 관한 분쟁은 당사자 간 협의를 통해 해결하며, 협의가 이루어지지 않을 경우 관할 법원에 소를 제기할 수 있습니다. 본 약관과 관련한 소송의 관할법원은 민사소송법에 따릅니다.',
  },
]

export default function TermsPage() {
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
          <h1 className="text-lg font-bold text-gray-900">이용약관</h1>
        </div>
      </header>

      <div className="px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-5"
        >
          <FileText className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-500">최종 업데이트: 2024년 1월 1일</p>
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
              <p className="text-xs text-gray-500 leading-relaxed">{s.content}</p>
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
