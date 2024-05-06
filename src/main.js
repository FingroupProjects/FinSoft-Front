import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import vuetify from "./vuetify.js";
import App from './App.vue'
import 'vuetify/styles'
import './assets/css/default.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { mask } from 'vue-the-mask'

const count = 14;

const app = createApp(App)
  app.config.globalProperties.$count = count
  app.use(vuetify)
  app.use(createPinia())
  app.use(router)
  app.directive('mask', mask)
  app.mount('#app')

