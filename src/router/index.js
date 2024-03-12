import {createRouter, createWebHistory} from 'vue-router'
import routes from './routes.js'
import programSettingsApi from "../api/programSettingsApi.js";

const router = createRouter({
  history: createWebHistory(),
  routes,
})


let isAuthenticated = false

// router.beforeEach(async (to, from, next) => {
//   console.log(1)
//   try {
//     await programSettingsApi.get()
//     isAuthenticated = true
//   } catch (e) {
//     if (e.response && e.response.status === 401) {
//       isAuthenticated = false
//     }
//   }
//
//   if (!isAuthenticated) {
//     // Если пользователь не аутентифицирован, перенаправляем его на страницу входа
//     if (to.name !== 'login') {
//       return next({name: 'login'})
//     }
//   } else {
//     // Если пользователь аутентифицирован, перенаправляем его на главную страницу
//     if (to.name === 'login' && isAuthenticated) {
//       return next('/')
//     }
//   }
//
//   return next()
// })


export default router