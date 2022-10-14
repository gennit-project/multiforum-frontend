import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

const path = require('path')


// https://vitejs.dev/config/
export default defineConfig({
  // css: {
  //   loaderOptions: {
  //     sass: {
  //       prependData: `@import "@/styles/_variables.scss";`,
  //     },
  //   },
  // },
  // runtimeCompiler: true,
  // chainWebpack: config => {
  //   config.module
  //     .rule('vue')
  //     .use('vue-loader')
  //     .loader('vue-loader')
  //     .tap(options => ({
  //       ...options,
  //       compilerOptions: {
  //         // treat any tag that starts with ion- as custom elements
  //         isCustomElement: tag => tag.startsWith('md-') || tag.startsWith('markdown-' || tag==="VDropdown")
  //       }
  //     }))
  // },
  plugins: [
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
})

