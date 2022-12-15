import { createApp, h, provide } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./index.css";
import {
  ApolloClient,
  createHttpLink,
} from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApolloProvider } from "@vue/apollo-option";
import { onError } from "@apollo/client/link/error";
import { logErrorMessages } from "@vue/apollo-util";
import VueGoogleMaps from "@fawmi/vue-google-maps";
import config from "./config";
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
import "@github/markdown-toolbar-element";
import MdEditor from "md-editor-v3";
import { library } from '@fortawesome/fontawesome-svg-core'
import cache from './cache';
// import "highlight.js/styles/github-dark-dimmed.css";

import { faFaceSmile } from '@fortawesome/free-solid-svg-icons'

library.add(faFaceSmile)
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

loadFonts()

const { environment, graphqlUrlDev, graphqlUrlProd } = config;

console.log({ environment })

const httpLink = createHttpLink({
  uri: environment === 'development' ? graphqlUrlDev : graphqlUrlProd
});

const networkErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const logErrorsLink = onError((error) => {
  if (process.env.NODE_ENV !== "production") {
    logErrorMessages(error);
  }
});

// Create the apollo client
export const apolloClient = new ApolloClient({
  cache,
  link: logErrorsLink.concat(networkErrorLink).concat(httpLink),
});

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
});

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },

  render: () => h(App),
});

app
  .use(router)
  .use(vuetify)
  .use(FloatingVue)
  .use(MdEditor)
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(VueGoogleMaps, {
    load: {
      key: config.googleMapsApiKey,
      libraries: "places",
    },
  })
  .use(apolloProvider)
  .mount("#app");
