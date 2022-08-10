import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
// const path = require("path");



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env');

  return {
    plugins: [vue(), viteCommonjs()],
    optimizeDeps: {
      include: ['luxon']
    },
    // esbuildOptions: {
    //   plugins: [esbuildCommonjs('luxon')]
    // },
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