import {component} from  "vue";

const routes = [
  {
    path: "/",
    name: "mainpage",
    component: () => import("../pages/mainpage/index.vue"),
    meta: {
      hideSideBarAndHeader: true,
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import("../pages/homepage/index.vue"),
  },

  {
    path: "/planning/goods",
    name: "planningGoods",
    component: () =>
      import("../pages/dashboard/planning/goods/index.vue"),
  },
  {
    path: "/planning/goods/:id",
    name: "planningGoodsShow",
    component: () => import("../pages/dashboard/planning/goods/show.vue"),
  },
  {
    path: "/planning/goods/create",
    name: "planningGoodsCreate",
    component: () => import("../pages/dashboard/planning/goods/create.vue"),
  },
  {
    path: "/planning/shops",
    name: "planningShops",
    component: () =>
      import("../pages/dashboard/planning/shops/index.vue"),
  },
  {
    path: "/planning/shops/create",
    name: "planningShopsCreate",
    component: () => import("../pages/dashboard/planning/shops/create.vue"),
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
    component: () => import("../pages/procurement/procurementOfGoods/create.vue"),
  },

  {
    path: "/writeOff",
    name: "writeOff",
    component: () =>
      import("../pages/procurement/writeOff/index.vue"),
  },
  {
    path: "/writeOff/:id",
    name: "writeOffShow",
    component: () => import("../pages/procurement/writeOff/show.vue"),
  },
  {
    path: "/writeOff/create",
    name: "writeOffCreate",
    component: () => import("../pages/procurement/writeOff/create.vue"),
  },
  {
    path: "/equipment",
    name: "equipment",
    component: () => import("../pages/procurement/equipment/index.vue"),
  },
  {
    path: "/equipment/:id",
    name: "equipmentShow",
    component: () => import("../pages/procurement/equipment/show.vue"),
  },
  {
    path: "/equipment/create",
    name: "equipmentCreate",
    component: () => import("../pages/procurement/equipment/create.vue"),
  },
  {
    path: "/posting",
    name: "posting",
    component: () =>
      import("../pages/procurement/posting/index.vue"),
  },
  {
    path: "/posting/:id",
    name: "postingShow",
    component: () => import("../pages/procurement/posting/show.vue"),
  },
  {
    path: "/posting/create",
    name: "postingCreate",
    component: () => import("../pages/procurement/posting/create.vue"),
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
    path: "/remainderOfGoods",
    name: "remainderOfGoods",
    component: () => import("../pages/reports/goods/remainderOfGoods.vue")
  },
  {
    path: "/counterpartySettlement",
    name: "counterpartySettlement",
    component: () => import("../pages/reports/provider/counterpartySettlement.vue")
  },
  {
    path: '/reconciliationReport',
    name: 'reconciliationReport',
    component: () => import("../pages/reports/providerReconciliation/reconciliationReport.vue")
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
    path: "/sellingGoods/Create",
    name: "sellingGoodsCreate",
    component: () => import("../pages/selling/sellingGoods/create.vue"),
  },
  {
    path: "/sellingGoods/:id",
    name: "sellingGoodsShow",
    component: () => import("../pages/selling/sellingGoods/show.vue"),
  },
  {
    path: "/invertory",
    name: "invertory",
    component: () => import("../pages/storage/inventor/index.vue"),
  },
  {
    path: "/invertoryCreate",
    name: "invertoryCreate",
    component: () => import("../pages/storage/inventor/create.vue"),
  },
  {
    path: "/InvertoryEdit/:id",
    name: "InvertoryEdit",
    component: () => import("../pages/storage/inventor/show.vue"),
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
  {
    path: "/moneyReturnEdit/:id",
    name: "moneyReturnEdit",
    component: () => import("../pages/cash/moneyReturn/show.vue"),
  },
  {
    path: "/bankComing",
    name: "bankComing",
    component: () => import("../pages/bank/bankComing/index.vue"),
  },
  {
    path: "/bankComingCreate",
    name: "bankComingCreate",
    component: () => import("../pages/bank/bankComing/create.vue"),
  },
  {
    path: "/bankComingEdit/:id",
    name: "bankComingEdit",
    component: () => import("../pages/bank/bankComing/show.vue"),
  },
  {
    path: "/bankSpend",
    name: "bankSpend",
    component: () => import("../pages/bank/bankSpend/index.vue"),
  },
  {
    path: "/bankSpendCreate",
    name: "bankSpendCreate",
    component: () => import("../pages/bank/bankSpend/create.vue"),
  },
  {
    path: "/bankSpendEdit/:id",
    name: "bankSpendEdit",
    component: () => import("../pages/bank/bankSpend/show.vue"),
  },
  {
    path: "/hr/recruitment",
    name: "recruitment",
    component: () => import("../pages/hr/recruitment/index.vue"),
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
    path: "/hr/personnelMovement/:id",
    name: "personnelMovementShow",
    component: () => import("../pages/hr/personnelMovement/show.vue"),
  },
  {
    path: "/hr/personnelMovementCreate",
    name: "personnelMovementCreate",
    component: () => import("../pages/hr/personnelMovement/create.vue"),
  },
  {
    path: "/hr/payroll",
    name: "payroll",
    component: () => import("../pages/hr/payroll/index.vue"),
  },
  {
    path: "/hr/payroll/:id",
    name: "payrollShow",
    component: () => import("../pages/hr/payroll/show.vue"),
  },
  {
    path: "/hr/payrollCreate",
    name: "payrollCreate",
    component: () => import("../pages/hr/payroll/create.vue"),
  },
  {
    path: "/hr/timeSheet",
    name: "timeSheet",
    component: () => import("../pages/hr/timeSheet/index.vue"),
  },
  {
    path: "/hr/timeSheet/:id",
    name: "timeSheetShow",
    component: () => import("../pages/hr/timeSheet/show.vue"),
  },
  {
    path: "/hr/timeSheetCreate",
    name: "timeSheetCreate",
    component: () => import("../pages/hr/timeSheet/create.vue"),
  },
  {
    path: "/hr/payingSalaries",
    name: "payingSalaries",
    component: () => import("../pages/hr/payingSalaries/index.vue"),
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
    path: "/list/schedule",
    name: "schedule",
    component: () => import("../pages/list/schedule/index.vue"),
  },
  {
    path: "/list/counterparty",
    name: "counterparty",
    component: () => import("../pages/list/counterparty/index.vue"),
  },
  {
    path: "/list/counterparty/coordinates/:id",
    name: "counterpartyCounterpartyMap",
    component: () => import("../pages/list/counterparty/map.vue"),
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
    path: "/changeLanguage",
    name: "changeLanguage",
    component: () => import("../pages/programSettings/changeLanguage.vue"),
  },
  {
    path: "/settingPrices",
    name: "settingPrices",
    component: () => import("../pages/programSettings/settingPrices/index.vue")
  },
  {
    path: "/settingUpPricesOfGoods",
    name: "settingUpPricesOfGoods",
    component: () => import("../pages/programSettings/settingPrices/settingUpPricesOfGoods.vue")
  },
  {
    path: "/settingProcesCreate",
    name: "settingProcesCreate",
    component: () => import("../pages/programSettings/settingPrices/create.vue")
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
    path: "/documentPrint/:id/:title",
    name: "documentPrint",
    component: () => import("../pages/documentPrint/index.vue"),
    meta: {
      hideSideBarAndHeader: true,
    },
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
