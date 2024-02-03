import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import vuetify from "./vuetify.js";
import App from './App.vue'
import 'vuetify/styles'
import './assets/css/default.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'


const pinia = createPinia()


createApp(App)
  .use(vuetify)
  .use(pinia)
  .use(router)
  .mount('#app')
