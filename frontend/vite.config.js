import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true,
            },
        },
    },
    build: {
        // minify: 'terser', // Removed as terser might not be installed
        sourcemap: false,
        chunkSizeWarningLimit: 1600,
    }
})
