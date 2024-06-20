<script setup>
import { ref, defineProps, onMounted } from "vue";
import Icons from "../../composables/Icons/Icons.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
const props = defineProps(["rale", "admin"]);
const emit = defineEmits([
  "toggleProcurementOfGoods",
  "toggleAdmin",
  "closeAdmin",
]);

const drawer = ref(true);
const router = useRouter();
const users = ref([]);
const filteredLists = ref([]);
const activeItemId = ref(null);

const list = ref({
  admins: [
    {
      id: 1,
      title: "Настройки",
      link: "/programSettings",
      icon: "settings",
      child: [
        {
          id: 1,
          title: "Заголовок программы",
          link: "/programSettings",
          icon: "settings",
        },
        {
          id: 2,
          title: "Смена языка",
          link: "/changeLanguage",
          icon: "settings",
        },
      ],
    },
  ],
  lists: [
    {
      id: 1,
      title: "Справочники",
      child: [
        { id: 1, title: "Единицы измерения", link: "/list/unit" },
        { id: 2, title: "Банковские счета", link: "/list/organizationBill" },
        { id: 3, title: "Графики работ", link: "/list/schedule" },
        { id: 5, title: "Пользователи", link: "/list/user" },
        { id: 7, title: "Контрагенты", link: "/list/counterparty" },
        { id: 8, title: "Организации", link: "/list/organization" },
        { id: 9, title: "Сотрудники", link: "/list/employee" },
        { id: 10, title: "Должности", link: "/list/position" },
        { id: 11, title: "Виды цен", link: "/list/priceType" },
        { id: 12, title: "Валюты", link: "/list/currency" },
        { id: 13, title: "Склады", link: "/list/storage" },
        { id: 14, title: "Кассы", link: "/list/cashRegister" },
        { id: 4, title: "Товары", link: "/list/nomenclature" },
      ],
    },
  ],
});

const dashboards = ref({
  lists: [
    {
      id: 1,
      title: "План продаж",
      link: "/",
      child: [
        { id: 1, title: "Товаров", link: "/planning/goods" },
        { id: 2, title: "Магазинов", link: "" },
        { id: 3, title: "Складов", link: "" },
      ],
    },
  ],
});

const procurementOfGoods = ref({
  admins: [
    {
      id: 1,
      title: "Отчеты",
      link: "/return",
      child: [
        {
          id: 1,
          title: "Взаимодействие с поставщиками",
          link: "/counterpartySettlement",
        },
        {
          id: 2,
          title: "Акт сверки с поставщиками",
          link: "/reconciliationReport",
        },
        { id: 3, title: "Отчет покупки поставщиков", link: "" },
      ],
    },
  ],
  lists: [
    {
      id: 1,
      title: "Покупка",
      child: [
        { id: 1, title: "Покупка товаров", link: "/procurementOfGoods" },
        { id: 2, title: "Возврат постащику", link: "/providerReturn" },
        { id: 3, title: "Заказ поставщику", link: "/providerOrder" },
        { id: 4, title: "Списание", link: "/writeOff" },
        { id: 5, title: "Оприходование", link: "/posting" },
        { id: 6, title: "Комплектация", link: "/equipment" },
      ],
    },
  ],
});

const saleOfGoods = ref({
  admins: [
    {
      id: 1,
      title: "Отчеты",
      link: "/",
      child: [
        { id: 1, title: "Взаиморасчет с клиентами", link: "" },
        { id: 2, title: "АВС анализ", link: "" },
        { id: 3, title: "Акт сверки с клиентами", link: "" },
        { id: 4, title: "Отчет покупки киентов", link: "" },
      ],
    },
  ],
  lists: [
    {
      id: 1,
      title: "Продажа",
      child: [
        { id: 1, title: "Продажа клиентам", link: "/sellingGoods" },
        { id: 2, title: "Возврат от клиентов", link: "/clientReturn" },
        { id: 3, title: "Заказ клиентов", link: "/clientOrder" },
      ],
    },
  ],
});

const storage = ref({
  admins: [
    {
      id: 1,
      title: "Отчеты",
      link: "/",
      child: [
        { id: 1, title: "Движение склада", link: "/remainderOfGoods" },
        { id: 2, title: "Остаток товаров", link: "" },
      ],
    },
  ],
  lists: [
    {
      id: 1,
      title: "Складской учет",
      child: [
        { id: 1, title: "Перемещение между складами", link: "/moveOfGoods" },
        { id: 2, title: "Инвентаризация склада", link: "/invertory" },
      ],
    },
  ],
});

