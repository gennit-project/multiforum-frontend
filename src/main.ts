import { createApp } from "vue";
import App from "./App.vue";
import { router } from './router';
import VueGoogleMaps from '@fawmi/vue-google-maps'
import config from './config';
import "./index.css";


const app = createApp(App)
    .use(router)
    .use(VueGoogleMaps, {
        load: {
            key: config.googleMapsApiKey
        }
    })
    .mount("#app");