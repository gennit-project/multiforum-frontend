import { createApp, provide, h } from 'vue'
import App from "./App.vue";
import { router } from './router';
import "./index.css";
import 'v-tooltip/dist/v-tooltip.css'
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';
import config from './config';
import VueGoogleMaps from '@fawmi/vue-google-maps'
const VTooltipPlugin = require('v-tooltip');

// Cache implementation
const cache = new InMemoryCache({
  typePolicies: {
    Tag: {
      keyFields: ["text"]
    },
    Community: {
      keyFields: ["url"]
    },
    Discussion: {
      keyFields: ["id"]
    },
    Query: {
      fields: {
        queryDiscussion: {
          merge: false
        },
        queryCommunity: {
          merge: false
        }
      }
    }
  }
})

// Create the apollo client
const apolloClient = new ApolloClient({
  uri: config.graphqlUrl,
  cache,
})


const app = createApp({
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App)
})

app.use(router)
   .use(VTooltipPlugin)
   .use(VueGoogleMaps, {
      load: {
        key: config.googleMapsApiKey,
        libraries: "places"
      },
   })
   .mount("#app");


    