import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue(), viteCommonjs()],
    optimizeDeps: {
      include: ['luxon']
    },
    commonjsOptions: {
      include: [/node_modules/]
    },
    resolve: {
      alias: {
        "@": '/src'
      },
    },
  }
})