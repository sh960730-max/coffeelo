import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Megaphone, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

function formatKoreanDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function AnnouncementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      const company = (user as any)?.company;
      let query = supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (company) {
        query = query.eq('company', company);
      }

      const { data } = await query;
      setAnnouncements(data ?? []);
      setLoading(false);
    };
    fetchAnnouncements();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
        <h1 className="text-base font-bold text-gray-900">공지사항</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-eco-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
            <Megaphone className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">공지사항이 없습니다</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                className="w-full p-4 flex items-start justify-between gap-3 text-left"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-snug">{item.title}</p>
                  <AnimatePresence initial={false}>
                    {expandedId !== item.id && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-gray-400 mt-1 truncate"
                      >
                        {item.content}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-xs text-gray-300 mt-1.5">{formatKoreanDate(item.created_at)}</p>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 mt-0.5"
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {expandedId === item.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-gray-50">
                      <p className="text-sm text-gray-600 leading-relaxed pt-3 whitespace-pre-wrap">
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
