import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { initFCM } from '../lib/fcm'

/** 로그인 후 자동으로 FCM 초기화 + 토큰 저장 */
export function useFCM(table: 'drivers' | 'cafes' | 'companies') {
  const { user } = useAuth()
  const userId = (user as any)?.id

  useEffect(() => {
    if (!userId) return
    // 약간 지연시켜 페이지 로드 완료 후 권한 요청
    const timer = setTimeout(() => {
      initFCM(userId, table)
    }, 2000)
    return () => clearTimeout(timer)
  }, [userId, table])
}
