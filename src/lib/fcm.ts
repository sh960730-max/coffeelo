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

    // 만료된 토큰 강제 삭제 후 새 토큰 발급 (UNREGISTERED 방지)
    try { await deleteToken(messaging) } catch (_) {}

    // FCM 토큰 발급
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (!token) return

    console.log('[FCM] new token saved for', table, token.slice(0, 20) + '...')

    // Supabase에 저장
    await (supabase as any)
      .from(table)
      .update({ fcm_token: token })
      .eq('id', userId)

    // 포그라운드 메시지 수신 처리
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? '커피로 알림'
      const body  = payload.notification?.body  ?? ''
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icons/icon-192.png' })
      }
    })

    return token
  } catch (e) {
    console.error('FCM init error:', e)
  }
}
