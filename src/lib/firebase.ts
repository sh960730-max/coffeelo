import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyBGXwy3Yz34ZVIqMP2u0G_2CrY5-LRCLIo',
  authDomain: 'coffeelo-ac3b2.firebaseapp.com',
  projectId: 'coffeelo-ac3b2',
  storageBucket: 'coffeelo-ac3b2.firebasestorage.app',
  messagingSenderId: '992943222054',
  appId: '1:992943222054:web:1219b148be421fe680e5e7',
}

export const firebaseApp = initializeApp(firebaseConfig)

export const getFirebaseMessaging = async () => {
  const supported = await isSupported()
  if (!supported) return null
  return getMessaging(firebaseApp)
}
