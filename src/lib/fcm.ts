import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from './firebase'
import { supabase } from './supabase'

const VAPID_KEY = 'BHU0hNNSh23jSOmENa3RWJxJrRpU2-DKorqOG8M9-VrnCzeUmSVzVr1MLurtwhfkQvnWkM249LfqmLAg4Ny9I8Q'

// 중복 onMessage 등록 방지
let unsubscribeOnMessage: (() => void) | null = null

/** FCM 토큰 발급 + Supabase 저장 */
export async function initFCM(userId: string, table: 'drivers' | 'cafes' | 'companies') {
  try {
    // 데스크탑 브라우저(노트북 등)는 토큰 등록 건너뜀 — 모바일/PWA만 허용
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!isStandalone && !isMobile) {
      console.log('[FCM] 데스크탑 브라우저 - 건너뜀')
      return
    }

    const messaging = await getFirebaseMessaging()
    if (!messaging) { console.warn('[FCM] messaging 지원 안됨'); return }

    const permission = await Notification.requestPermission()
    console.log('[FCM] 알림권한:', permission)
    if (permission !== 'granted') return

    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    console.log('[FCM] 토큰:', token ? token.slice(0, 20) + '...' : 'null')
    if (!token) return

    const { error } = await (supabase as any)
      .from(table)
      .update({ fcm_token: token })
      .eq('id', userId)
    console.log('[FCM] DB저장:', error ? '❌' + error.message : '✅성공')

    // 포그라운드 메시지 수신 처리 (앱이 열려있을 때)
    // 중복 등록 방지: 기존 리스너 해제 후 재등록
    if (unsubscribeOnMessage) {
      unsubscribeOnMessage()
      unsubscribeOnMessage = null
    }
    unsubscribeOnMessage = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? '커피로 알림'
      const body  = payload.notification?.body  ?? ''
      if (Notification.permission !== 'granted') return
      // Chrome Android: getRegistrations()로 즉시 SW 획득 (ready는 멈출 수 있음)
      navigator.serviceWorker.getRegistrations().then(regs => {
        const reg = regs.find(r => r.active) ?? regs[0]
        if (reg) {
          reg.showNotification(title, { body, icon: '/icons/icon-192.png' })
        } else {
          try { new Notification(title, { body, icon: '/icons/icon-192.png' }) } catch {}
        }
      }).catch(e => console.error('[FCM] foreground notification error:', e))
    })

    return token
  } catch (e) {
    console.error('FCM init error:', e)
  }
}
