import { createApp, h, provide } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./index.css";
import "v-tooltip/dist/v-tooltip.css";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApolloProvider } from '@vue/apollo-option'
import config from "./config";
import VueGoogleMaps from "@fawmi/vue-google-maps";
import '@github/markdown-toolbar-element'

const VTooltipPlugin = require("v-tooltip");

// Cache implementation
const cache = new InMemoryCache({
  typePolicies: {
    Tag: {
      keyFields: ["text"],
    },
    Channel: {
      keyFields: ["uniqueName"],
    },
    Discussion: {
      keyFields: ["id"],
    },
    Event: {
      keyFields: ["id"],
    },
    Query: {
      fields: {
        events: {
          merge: false
        },
        discussions: {
          merge: false,
        },
        channels: {
          merge: false,
        },
      },
    },
  },
});

// Create the apollo client
export const apolloClient = new ApolloClient({
  uri: config.graphqlUrl,
  cache,
});

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },

  render: () => h(App),
});

app
  .use(router)
  .use(VTooltipPlugin)
  .use(VueGoogleMaps, {
    load: {
      key: config.googleMapsApiKey,
      libraries: "places",
    },
  })
  .use(apolloProvider)
  .mount("#app");
