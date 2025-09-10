import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  build: {
    rollupOptions: {},
    outDir: '../../../../dist/admin',
    emptyOutDir: false
  }
});


