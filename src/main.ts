import { createApp } from 'vue'
import App from "./App.vue";
import { router } from './router';
import VueGoogleMaps from '@fawmi/vue-google-maps'
import config from './config';
import "./index.css";
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { createApolloProvider } from "@vue/apollo-option";

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  uri: "https://twilight-moon.us-west-2.aws.cloud.dgraph.io/graphql",
  cache,
})

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
});

const app = createApp(App)
    .use(router)
    .use(apolloProvider)
    .use(VueGoogleMaps, {
        load: {
            key: config.googleMapsApiKey
        }
    })
    .mount("#app");


    