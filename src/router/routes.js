const routes = [
  {
    path: "/",
    name: "main",
    component: () => import("../pages/homepage/index.vue"),
  },
  {
    path: "/adminPanel",
    name: "adminPanel",
    component: () => import("../pages/admin-panel/index.vue"),
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
    path: "/warehouseAccounting",
    name: "warehouseAccounting",
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
    path: "/list/counterparty",
    name: "counterparty",
    component: () => import("../pages/list/counterparty/index.vue"),
  },
  {
    path: "/list/organizationBill",
    name: "organizationBill",
    component: () => import("../pages/list/organizationBill/index.vue"),
  },
  {
    path: "/list/organization",
    name: "indexOrganization",
    component: () => import("../pages/list/organization/index.vue"),
  },
  {
    path: "/list/priceType",
    name: "priceType",
    component: () => import("../pages/list/priceType/index.vue"),
  },
  {
    path: "/list/cashRegister",
    name: "cashRegister",
    component: () => import("../pages/list/cashRegister/index.vue"),
  },
  {
    path: "/list/unit",
    name: "unit",
    component: () => import("../pages/list/unit/index.vue"),
  },
  {
    path: "/list/employee",
    name: "employee",
    component: () => import("../pages/list/employee/index.vue"),
  },
  {
    path: "/list/user",
    name: "user",
    component: () => import("../pages/list/user/index.vue"),
  },
  {
    path: "/list/position",
    name: "position",
    component: () => import("../pages/list/position/index.vue"),
  },
  {
    path: "/list/storage",
    name: "storage",
    component: () => import("../pages/list/storage/index.vue"),
  },
  {
    path: "/programSettings",
    name: "programSettings",
    component: () => import("../pages/programSettings/index.vue"),
  },
  {
    path: "/list/nomenclature",
    name: "nomenclature",
    component: () => import("../pages/list/nomenclature/index.vue"),
  },
  {
    path: "/list/createUpdateGood/:id",
    name: "createUpdateGood",
    component: () => import("../pages/list/nomenclature/createUpdateGood.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/authentication/authentication.vue"),
    meta: {
      hideSideBarAndHeader: true,
    },
  },
  {
    path: "/:catchAll(.*)",
    name: "404",
    component: () => import("../pages/homepage/index.vue"),
  },
];

routes.forEach((route) => {
  route.meta ??= {};
  route.meta.hideSideBarAndHeader ??= false;
});

export default routes;
