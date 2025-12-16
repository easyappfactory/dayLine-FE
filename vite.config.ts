import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dayline/api': {
        target: 'http://localhost:8080', // 백엔드 서버 주소 (포트 확인 필요)
        changeOrigin: true,
        // CORS 문제 해결을 위해 Origin 헤더를 백엔드 주소로 강제 설정
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://localhost:8080');
          });
        },
      },
    },
  },
})
