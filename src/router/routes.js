const routes = [
  {
    path: "/",
    name: "dashboard",
    component: () => import("../pages/homepage/index.vue"),
  },
  {
    path: "/procurementOfGoods",
    name: "procurementOfGoods",
    component: () =>
      import("../pages/procurement/procurementOfGoods/index.vue"),
  },
  {
    path: "/procurementOfGoods/:id",
    name: "procurementOfGoodsShow",
    component: () => import("../pages/procurement/procurementOfGoods/show.vue"),
  },
  {
    path: "/procurementOfGoods/create",
    name: "procurementOfGoodsCreate",
    component: () =>
      import("../pages/procurement/procurementOfGoods/create.vue"),
  },
  {
    path: "/providerReturn",
    name: "providerReturn",
    component: () => import("../pages/procurement/providerReturn/index.vue"),
  },
  {
    path: "/providerReturn/:id",
    name: "providerReturnShow",
    component: () => import("../pages/procurement/providerReturn/show.vue"),
  },
  {
    path: "/providerReturn/create",
    name: "providerReturnCreate",
    component: () => import("../pages/procurement/providerReturn/create.vue"),
  },
  {
    path: "/providerOrder",
    name: "providerOrder",
    component: () => import("../pages/procurement/providerOrder/index.vue"),
  },
  {
    path: "/providerOrder/:id",
    name: "providerOrderShow",
    component: () => import("../pages/procurement/providerOrder/show.vue"),
  },
  {
    path: "/providerOrder/create",
    name: "providerOrderCreate",
    component: () => import("../pages/procurement/providerOrder/create.vue"),
  },
  {
    path: "/clientOrder",
    name: "clientOrder",
    component: () => import("../pages/selling/clientOrder/index.vue"),
  },
  {
    path: "/clientOrder/:id",
    name: "clientOrderShow",
    component: () => import("../pages/selling/clientOrder/show.vue"),
  },
  {
    path: "/clientOrder/create",
    name: "clientOrderCreate",
    component: () => import("../pages/selling/clientOrder/create.vue"),
  },

  {
    path: "/clientReturn",
    name: "clientReturn",
    component: () => import("../pages/selling/clientReturn/index.vue"),
  },
  {
    path: "/clientReturn/:id",
    name: "clientReturnShow",
    component: () => import("../pages/selling/clientReturn/show.vue"),
  },
  {
    path: "/clientReturn/create",
    name: "clientReturnCreate",
    component: () => import("../pages/selling/clientReturn/create.vue"),
  },
  {
    path: "/moveOfGoods",
    name: "moveOfGoods",
    component: () => import("../pages/storage/moveOfGoods/index.vue"),
  },
  {
    path: "/moveOfGoods/:id",
    name: "moveOfGoodsShow",
    component: () => import("../pages/storage/moveOfGoods/show.vue"),
  },
  {
    path: "/moveOfGoods/create",
    name: "moveOfGoodsCreate",
    component: () => import("../pages/storage/moveOfGoods/create.vue"),
  },
  {
    path: "/sellingGoods",
    name: "sellingGoods",
    component: () => import("../pages/selling/sellingGoods/index.vue"),
  },
  {
    path: "/sellingGoodsCreate",
    name: "sellingGoodsCreate",
    component: () => import("../pages/selling/sellingGoods/create.vue"),
  },
  {
    path: "/SellingGoodsEdit/:id",
    name: "SellingGoodsEdit",
    component: () => import("../pages/selling/sellingGoods/show.vue"),
  },
  {
    path: "/invertory",
    name: "invertory",
    component: () => import("../pages/storage/invertor/index.vue"),
  },
  {
    path: "/invertoryCreate",
    name: "invertoryCreate",
    component: () => import("../pages/storage/invertor/create.vue"),
  },
  {
    path: "/InvertoryEdit/:id",
    name: "InvertoryEdit",
    component: () => import("../pages/storage/invertor/show.vue"),
  },
  {
    path: "/moneyComing",
    name: "moneyComing",
    component: () => import("../pages/cash/moneyComing/index.vue"),
  },
  {
    path: "/moneyComingCreate",
    name: "moneyComingCreate",
    component: () => import("../pages/cash/moneyComing/create.vue"),
  },
  {
    path: "/moneyComingEdit/:id",
    name: "moneyComingEdit",
    component: () => import("../pages/cash/moneyComing/show.vue"),
  },
  {
    path: "/moneyReturn",
    name: "moneyReturn",
    component: () => import("../pages/cash/moneyReturn/index.vue"),
  },
  {
    path: "/moneyReturnCreate",
    name: "moneyReturnCreate",
    component: () => import("../pages/cash/moneyReturn/create.vue"),
  },
  // {
  //   path: "/moneyReturnEdit/:id",
  //   name: "moneyReturnEdit",
  //   component: () => import("../pages/cash/moneyReturn/show.vue"),
  // },
  {
    path: "/hr/recruitment",
    name: "recruitment",
    component: () => import("../pages/hr/recruitment/index.vue"),
  },
  {
    path: "/hr/dismissal",
    name: "dismissal",
    component: () => import("../pages/hr/dismissal/index.vue"),
  },
  {
    path: "/hr/dismissal/:id",
    name: "dismissalShow",
    component: () => import("../pages/hr/dismissal/show.vue"),
  },
  {
    path: "/hr/dismissalCreate",
    name: "dismissalCreate",
    component: () => import("../pages/hr/dismissal/create.vue"),
  },
  {
    path: "/hr/personnelMovement",
    name: "personnelMovement",
    component: () => import("../pages/hr/personnelMovement/index.vue"),
  },
  {
    path: "/hr/personnelMovementCreate",
    name: "personnelMovementCreate",
    component: () => import("../pages/hr/personnelMovement/create.vue"),
  },
  {
    path: "/hr/payroll",
    name: "payroll",
    component: () => import("../pages/hr/payingSalaries/index.vue"),
  },
  {
    path: "/hr/payingSalaries",
    name: "payingSalaries",
    component: () => import("../pages/hr/payingSalaries/index.vue"),
  },
  {
    path: "/hr/recruitmentCreate",
    name: "recruitmentCreate",
    component: () => import("../pages/hr/recruitment/create.vue"),
  },
  {
    path: "/hr/recruitment/:id",
    name: "recruitmentShow",
    component: () => import("../pages/hr/recruitment/show.vue"),
  },
  {
    path: "/hr/salaryInformation",
    name: "salaryInformation",
    component: () => import("../pages/hr/salaryInformation/index.vue"),
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
    path: "/list/userAccess/:id",
    name: "userAccess",
    component: () => import("../pages/list/user/access.vue"),
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
    path: "/list/good-images/:id",
    name: "goodImages",
    component: () => import("../pages/list/nomenclature/goodImages.vue"),
  },
  {
    path: "/list/createUpdateGood/:id",
    name: "createUpdateGood",
    component: () => import("../pages/list/nomenclature/createUpdateGood.vue"),
  },
  {
    path: "/documentHistory/:id",
    name: "documentHistory",
    component: () => import("../pages/documentHistory/index.vue"),
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