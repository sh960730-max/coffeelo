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

// Firebase messaging 초기화 (포그라운드 ↔ 서비스워커 메시지 라우팅)
firebase.messaging()

// iOS PWA 호환: push 이벤트를 직접 처리해 알림 표시
// Firebase compat의 onBackgroundMessage 대신 raw push 핸들러 사용
self.addEventListener('push', event => {
  if (!event.data) return

  let title = '커피로 알림'
  let body = ''

  try {
    const json = event.data.json()
    // FCM 페이로드 형식: notification 또는 data 필드
    title = (json.notification && json.notification.title)
         || (json.data && json.data.title)
         || title
    body  = (json.notification && json.notification.body)
         || (json.data && json.data.body)
         || body
  } catch (_) {
    try { body = event.data.text() } catch (_2) {}
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
    })
  )
})
