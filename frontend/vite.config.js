import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        // Emit the built site into the backend's static dir so the Rust
        // server can serve it as a single deployable unit.
        outDir: '../backend/static',
        emptyOutDir: true,
    },
    server: {
        // During `npm run dev`, proxy API calls to the Axum server so the
        // contact form works without CORS headaches.
        proxy: {
            '/api': 'http://127.0.0.1:8080',
        },
    },
});
