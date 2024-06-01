import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '../composables/auth/index.js';
import routes from './routes.js';
import { api } from "../api/api.js";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      localStorage.setItem('isPayment', true);
    }

    if (error.response && error.response.status === 401) {
      setTimeout(() => {
        console.log(error.response);
        router.push('/login');
      }, 3000);
    }
    return Promise.reject(error);
  }
);

router.beforeEach(async (to, from, next) => {
  const token = getToken();
  const authenticated = token ? 'authenticated' : 'unauthenticated';

  if (authenticated === 'unauthenticated' && to.path !== '/' && to.name !== 'login') {
    return next({ name: 'login' });
  }

  next();
});

export default router;
