import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://ems.uisto.edu.ng/backend/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              const rewritten = cookies.map((cookie) =>
                cookie
                  .replace(/;?\s*Domain=[^;]*/gi, '')
                  .replace(/path=\/[^;]*/gi, 'Path=/')
                  .replace(/;?\s*Secure\b/gi, '')
                  .replace(/;?\s*SameSite=\w+/gi, '; SameSite=Lax'),
              );
              console.log(`[proxy] ${req.url} → Set-Cookie (before):`, cookies);
              console.log(
                `[proxy] ${req.url} → Set-Cookie (after): `,
                rewritten,
              );
              proxyRes.headers['set-cookie'] = rewritten;
            }
          });
        },
      },
    },
  },
});
