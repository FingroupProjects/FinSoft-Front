const routes = [
  {
    path: '/',
    name: 'main',
    component: () => import('../pages/homepage/index.vue')
  },
  {
    path: '/planning',
    name: 'planning',
    component: () => import('../pages/planning/index.vue')
  },
  {
    path: '/procurementOfGoods',
    name: 'procurementOfGoods',
    component: () => import('../pages/procurementOfGoods/index.vue')
  },
  {
    path: '/sellingGoods',
    name: 'sellingGoods',
    component: () => import('../pages/sellingGoods/index.vue')
  },
  {
    path: '/sklad',
    name: 'sklad',
    component: () => import('../pages/sklad/index.vue')
  },
  {
    path: '/cash',
    name: 'cash',
    component: () => import('../pages/cash/index.vue')
  },
  {
    path: '/list/currency',
    name: 'currency',
    component: () => import('../pages/List/Currency/index.vue')
  },
  {
    path: '/list/currency/create',
    name: 'currency/create',
    component: () => import('../pages/List/Currency/create.vue')
  },
  {
    path: '/',
    name: 'main',
    component: () => import('../pages/homepage/index.vue')
  },
  {
    path: '/',
    name: 'main',
    component: () => import('../pages/homepage/index.vue')
  },
  {
    path: '/',
    name: 'main',
    component: () => import('../pages/homepage/index.vue')
  },
]

export default routes