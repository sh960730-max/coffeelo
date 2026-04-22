import { getToken, onMessage, deleteToken } from 'firebase/messaging'
import { getFirebaseMessaging } from './firebase'
import { supabase } from './supabase'

const VAPID_KEY = 'BHU0hNNSh23jSOmENa3RWJxJrRpU2-DKorqOG8M9-VrnCzeUmSVzVr1MLurtwhfkQvnWkM249LfqmLAg4Ny9I8Q'

// 중복 onMessage 등록 방지
let unsubscribeOnMessage: (() => void) | null = null

/** Capacitor 네이티브 환경 감지 */
function isNativePlatform(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

/** 네이티브 앱(Android) FCM 초기화 — @capacitor/push-notifications 사용 */
async function initNativeFCM(userId: string, table: 'drivers' | 'cafes' | 'companies') {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // 권한 요청
    const permResult = await PushNotifications.requestPermissions()
    if (permResult.receive !== 'granted') {
      console.log('[FCM Native] 알림 권한 거부됨')
      return
    }

    // 채널 생성 (Android 8+)
    await PushNotifications.createChannel({
      id: 'new_pickup_call',
      name: '새 수거 콜',
      description: '점주의 새 수거 요청 알림',
      importance: 5, // IMPORTANCE_HIGH
      sound: 'default',
      vibration: true,
      visibility: 1,
    })
    await PushNotifications.createChannel({
      id: 'pickup_assign',
      name: '수거 배정',
      description: '수거 기사 배정 완료 알림',
      importance: 4, // IMPORTANCE_DEFAULT
      sound: 'default',
      vibration: true,
      visibility: 1,
    })
    await PushNotifications.createChannel({
      id: 'pickup_complete',
      name: '수거 완료',
      description: '수거 완료 알림',
      importance: 3,
      sound: 'default',
      vibration: false,
      visibility: 1,
    })
    await PushNotifications.createChannel({
      id: 'notice',
      name: '공지사항',
      description: '공지사항 및 일반 알림',
      importance: 3,
      sound: 'default',
      vibration: false,
      visibility: 1,
    })

    // 등록
    await PushNotifications.register()

    // 토큰 수신
    PushNotifications.addListener('registration', async (token) => {
      console.log('[FCM Native] 토큰:', token.value.slice(0, 20) + '...')
      const { error } = await (supabase as any)
        .from(table)
        .update({ fcm_token: token.value })
        .eq('id', userId)
      console.log('[FCM Native] DB저장:', error ? '❌' + error.message : '✅성공')
    })

    // 등록 오류
    PushNotifications.addListener('registrationError', (err) => {
      console.error('[FCM Native] 등록 오류:', err)
    })

    // 포그라운드 메시지 (앱 열려있을 때)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[FCM Native] 포그라운드 알림:', notification.title)
    })

    // 알림 탭 → 딥링크 처리
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data
      console.log('[FCM Native] 알림 탭:', data)
      // 딥링크 URL이 data.link에 있으면 navigate
      if (data?.link) {
        const url = new URL(data.link)
        window.dispatchEvent(new CustomEvent('capacitor-deep-link', { detail: url.pathname + url.search }))
      }
    })

    console.log('[FCM Native] 초기화 완료')
  } catch (e) {
    console.error('[FCM Native] 초기화 오류:', e)
  }
}

/** FCM 토큰 발급 + Supabase 저장 */
export async function initFCM(userId: string, table: 'drivers' | 'cafes' | 'companies') {
  // ── 네이티브 Android 앱 환경 ──
  if (isNativePlatform()) {
    return initNativeFCM(userId, table)
  }

  // ── 웹 / PWA 환경 ──
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
    if (unsubscribeOnMessage) {
      unsubscribeOnMessage()
      unsubscribeOnMessage = null
    }
    unsubscribeOnMessage = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? '커피로 알림'
      const body  = payload.notification?.body  ?? ''
      if (Notification.permission !== 'granted') return
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

/** 로그아웃 시 FCM 토큰 삭제 — 다른 사람/기기로 알림 안 오게 */
export async function clearFCMToken(userId: string, table: 'drivers' | 'cafes' | 'companies') {
  try {
    if (isNativePlatform()) {
      // 네이티브: Capacitor PushNotifications 리스너 제거
      const { PushNotifications } = await import('@capacitor/push-notifications')
      await PushNotifications.removeAllListeners()
    } else {
      // 웹: Firebase에서 토큰 폐기
      const messaging = await getFirebaseMessaging()
      if (messaging) {
        try { await deleteToken(messaging) } catch {}
      }
    }
    // DB의 fcm_token을 null로 초기화
    await (supabase as any)
      .from(table)
      .update({ fcm_token: null })
      .eq('id', userId)
    console.log('[FCM] 토큰 삭제 완료 - 로그아웃')
  } catch (e) {
    console.error('[FCM] clearFCMToken error:', e)
  }
}
