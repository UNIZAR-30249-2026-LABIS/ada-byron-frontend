import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],

    // Proxy de desarrollo → ada-byron-backend
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/hubs': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                ws: true,   // WebSocket para SignalR
            },
            '/geoserver': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },

    // Vitest — entorno jsdom para React Testing Library
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/tests/setup.js'],
        include: ['src/tests/**/*.{test,spec}.{js,jsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
        },
    },
})
