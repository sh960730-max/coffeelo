import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Plus, X, Trash2, Calendar, ChevronRight } from 'lucide-react'
import { dummyAnnouncements } from '../../lib/dummyData'

interface LocalAnnouncement {
  id: string
  title: string
  content: string
  created_at: string
}

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<LocalAnnouncement[]>([
    ...dummyAnnouncements,
    {
      id: 'a3',
      title: '3월 정산 일정 안내',
      content: '3월 정산은 매주 월요일에 확정되며, 수요일에 지급됩니다. 정산 관련 문의는 관리자에게 연락해주세요.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'a4',
      title: '신규 매장 추가 안내',
      content: '이디야 역삼점이 새롭게 수거 매장으로 등록되었습니다. 해당 지역 기사님들은 참고 부탁드립니다.',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ])
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '' })

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    setSelectedId(null)
  }

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) return
    const newAnn: LocalAnnouncement = {
      id: `a${Date.now()}`,
      title: form.title,
      content: form.content,
      created_at: new Date().toISOString(),
    }
    setAnnouncements(prev => [newAnn, ...prev])
    setForm({ title: '', content: '' })
    setShowModal(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">공지사항</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-eco-green text-white text-xs font-semibold px-3 py-2 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            작성
          </motion.button>
        </div>
      </header>

      <div className="px-5 py-4">
        <div className="space-y-2.5">
          {announcements.map((ann, idx) => {
            const isSelected = selectedId === ann.id

            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                layout
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setSelectedId(isSelected ? null : ann.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 bg-eco-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Megaphone className="w-4 h-4 text-eco-green" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{ann.title}</p>
                        {!isSelected && (
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{ann.content}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-300" />
                          <span className="text-[10px] text-gray-400">{formatDate(ann.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {!isSelected && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 pt-3">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-50">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(ann.id)}
                            className="flex items-center gap-1.5 text-red-500 text-xs font-semibold px-3 py-1.5 bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            삭제
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {announcements.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">등록된 공지사항이 없습니다</p>
          </motion.div>
        )}
      </div>

      {/* 작성 모달 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">공지 작성</h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">제목</label>
                  <input
                    type="text"
                    placeholder="공지 제목"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">내용</label>
                  <textarea
                    placeholder="공지 내용을 입력하세요"
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-eco-green/30 resize-none"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                className="w-full mt-5 bg-eco-green text-white font-semibold py-3 rounded-xl text-sm"
              >
                등록하기
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
