import {createRouter, createWebHistory} from 'vue-router'
import routes from './routes.js'
import {api} from "../api/api.js";

const router = createRouter({
  history: createWebHistory(),
  routes,
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      localStorage.setItem('isPayment', true)
    }

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