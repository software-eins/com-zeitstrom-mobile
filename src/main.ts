import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */

import './theme/tailwind.css';
import './theme/variables.css';
import './theme/custom.css';

import Sticky from 'vue-sticky-directive';


const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(Sticky);


router.isReady().then(() => {
  app.mount('#app');
});


// Add sentry
// import * as Sentry from "@sentry/vue";
// import { Integrations } from "@sentry/tracing";

// Sentry.init({
//   dsn: "https://63a481d3883e4655a6fcbb20b692fbb6@o119036.ingest.sentry.io/5810940",
//   integrations: [new Integrations.BrowserTracing()],
//   tracesSampleRate: 1.0,
//   logErrors: true,
// });

// app.config.errorHandler = (err) => {
//   Sentry.captureException(err) // 手動でSentryに送信
// }

// window.addEventListener('error', (event) => {
//   Sentry.captureException(event) // 手動でSentryに送信
// })
// window.addEventListener('unhandledrejection', (event) => {
//   Sentry.captureException(event) // 手動でSentryに送信
// })
