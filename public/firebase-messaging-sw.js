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
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? '커피로 알림'
  const body  = payload.notification?.body  ?? ''
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: payload.data ?? {},
  })
})
