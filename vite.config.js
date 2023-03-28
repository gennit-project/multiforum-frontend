import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import vuetify from 'vite-plugin-vuetify'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('sl-')
          }
        }
      }), 
      viteCommonjs(),
      vuetify({
        autoImport: true,
      }),
    ],
    define: { 'process.env': {} },
    optimizeDeps: {
      include: ['luxon']
    },
    commonjsOptions: {
      include: [/node_modules/]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})