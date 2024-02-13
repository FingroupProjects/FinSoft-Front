const routes = [
  {
    path: "/",
    name: "main",
    component: () => import("../pages/homepage/index.vue"),
  },
  {
    path: "/planning",
    name: "planning",
    component: () => import("../pages/planning/index.vue"),
  },
  {
    path: "/procurementOfGoods",
    name: "procurementOfGoods",
    component: () => import("../pages/procurementOfGoods/index.vue"),
  },
  {
    path: "/sellingGoods",
    name: "sellingGoods",
    component: () => import("../pages/sellingGoods/index.vue"),
  },
  {
    path: "/storage",
    name: "storage",
    component: () => import("../pages/storage/index.vue"),
  },
  {
    path: "/cash",
    name: "cash",
    component: () => import("../pages/cash/index.vue"),
  },
  {
    path: "/salary",
    name: "salary",
    component: () => import("../pages/salary/index.vue"),
  },
  {
    path: "/financeAnalysis",
    name: "financeAnalysis",
    component: () => import("../pages/financeAnalysis/index.vue"),
  },
  {
    path: "/list/currency",
    name: "currency",
    component: () => import("../pages/list/currency/index.vue"),
  },
  {
    path: "/list/currency/:id",
    name: "currencyShow",
    component: () => import("../pages/list/currency/show.vue"),
  },
  {
    path: "/list/counterparty",
    name: "counterparty",
    component: () => import("../pages/list/counterparty/index.vue"),
  },
  {
    path: "/list/createCounterparty",
    name: "createCounterparty",
    component: () => import("../pages/list/counterparty/createCounterparty.vue"),
  },
  {
    path: "/list/organizationBill",
    name: "organizationBill",
    component: () => import("../pages/list/organizationBill/index.vue"),
  },
  {
    path: "/list/organizationBill/create",
    name: "createOrganizationBill",
    component: () => import("../pages/list/organizationBill/create.vue"),
  },
  {
    path: "/list/organizationBill/edit/:id",
    name: "editOrganizationBill",
    component: () => import("../pages/list/organizationBill/edit.vue"),
  },
  {
    path: "/list/renameCounterparty/:id",
    name: "renameCounterparty",
    component: () => import("../pages/list/counterparty/renameCounterparty.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/authentication/authentication.vue"),
    meta: {
      hideSideBarAndHeader: true,
    },
  }
];

routes.forEach((route) => {
  route.meta ??= {};
  route.meta.hideSideBarAndHeader ??= false;
});

export default routes;