const cash = ref({
  admins: [
    {
      id: 1,
      title: "Отчеты",
      link: "/",
      child: [
        { id: 1, title: "Движение деньги", link: "" },
        { id: 2, title: "Остаток деньги", link: "" },
      ],
    },
  ],
  lists: [
    {
      id: 1,
      title: "Деньги",
      child: [
        { id: 1, title: "Приход деньги", link: "/moneyComing" },
        { id: 2, title: "Расход деньги", link: "/moneyReturn" },
        { id: 3, title: "Приход рас. счета", link: "/bankComing" },
        { id: 4, title: "Расход рас. счета", link: "/bankSpend" },
      ],
    },
  ],
});

const salary = ref({
  admins: [
    {
      id: 1,
      title: "Отчеты",
      link: "/",
      child: [
        { id: 1, title: "Ведомость зарплаты", link: "/hr/salaryInformation" },
      ],
    },
  ],
  lists: [
    {
      id: 1,
      title: "Кадр",
      child: [
        { id: 1, title: "Прием на работу", link: "/hr/recruitment" },
        { id: 2, title: "Кадровое перемещение", link: "/hr/personnelMovement" },
        { id: 2, title: "Увольнение", link: "/hr/dismissal" },
      ],
    },
    {
      id: 2,
      title: "Зарплата",
      child: [
        { id: 1, title: "Начисление зарплаты", link: "/hr/payroll" },
        { id: 2, title: "Оплата зарплаты", link: "/hr/payingSalaries" },
        { id: 3, title: "Табель", link: "/hr/timeSheet" },
      ],
    },
  ],
});

const menu = ref([
  {
    id: 1,
    title: "Дашборд",
    icon: "home",
    link: "/planning",
    key: "dashboard",
  },
  {
    id: 2,
    title: "Покупка",
    icon: "procurementOfGoods",
    link: "/procurementOfGoods",
    key: "procurement",
  },
  {
    id: 3,
    title: "Продажа",
    icon: "sellingGoods",
    link: "/sellingGoods",
    key: "selling",
  },
  {
    id: 4,
    title: "Учет товаров",
    icon: "financeAnalysis",
    link: "/warehouseAccounting",
    key: "accountingOfGoods",
  },
  { id: 5,
    title: "Деньги", 
    icon: "cash", 
    link: "/cash", 
    key: "money" },
  {
    id: 6,
    title: "HR-Зарплата",
    icon: "salary",
    link: "/salary",
    key: "salary",
  },
  {
    id: 7,
    title: "Настройки",
    icon: "adminPanel",
    link: "/adminPanel",
    key: "settings",
  },
]);

onMounted(() => {
  users.value = JSON.parse(localStorage.getItem("user"));

  filteredLists.value = menu.value.filter((item) =>
    users.value.permissions.includes(item.link.slice(1) + ".read")
  );
});

const push = (item) => {
  activeItemId.value = item.id;
  if (item.id === 1) emit("toggleAdmin", dashboards.value);
  else if (item.id === 2) emit("toggleAdmin", procurementOfGoods.value);
  else if (item.id === 3) emit("toggleAdmin", saleOfGoods.value);
  else if (item.id === 4) emit("toggleAdmin", storage.value);
  else if (item.id === 5) emit("toggleAdmin", cash.value);
  else if (item.id === 6) emit("toggleAdmin", salary.value);
  else if (item.id === 7) emit("toggleAdmin", list.value);
  else {
    emit("closeAdmin");
    router.push(item.link);
  }
};
</script>

<template>
  <v-card :class="props.rale ? 'isClose' : 'isOpen'" class="sidebar">
    <v-layout class="side">
      <v-navigation-drawer
        :width="320"
        v-model="drawer"
        color="#08072E"
        permanent
        :rail="props.rale"
      >
        <v-list density="comfortable">
          <v-list-item
            v-for="item in filteredLists"
            :key="item.id"
            @click="
              item.id === activeItemId && props.admin
                ? $emit('closeAdmin')
                : push(item)
            "
            :class="item.id === activeItemId ? 'activeBg' : ''"
          >
            <v-list-item-title>
              <span :class="item.id === activeItemId ? 'active_sidebar' : 'title'">
                {{ $t(`menu.${item.key}`) }}
              </span>
            </v-list-item-title
            >
            <template v-slot:prepend>
              <Icons
                class="icons"
                :color="item.id === activeItemId ? 'white' : ''"
                :name="item.icon"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 100vh"> </v-main>
    </v-layout>
  </v-card>
</template>

<style scoped>
.sidebar {
  border: none;
  box-shadow: none;
  border-radius: 0%;
}

.isClose {
  min-width: 55px;
  max-width: 55px;
}

.isOpen {
  min-width: 270px;
  max-width: 270px;
}

.activeBg {
  background: #111165;
}

.active_sidebar {
  color: rgb(214, 209, 209);
  font-family: "Inter", sans-serif;
  font-weight: 400;
}

.title {
  color: #e8d9d9;
  font-family: "Inter", sans-serif;
  font-weight: 300;
}

.icons {
  padding-right: 10px;
}
</style>
