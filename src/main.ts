import { createApp, h, provide } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./index.css";
import { ApolloClient, createHttpLink } from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApolloProvider } from "@vue/apollo-option";
import { onError } from "@apollo/client/link/error";
import { logErrorMessages } from "@vue/apollo-util";
import VueGoogleMaps from "@fawmi/vue-google-maps";
import config from "./config";
import "@github/markdown-toolbar-element";
import MdEditor from "md-editor-v3";
import { library } from "@fortawesome/fontawesome-svg-core";
import cache from "./cache";
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createAuth0 } from "@auth0/auth0-vue";
import '@fortawesome/fontawesome-free/css/all.css';

import { 
  faFaceSmile,
  faSun,
  faMoon,
  faChevronDown,
  faDesktop
 } from "@fortawesome/free-solid-svg-icons";

const vuetify = createVuetify({
  components,
  directives,
})

library.add(faFaceSmile);
library.add(faSun);
library.add(faMoon);
library.add(faChevronDown);
library.add(faDesktop);

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

async function loadFonts() {
  const webFontLoader = await import(
    /* webpackChunkName: "webfontloader" */ "webfontloader"
  );

  webFontLoader.load({
    google: {
      families: ["Roboto:100,300,400,500,700,900&display=swap"],
    },
  });
}

loadFonts();

const { environment, graphqlUrlDev, graphqlUrlProd, clientId } = config;

console.log({ environment });

const httpLink = createHttpLink({
  uri: environment === "development" ? graphqlUrlDev : graphqlUrlProd,
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
  .use(MdEditor)
  .component("font-awesome-icon", FontAwesomeIcon)
  .use(VueGoogleMaps, {
    load: {
      key: config.googleMapsApiKey,
      libraries: "places",
    },
  })
  .use(createAuth0({
    domain: "gennit.us.auth0.com",
    client_id: clientId,
    redirect_uri: window.location.origin
  }))
  .use(apolloProvider)
  .mount("#app");
