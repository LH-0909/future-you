import { defineConfig } from 'vite';
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/future-you/' : '/',
  build: {
    rollupOptions: {
      output: { manualChunks: { three: ['three', 'three/addons/controls/OrbitControls.js'], react: ['react', 'react-dom'] } },
    },
  },
});
