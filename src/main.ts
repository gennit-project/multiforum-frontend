import { createApp, provide, h } from 'vue'
import App from "./App.vue";
import { router } from './router';
import "./index.css";
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';
import mitt from 'mitt';
import config from './config';

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

const emitter = mitt();
app.config.globalProperties.emitter = emitter;

app.use(router)
   .mount("#app");


    