import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Truck, Camera, Check, ArrowRight, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

type WeighStep = 'idle' | 'loaded' | 'empty' | 'complete'

export default function WeighPage() {
  const { user } = useAuth()
  const driverId = (user as any)?.id

  const [step, setStep] = useState<WeighStep>('idle')
  const [loadedWeight, setLoadedWeight] = useState('')
  const [emptyWeight, setEmptyWeight] = useState('')

  const [loadedPhotoFile, setLoadedPhotoFile] = useState<File | null>(null)
  const [loadedPhotoPreview, setLoadedPhotoPreview] = useState<string | null>(null)
  const [emptyPhotoFile, setEmptyPhotoFile] = useState<File | null>(null)
  const [emptyPhotoPreview, setEmptyPhotoPreview] = useState<string | null>(null)

  const [history, setHistory] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [photoViewUrl, setPhotoViewUrl] = useState<string | null>(null)

  const loadedInputRef = useRef<HTMLInputElement>(null)
  const emptyInputRef = useRef<HTMLInputElement>(null)

  const netWeight = loadedWeight && emptyWeight
    ? Math.max(0, parseFloat(loadedWeight) - parseFloat(emptyWeight))
    : 0

  const fetchHistory = async () => {
    if (!driverId) return
    const db = supabase as any
    const { data } = await db.from('weigh_ins')
      .select('*')
      .eq('driver_id', driverId)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistory(data)
  }

  useEffect(() => { fetchHistory() }, [driverId])

  const handlePhotoSelect = (type: 'loaded' | 'empty', file: File) => {
    const previewUrl = URL.createObjectURL(file)
    if (type === 'loaded') {
      setLoadedPhotoFile(file)
      setLoadedPhotoPreview(previewUrl)
    } else {
      setEmptyPhotoFile(file)
      setEmptyPhotoPreview(previewUrl)
    }
  }

  const uploadPhoto = async (file: File, label: string): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${driverId}_${label}_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('weigh-photos')
        .upload(fileName, file, { upsert: true })
      if (error) { console.error('upload error:', error); return null }
      const { data: { publicUrl } } = supabase.storage
        .from('weigh-photos')
        .getPublicUrl(data.path)
      return publicUrl
    } catch (e) {
      console.error('upload exception:', e)
      return null
    }
  }

  const handleStart = () => setStep('loaded')
  const handleLoadedDone = () => setStep('empty')

  const handleComplete = async () => {
    if (!driverId) return
    setSaving(true)
    const loadedPhotoUrl = loadedPhotoFile ? await uploadPhoto(loadedPhotoFile, 'loaded') : null
    const emptyPhotoUrl = emptyPhotoFile ? await uploadPhoto(emptyPhotoFile, 'empty') : null
    const db = supabase as any
    await db.from('weigh_ins').insert({
      driver_id: driverId,
      loaded_weight: parseFloat(loadedWeight),
      empty_weight: parseFloat(emptyWeight),
      net_weight: netWeight,
      loaded_photo_url: loadedPhotoUrl,
      empty_photo_url: emptyPhotoUrl,
      status: 'COMPLETED',
    })
    setSaving(false)
    setStep('complete')
    fetchHistory()
  }

  const handleReset = () => {
    setStep('idle')
    setLoadedWeight('')
    setEmptyWeight('')
    setLoadedPhotoFile(null)
    setLoadedPhotoPreview(null)
    setEmptyPhotoFile(null)
    setEmptyPhotoPreview(null)
  }

  const PhotoCapture = ({
    label, preview, inputRef, onSelect,
  }: {
    label: string
    preview: string | null
    inputRef: React.RefObject<HTMLInputElement>
    onSelect: (f: File) => void
  }) => (
    <div className="mt-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onSelect(f)
          e.target.value = ''
        }}
      />
      {preview ? (
        <div className="relative rounded-xl overflow-hidden">
          <img src={preview} alt="계량판" className="w-full max-h-48 object-cover rounded-xl" />
          <button
            onClick={() => {
              if (label === 'loaded') { setLoadedPhotoFile(null); setLoadedPhotoPreview(null) }
              else { setEmptyPhotoFile(null); setEmptyPhotoPreview(null) }
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-eco-green/90 rounded-lg px-2 py-1">
            <ImageIcon className="w-3 h-3 text-white" />
            <span className="text-[10px] text-white font-semibold">사진 완료</span>
          </div>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-gray-50"
        >
          <Camera className="w-5 h-5 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">계량판 사진 촬영</span>
        </motion.button>
      )}
    </div>
  )

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">집하장 계량</h1>
        <p className="text-xs text-gray-500 mt-0.5">적재 → 하차 → 공차 무게 측정</p>
      </header>

      <div className="px-5 py-4">
        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-1 mb-5">
          {['적재 무게', '하차 후 공차', '완료'].map((label, idx) => {
            const stepIdx = step === 'idle' ? -1 : step === 'loaded' ? 0 : step === 'empty' ? 1 : 2
            return (
              <div key={label} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${idx <= stepIdx ? 'bg-eco-green' : 'bg-gray-200'}`} />
                <span className={`text-[10px] mt-1 block ${idx <= stepIdx ? 'text-eco-green font-semibold' : 'text-gray-400'}`}>{label}</span>
              </div>
            )
          })}
        </div>

        {step === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
            <div className="w-20 h-20 bg-eco-green-100 rounded-3xl flex items-center justify-center mx-auto">
              <Scale className="w-10 h-10 text-eco-green" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-5">계량 시작</h2>
            <p className="text-sm text-gray-500 mt-2">집하장 도착 후 계량을 시작해 주세요</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-eco-green to-eco-green-600 text-white rounded-2xl text-base font-bold shadow-button"
            >
              계량 시작하기
            </motion.button>
          </motion.div>
        )}

        {step === 'loaded' && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-coffee-brown/10 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-coffee-brown" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">적재 무게</h3>
                  <p className="text-xs text-gray-500">커피박이 실린 상태의 차량 무게</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number" inputMode="decimal" placeholder="0"
                  value={loadedWeight} onChange={(e) => setLoadedWeight(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 rounded-xl text-2xl font-bold text-center text-gray-900 placeholder-gray-300 border border-gray-200 focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">kg</span>
              </div>
              <PhotoCapture
                label="loaded"
                preview={loadedPhotoPreview}
                inputRef={loadedInputRef}
                onSelect={(f) => handlePhotoSelect('loaded', f)}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLoadedDone}
              disabled={!loadedWeight || !loadedPhotoPreview}
              className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 ${
                loadedWeight && loadedPhotoPreview ? 'bg-eco-green text-white shadow-button' : 'bg-gray-200 text-gray-400'
              }`}
            >
              다음: 하차 후 공차 무게
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {step === 'empty' && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">적재 무게</span>
              <span className="text-sm font-bold text-gray-700">{parseFloat(loadedWeight).toLocaleString()} kg</span>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">공차 무게</h3>
                  <p className="text-xs text-gray-500">커피박 하차 후 빈 차량 무게</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number" inputMode="decimal" placeholder="0"
                  value={emptyWeight} onChange={(e) => setEmptyWeight(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 rounded-xl text-2xl font-bold text-center text-gray-900 placeholder-gray-300 border border-gray-200 focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">kg</span>
              </div>
              <PhotoCapture
                label="empty"
                preview={emptyPhotoPreview}
                inputRef={emptyInputRef}
                onSelect={(f) => handlePhotoSelect('empty', f)}
              />
            </div>
            {emptyWeight && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-eco-green-100 rounded-2xl p-4 text-center border border-eco-green/20"
              >
                <p className="text-xs text-eco-green font-medium">순수 커피박 무게</p>
                <p className="text-3xl font-bold text-eco-green mt-1">{netWeight.toLocaleString()} <span className="text-lg">kg</span></p>
                <p className="text-xs text-eco-green/70 mt-1">예상 정산액: {(netWeight * 80).toLocaleString()}원</p>
              </motion.div>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleComplete}
              disabled={!emptyWeight || !emptyPhotoPreview || saving}
              className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 ${
                emptyWeight && emptyPhotoPreview && !saving
                  ? 'bg-gradient-to-r from-eco-green to-eco-green-600 text-white shadow-button'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> 저장 중...</> : '계량 완료'}
            </motion.button>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-eco-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <Check className="w-10 h-10 text-eco-green" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 mt-5">계량 완료!</h2>
            <div className="bg-white rounded-2xl p-5 shadow-card mt-5 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">적재 무게</span>
                  <span className="text-sm font-bold text-gray-700">{parseFloat(loadedWeight).toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">공차 무게</span>
                  <span className="text-sm font-bold text-gray-700">{parseFloat(emptyWeight).toLocaleString()} kg</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-eco-green">순수 무게</span>
                  <span className="text-lg font-bold text-eco-green">{netWeight.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">예상 정산액</span>
                  <span className="text-base font-bold text-amber-600">{(netWeight * 80).toLocaleString()}원</span>
                </div>
              </div>
              {/* 저장된 사진 미리보기 */}
              {(loadedPhotoPreview || emptyPhotoPreview) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">계량판 사진</p>
                  <div className="flex gap-2">
                    {loadedPhotoPreview && (
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 mb-1">적재</p>
                        <img src={loadedPhotoPreview} className="w-full h-20 object-cover rounded-lg" />
                      </div>
                    )}
                    {emptyPhotoPreview && (
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 mb-1">공차</p>
                        <img src={emptyPhotoPreview} className="w-full h-20 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              className="mt-5 px-6 py-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600"
            >
              새 계량 시작
            </motion.button>
          </motion.div>
        )}

        {/* 최근 계량 이력 */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-gray-900 mb-3">최근 계량 이력</h3>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Scale className="w-8 h-8 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-400 mt-2">계량 이력이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((w) => {
                const date = new Date(w.created_at)
                return (
                  <div key={w.id} className="bg-white rounded-xl p-3.5 shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">
                        {date.getMonth() + 1}/{date.getDate()} {date.getHours()}:{String(date.getMinutes()).padStart(2, '0')}
                      </p>
                      <div className="text-right">
                        <p className="text-base font-bold text-eco-green">{w.net_weight?.toLocaleString()} kg</p>
                        <p className="text-[10px] text-amber-600">{((w.net_weight || 0) * 80).toLocaleString()}원</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      적재 {w.loaded_weight?.toLocaleString()}kg → 공차 {w.empty_weight?.toLocaleString()}kg
                    </p>
                    {(w.loaded_photo_url || w.empty_photo_url) && (
                      <div className="flex gap-2 mt-2">
                        {w.loaded_photo_url && (
                          <button onClick={() => setPhotoViewUrl(w.loaded_photo_url)} className="flex-1">
                            <img src={w.loaded_photo_url} className="w-full h-16 object-cover rounded-lg" />
                            <p className="text-[10px] text-gray-400 text-center mt-0.5">적재</p>
                          </button>
                        )}
                        {w.empty_photo_url && (
                          <button onClick={() => setPhotoViewUrl(w.empty_photo_url)} className="flex-1">
                            <img src={w.empty_photo_url} className="w-full h-16 object-cover rounded-lg" />
                            <p className="text-[10px] text-gray-400 text-center mt-0.5">공차</p>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 사진 전체화면 뷰어 */}
      <AnimatePresence>
        {photoViewUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
            onClick={() => setPhotoViewUrl(null)}
          >
            <button className="absolute top-5 right-5 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
            <img src={photoViewUrl} className="max-w-full max-h-full object-contain rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
