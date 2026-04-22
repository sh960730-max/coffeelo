import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Capacitor Android 빌드를 위해 dist 폴더에 출력
    outDir: 'dist',
    // 소스맵은 프로덕션에서 비활성화
    sourcemap: false,
  },
})
