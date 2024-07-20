import { defineConfig } from 'vite';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import vue from '@vitejs/plugin-vue';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import vuetify from 'vite-plugin-vuetify';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: `.env` })

const config = {
  domain: process.env.VITE_DOMAIN,
  clientId: process.env.VITE_AUTH0_CLIENT_ID,
  graphqlUrl: process.env.VITE_GRAPHQL_URL,
  googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY,
  environment: process.env.VITE_ENVIRONMENT,
  openGraphApiKey: process.env.VITE_OPEN_GRAPH_API_KEY,
  baseUrl: process.env.VITE_BASE_URL,
  sentryDsn: process.env.VITE_SENTRY_DSN,
  sentryAuthToken: process.env.VITE_SENTRY_AUTH_TOKEN,
  googleCloudStorageBucket: process.env.VITE_GOOGLE_CLOUD_STORAGE_BUCKET,
}

// https://vitejs.dev/config/
export default defineConfig({
    build: {
      sourcemap: true,
    },
    plugins: [
      sentryVitePlugin({
        authToken: config.sentryAuthToken,
        org: "none-y1x",
        project: "javascript-vue",
      }),
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
})