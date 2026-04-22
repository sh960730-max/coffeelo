import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Capacitor 딥링크 이벤트 수신 훅
 * - FCM 알림 탭 → pushNotificationActionPerformed → capacitor-deep-link 이벤트
 * - Android App Links (https://app.smartecosys.kr/...) → MainActivity → 이벤트
 * - 수신된 path를 react-router-dom navigate로 연결
 */
export function useDeepLink() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail
      if (!path) return

      console.log('[DeepLink] 수신:', path)

      // 경로 정규화: 도메인이 포함된 경우 path만 추출
      try {
        const url = new URL(path, 'https://app.smartecosys.kr')
        navigate(url.pathname + url.search, { replace: false })
      } catch {
        // 순수 path인 경우
        navigate(path, { replace: false })
      }
    }

    window.addEventListener('capacitor-deep-link', handler)
    return () => window.removeEventListener('capacitor-deep-link', handler)
  }, [navigate])
}
