import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

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
                ws: true,
            },
            '/geoserver': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },

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
