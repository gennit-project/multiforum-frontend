import { createApp, h, provide } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./index.css";
import { ApolloClient, createHttpLink } from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApolloProvider } from "@vue/apollo-option";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { logErrorMessages } from "@vue/apollo-util";
import VueGoogleMaps from "vue-google-maps-community-fork";
import config from "./config";
import "@github/markdown-toolbar-element";
import { MdEditor } from "md-editor-v3";
import { library } from "@fortawesome/fontawesome-svg-core";
import cache from "./cache";
import { createAuth0 } from "@auth0/auth0-vue";
import '@fortawesome/fontawesome-free/css/all.css';
import enUS from '@kangc/v-md-editor/lib/lang/en-US';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import VueEasyLightbox from 'vue-easy-lightbox'
import vuetify from './vuetify';
import VMdEditor from '@kangc/v-md-editor/lib/codemirror-editor';
import '@kangc/v-md-editor/lib/style/codemirror-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

import { 
  faArrowsRotate,
  faCircleCheck,
  faComment,
  faEye,
  faEyeSlash,
  faFaceSmile,
  faFlag,
  faFire,
  faSun,
  faMoon,
  faChevronDown,
  faDesktop,
  faDotCircle,
  faTicket,
  faImage,
  faUserMinus,
  faUserLock,
  faUserPlus,
  faXmark,
  faArrowUpRightFromSquare
 } from "@fortawesome/free-solid-svg-icons";

 import hljs from 'highlight.js';

// Resources for the codemirror editor
import Codemirror from 'codemirror';
// mode
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/vue/vue';
// edit
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/matchbrackets';
// placeholder
import 'codemirror/addon/display/placeholder';
// active-line
import 'codemirror/addon/selection/active-line';
// scrollbar
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/scroll/simplescrollbars.css';
// style
import 'codemirror/lib/codemirror.css';

import * as Sentry from "@sentry/vue";



VMdEditor.Codemirror = Codemirror;
VMdEditor.lang.use('en-US', enUS);

VMdEditor.use(githubTheme, {
  Hljs: hljs,
});

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

library.add(faArrowsRotate);
library.add(faCircleCheck);
library.add(faComment);
library.add(faEye);
library.add(faEyeSlash);
library.add(faFaceSmile);
library.add(faFlag);
library.add(faSun);
library.add(faMoon);
library.add(faChevronDown);
library.add(faDesktop);
library.add(faTicket);
library.add(faFire);
library.add(faImage);
library.add(faArrowUpRightFromSquare);
library.add(faDotCircle);
library.add(faUserLock);
library.add(faUserMinus);
library.add(faUserPlus);
library.add(faXmark);

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
const { environment, graphqlUrlDev, graphqlUrlProd, clientId } = config;

const httpLink = createHttpLink({
  uri: environment === "development" ? graphqlUrlDev : graphqlUrlProd,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const networkErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const logErrorsLink = onError((error) => {
  if (process.env.NODE_ENV !== "production") {
    logErrorMessages(error);
  }
});

// Create the apollo client
export const apolloClient = new ApolloClient({
  cache,
  link: authLink.concat(logErrorsLink).concat(networkErrorLink).concat(httpLink),
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

Sentry.init({
  app,
  dsn: config.sentryDsn,
  integrations: [
    new Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});


app
  .use(router)
  .use(vuetify)
  .use(MdEditor)
  .use(VMdEditor)
  .use(VueEasyLightbox)
  .use(VMdPreview)
  .component("font-awesome-icon", FontAwesomeIcon)
  .use(VueGoogleMaps, {
    load: {
      key: config.googleMapsApiKey,
      loading: 'async',
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


