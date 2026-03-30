import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This is critical for Vercel. It grabs the API_KEY from the server environment
    // and passes it to the frontend code securely.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        samantha: resolve(__dirname, 'samantha.html'),
      },
    },
  },
  server: {
    port: 3000,
  }
});
