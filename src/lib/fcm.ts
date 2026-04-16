import { getToken, onMessage, deleteToken } from 'firebase/messaging'
import { getFirebaseMessaging } from './firebase'
import { supabase } from './supabase'

const VAPID_KEY = 'BHU0hNNSh23jSOmENa3RWJxJrRpU2-DKorqOG8M9-VrnCzeUmSVzVr1MLurtwhfkQvnWkM249LfqmLAg4Ny9I8Q'

/** FCM 토큰 발급 + Supabase 저장 */
export async function initFCM(userId: string, table: 'drivers' | 'cafes' | 'companies') {
  try {
    const messaging = await getFirebaseMessaging()
    if (!messaging) return

    // 알림 권한 요청
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    // 서비스 워커 준비 대기
    const swRegistration = await navigator.serviceWorker.ready

    // 기존 PushSubscription 완전 삭제 → 새 구독 강제 생성 (UNREGISTERED 방지)
    try {
      await deleteToken(messaging)
      const existingSub = await swRegistration.pushManager.getSubscription()
      if (existingSub) await existingSub.unsubscribe()
    } catch (_) {}

    // FCM 토큰 발급 (새 PushSubscription으로)
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

    // 포그라운드 메시지 수신 → 서비스 워커로 알림 표시 (iOS 호환)
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
        // fallback
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/icons/icon-192.png' })
        }
      }
    })

    return token
  } catch (e) {
    console.error('FCM init error:', e)
  }
}
