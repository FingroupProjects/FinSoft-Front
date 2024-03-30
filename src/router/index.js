import {createRouter, createWebHistory} from 'vue-router'
import routes from './routes.js'
import programSettingsApi from "../api/programSettingsApi.js";
import {getToken} from "../composables/auth/index.js";
import {ca} from "vuetify/locale";
import {api} from "../api/api.js";
import showToast from "../composables/toast/index.js";

const router = createRouter({
  history: createWebHistory(),
  routes,
})

api.interceptors.response.use(
  response => response,
  error => {
    // if (error.response && error.response.status === 429) {
    //   showToast('Слишком много запроса', 'red')
    // }

    if (error.response && error.response.status === 401) {

      setTimeout(() => {
        console.log(error.response)
        router.push('/login')
      }, 3000)
    }
    return Promise.reject(error);
  }
);

// router.beforeEach(async (to, from, next) => {
//
//   let authenticated = 'Unauthenticated'
//
//   if (to.name !== 'login') {
//     if (authenticated === 'Unauthenticated') {
//       return next({
//         name: 'login'
//       })
//     }
//   }
//
//   if (to.name === 'login' && authenticated === 'authenticated') {
//     return next({
//       name: 'main'
//     })
//   }
//
//   next()
// })


export default router