{/*
nhat hoang lu
Ngoc Huy Hoang Nguyen
Dung Toan Chung
*/ }
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'a6e459ec-b4d6-4ac1-a23b-cc6b3d306f05-00-1b8scuc2evyve.pike.replit.dev', // Add your host here
    ],
  },
});
