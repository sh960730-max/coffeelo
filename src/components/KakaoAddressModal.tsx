import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X } from 'lucide-react'

declare global {
  interface Window {
    daum: any
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (address: string) => void
}

export default function KakaoAddressModal({ isOpen, onClose, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const postcodeRef = useRef<any>(null)

  useEffect(() => {
    if (!isOpen) return

    const initPostcode = () => {
      if (!containerRef.current || !window.daum) return
      // 기존 내용 초기화
      containerRef.current.innerHTML = ''

      postcodeRef.current = new window.daum.Postcode({
        oncomplete: (data: any) => {
          const address = data.roadAddress || data.jibunAddress || data.address
          onSelect(address)
          onClose()
        },
        width: '100%',
        height: '100%',
        animation: true,
      })
      postcodeRef.current.embed(containerRef.current)
    }

    if (window.daum) {
      initPostcode()
    } else {
      // 스크립트가 아직 로드 안 됐을 경우 동적 로드
      const script = document.createElement('script')
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      script.onload = initPostcode
      document.head.appendChild(script)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-3xl overflow-hidden flex flex-col"
            style={{ height: '88vh' }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-eco-green/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-eco-green" />
                </div>
                <h2 className="text-base font-bold text-gray-900">주소 검색</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </motion.button>
            </div>

            {/* 카카오 주소 검색 임베드 영역 */}
            <div
              ref={containerRef}
              className="flex-1 w-full overflow-hidden"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
