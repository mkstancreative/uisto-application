import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  // Used only when VITE_API_URL is set to an empty string (see .env.example)
  const target = env.VITE_PROXY_TARGET;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        // Fill the %VITE_*% placeholders in index.html, with defaults when unset
        // (Vite otherwise leaves them as literal text).
        name: 'html-app-name',
        transformIndexHtml: (html) =>
          html
            .replaceAll('%VITE_APP_NAME%', env.VITE_APP_NAME || 'Netpro')
            .replaceAll('%VITE_APP_TAGLINE%', env.VITE_APP_TAGLINE || 'Recruitment Portal'),
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': { target, changeOrigin: true },
        '/uploads': { target, changeOrigin: true },
      },
    },
  };
});
