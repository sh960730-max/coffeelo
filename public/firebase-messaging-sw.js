importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBGXwy3Yz34ZVIqMP2u0G_2CrY5-LRCLIo',
  authDomain: 'coffeelo-ac3b2.firebaseapp.com',
  projectId: 'coffeelo-ac3b2',
  storageBucket: 'coffeelo-ac3b2.firebasestorage.app',
  messagingSenderId: '992943222054',
  appId: '1:992943222054:web:1219b148be421fe680e5e7',
})

const messaging = firebase.messaging()

// 백그라운드 메시지 처리 (앱이 꺼져있거나 백그라운드일 때)
// iOS Safari 호환: data 필드 우선 사용 → 한글 깨짐 방지
// tag 사용 → 중복 알림 방지
messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || payload.notification?.title || '커피로 알림'
  const body  = payload.data?.body  || payload.notification?.body  || ''
  const icon  = payload.data?.icon  || '/icons/icon-192.png'
  const tag   = payload.data?.tag   || payload.collapseKey || 'coffeelo'

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/icons/icon-72.png',
    tag,          // 동일 tag → 기존 알림 대체 (중복 방지)
    renotify: true,
    data: payload.data ?? {},
  })
})
