<script setup>
import { ref, defineProps, defineEmits, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(["rale"]);
const router = useRouter();
const emit = defineEmits();

const admins = ref([
  {
    id: 1,
    title: "Настройки программы",
    link: "/programSettings",
    icon: "settings",
  },
  { id: 2, title: "Настройка разделов", link: "", icon: "settings" },
]);

const lists = ref([
  {
    id: 1,
    title: "Справочники",
    child: [
      { id: 1, title: "Единица измерения", link: "/list/unit" },
      { id: 2, title: "Банковские счета", link: "/list/organizationBill" },
      { id: 3, title: "Номенклатура", link: "/list/nomenclatureGroup" },
      { id: 4, title: "Пользователи", link: "/list/user" },
      { id: 5, title: "Контрагенты", link: "/list/counterparty" },
      { id: 6, title: "Организации", link: "/list/organization" },
      { id: 7, title: "Сотрудники", link: "/list/employee" },
      { id: 8, title: "Должность", link: "/list/position" },
      { id: 9, title: "Виды цен", link: "/list/priceType" },
      { id: 10, title: "Валюты", link: "/list/currency" },
      { id: 11, title: "Склады", link: "/list/storage" },
      { id: 12, title: "Кассы", link: "/list/cashRegister" },
    ],
  },
]);

function push(item) {
  router.push(item.link);
}
</script>

<template>
  <div class="">
    <div class="panel align-start ga-10 pa-4">
      <div v-for="list in lists" :key="list.id">
        <h3 class="text-uppercase mb-4">{{ list.title }}</h3>
        <ul class="list">
          <li
            class="d-flex align-center ga-4 cursor-pointer"
            v-for="child in list.child"
            :key="child.id"
            @click="push(child)"
          >
            <span>
              {{ child.title }}
            </span>
          </li>
        </ul>
      </div>
      <div>
        <div class="mb-10" nav v-for="admin in admins" :key="admin.id">
          <h3 class="text-uppercase mb-4">{{ admin.title }}</h3>
          <ul class="list">
            <li
              class="d-flex align-center ga-4 cursor-pointer"
              @click="push(admin)"
            >
              <span>
                {{ admin.title }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 12px;
  border-radius: 50px;
}

::-webkit-scrollbar-thumb {
  background: #c7c5c5;
  border-radius: 50px;
}

.panel {
  display: grid;
  grid-template-columns: repeat(3, 2fr);
}

ul {
  list-style: none;
}

.list {
  display: flex;
  flex-direction: column;
}

li {
  padding: 8px 10px;
  font-size: 18px;
}

span:hover {
  color: #3ab700;
}
</style>
