import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.smartecosys.coffeelo',
  appName: '커피로',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'app.smartecosys.kr',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false,
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'coffeelo',
    },
  },
}

export default config
