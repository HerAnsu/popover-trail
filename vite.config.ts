import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-app',
  },
  server: {
    port: 4500,
    host: true,
  },
});
