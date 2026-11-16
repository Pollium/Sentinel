import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import typia from '@typia/unplugin/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
    plugins: [
        typia({ tsconfig: './tsconfig.app.json', cache: true }),
        react(),
        tailwindcss(),
        basicSsl()
    ],
    server: {
        port: 5175,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
