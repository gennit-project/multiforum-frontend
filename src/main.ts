import { createApp, provide, h } from 'vue'
import App from "./App.vue";
import { router } from './router';
import VueGoogleMaps from '@fawmi/vue-google-maps'
import config from './config';
import "./index.css";
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  uri: "https://twilight-moon.us-west-2.aws.cloud.dgraph.io/graphql",
  cache,
})


const app = createApp({
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App)
})

app.use(router)
   .use(VueGoogleMaps, {
       load: {
           key: config.googleMapsApiKey
       }
   })
   .mount("#app");


    