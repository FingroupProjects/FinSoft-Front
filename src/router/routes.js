const routes = [
  {
    path: '/',
    name: 'main',
    component: () => import('../pages/homepage/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/planning',
    name: 'planning',
    component: () => import('../pages/planning/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/procurementOfGoods',
    name: 'procurementOfGoods',
    component: () => import('../pages/procurementOfGoods/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/sellingGoods',
    name: 'sellingGoods',
    component: () => import('../pages/sellingGoods/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/sklad',
    name: 'sklad',
    component: () => import('../pages/sklad/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/cash',
    name: 'cash',
    component: () => import('../pages/cash/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {

    path: '/salary',
    name: 'salary',
    component: () => import('../pages/salary/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/list/currency',
    name: 'currency',
    component: () => import('../pages/List/Currency/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/list/currency/create',
    name: 'currency/create',
    component: () => import('../pages/List/Currency/create.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/authentication/authentication.vue'),
    meta: {
      hideSideBarAndHeader: true
    }
  },
]

export default routes