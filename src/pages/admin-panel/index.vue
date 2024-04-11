<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(["rale"]);
const emit = defineEmits(['closeAdmin']);
const router = useRouter();
const users = ref([]);
const filteredLists = ref([]);
const filteredAdmins = ref([]);

const admins = ref([
  {
    id: 1,
    title: "Настройки",
    link: "/programSettings",
    icon: "settings",
  },
  { id: 2, title: "Заголовок программы", link: "", icon: "settings" },
]);

const lists = ref([
  {
    id: 1,
    title: "Справочники",
    child: [
      { id: 1, title: "Единица измерения", link: "/list/unit" },
      { id: 2, title: "Банковские счета", link: "/list/organizationBill" },
      { id: 3, title: "Номенклатура", link: "/list/nomenclature" },
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
  emit('closeAdmin')
  router.push(item.link);

}
onMounted(() => {
  users.value = JSON.parse(localStorage.getItem("user"));

  filteredLists.value = lists.value.map((list) => {
    return {
      ...list,
      child: list.child.filter((item) =>
        users.value.permissions.includes(item.link.slice(6) + ".read")
      ),
    };
  });

  filteredAdmins.value = admins.value.filter((item) =>
    users.value.permissions.includes(item.link.slice(1) + ".read")
  );
});
</script>

<template>
  <div style="background-color: #f2faff; width: 350px">
    <div class="title">
      <div v-for="list in filteredLists" :key="list.id">
        <ul class="list">
          <li class="text-uppercase text-black font-weight-regular">
            {{ list.title }}
          </li>
          <li
            @click="push(child)"
            class="d-flex align-center ga-4"
            v-for="child in list.child"
            :key="child.id"
          >
            <span class="cursor-pointer">
              {{ child.title }}
            </span>
          </li>
        </ul>
      </div>
      <div>
        <div class="mb-10" nav v-for="admin in filteredAdmins" :key="admin.id">
          <ul class="list">
            <li class="text-uppercase text-black font-weight-regular">
              {{ admin.title }}
            </li>
            <li class="d-flex align-center ga-4" @click="push(admin)">
              <span class="cursor-pointer">
                {{ admins[1].title }}
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

.title {
  color: #848484;
  font-size: 14px;
  font-family: "Inter", sans-serif;
  font-weight: 300;
}

ul {
  list-style: none;
}

.list {
  display: flex;
  flex-direction: column;
}

li {
  padding: 8px 20px 10px;
  border-bottom: 1px solid #c7c5c5;
}
li:hover {
  background: rgb(210, 211, 215);
  color: #08072E;
  font-weight: normal;
  cursor: pointer;
}
</style>
