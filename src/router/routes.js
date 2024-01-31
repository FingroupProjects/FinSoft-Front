const routes = [
  {
    path: '/',
    name: 'main',
    component: () => import('../pages/homepage/index.vue')
  }
]

export default routes