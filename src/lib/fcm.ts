import { getToken, onMessage, deleteToken } from 'firebase/messaging'
import { getFirebaseMessaging } from './firebase'
import { supabase } from './supabase'

const VAPID_KEY = 'BHU0hNNSh23jSOmENa3RWJxJrRpU2-DKorqOG8M9-VrnCzeUmSVzVr1MLurtwhfkQvnWkM249LfqmLAg4Ny9I8Q'

/** FCM 토큰 발급 + Supabase 저장 */
export async function initFCM(userId: string, table: 'drivers' | 'cafes' | 'companies') {
  try {
    // PWA(홈화면 추가)에서만 토큰 등록 — 일반 브라우저 탭은 건너뜀
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (!isStandalone) return

    const messaging = await getFirebaseMessaging()
    if (!messaging) return

    // 알림 권한 요청
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const swRegistration = await navigator.serviceWorker.ready

    // 기존 토큰 삭제 후 새 토큰 발급 (PushSubscription은 건드리지 않음)
    try { await deleteToken(messaging) } catch (_) {}

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    })
    if (!token) return

    // Supabase에 저장
    await (supabase as any)
      .from(table)
      .update({ fcm_token: token })
      .eq('id', userId)

    // 포그라운드 메시지 → 서비스 워커로 위임해 알림 표시
    onMessage(messaging, async (payload) => {
      const title = payload.notification?.title ?? '커피로 알림'
      const body  = payload.notification?.body  ?? ''
      try {
        const reg = await navigator.serviceWorker.ready
        await reg.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
        })
      } catch (_) {
        new Notification(title, { body })
      }
    })

    return token
  } catch (e) {
    console.error('FCM init error:', e)
  }
}
