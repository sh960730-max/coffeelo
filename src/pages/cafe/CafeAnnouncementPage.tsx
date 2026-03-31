import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Megaphone, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
}

export default function CafeAnnouncementPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    const db = supabase as any
    const { data } = await db
      .from('announcements')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-900">공지사항</h1>
      </header>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-eco-green animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">등록된 공지사항이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, idx) => {
              const isExpanded = expandedId === item.id
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full p-4 text-left flex items-start gap-3"
                  >
                    <div className="w-9 h-9 bg-eco-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-4.5 h-4.5 text-eco-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(item.created_at)}</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                      >
                        <div className="px-4 py-3">
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
