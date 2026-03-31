import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Phone, Mail, Clock, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CafeInquiryPage() {
  const navigate = useNavigate()

  const channels = [
    {
      icon: MessageCircle,
      label: '카카오톡 채널',
      desc: '@커피로 채널로 문의',
      sub: '평일 09:00 ~ 18:00',
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      action: () => window.open('https://pf.kakao.com/', '_blank'),
      actionLabel: '채널 바로가기',
    },
    {
      icon: Phone,
      label: '전화 문의',
      desc: '02-6925-2927',
      sub: '평일 09:00 ~ 18:00 (점심 12~13시 제외)',
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
      action: () => window.location.href = 'tel:0269252927',
      actionLabel: '전화하기',
    },
    {
      icon: Mail,
      label: '이메일 문의',
      desc: 'sh960730@smartecosys.kr',
      sub: '24시간 접수 / 영업일 기준 1~2일 이내 답변',
      color: 'bg-eco-green-100',
      iconColor: 'text-eco-green',
      action: () => {},
      actionLabel: '',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">문의하기</h1>
      </header>

      <div className="px-5 py-6 space-y-3">
        <p className="text-sm text-gray-500 mb-4">
          궁금하신 내용을 아래 채널을 통해 문의해 주세요.
        </p>

        {channels.map((ch, idx) => {
          const Icon = ch.icon
          const hasAction = !!ch.actionLabel
          return (
            <motion.div
              key={ch.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-2xl shadow-card p-4"
            >
              <div className={`flex items-start gap-3 ${hasAction ? 'mb-3' : ''}`}>
                <div className={`w-11 h-11 ${ch.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${ch.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{ch.label}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{ch.desc}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] text-gray-400">{ch.sub}</p>
                  </div>
                </div>
              </div>
              {hasAction && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={ch.action}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700"
                >
                  {ch.actionLabel}
                  <ExternalLink className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </motion.div>
          )
        })}

        <div className="bg-amber-50 rounded-2xl p-4 mt-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">📌 문의 전 확인해 주세요</p>
          <p className="text-[11px] text-amber-600 leading-relaxed">
            자주 묻는 질문(FAQ)에서 대부분의 문의사항을 빠르게 해결하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
