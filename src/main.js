import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import vuetify from "./vuetify.js";
import App from './App.vue'
import 'vuetify/styles'
import './assets/css/default.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { mask } from 'vue-the-mask'
import 'leaflet/dist/leaflet.css';  // Импорт CSS файла Leaflet
import L from 'leaflet';
import { createI18n, useI18n } from 'vue-i18n'
import { languages } from "./assets/i18n"
import { defaultLocale } from "./assets/i18n"

const messages = Object.assign(languages)

const localStorageLang = localStorage.getItem('lang')

const i18n = createI18n({
  legacy: false,
  locale: localStorageLang || defaultLocale,
  fallbackLocale: 'en',
  messages,
})

const app = createApp(App, {
  setup() {
    const {t} = useI18n()
    return {t}
  }
})
  app.use(i18n)
  app.use(vuetify)
  app.use(createPinia())
  app.use(router)
  app.directive('mask', mask)
  app.mount('#app')

