import { readableConfig } from '@pollium/readable-react/app/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default readableConfig({
    plugins: [
        react(),
        tailwindcss(),
        basicSsl()
    ],
    server: {
        port: 5175
    }
}, { api: 'http://localhost:8080' });
