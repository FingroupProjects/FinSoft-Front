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
    path: '/storage',
    name: 'storage',
    component: () => import('../pages/storage/index.vue'),
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
    path: '/financeAnalysis',
    name: 'financeAnalysis',
    component: () => import('../pages/financeAnalysis/index.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/list/currency',
    name: 'currency',
    component: () => import('../pages/list/currency.vue'),
    meta: {
      hideSideBarAndHeader: false
    }
  },
  {
    path: '/list/counterparty',
    name: 'counterparty',
    component: () => import('../pages/list/counterparty.vue'),
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