<script setup>
import { ref, defineProps, onMounted } from "vue";
import Icons from "../../composables/Icons/Icons.vue";
import { useRouter } from "vue-router";

const props = defineProps(["rale"]);
const emit = defineEmits(["toggleAdmin", "closeAdmin"]);

const drawer = ref(true);
const router = useRouter();
const users = ref([]);
const filteredLists = ref([]);
const activeItemId = ref(null);

const menu = ref([
  { id: 1, title: "Планирование", icon: "planning", link: "/planning" },
  {
    id: 2,
    title: "Покупка",
    icon: "procurementOfGoods",
    link: "/procurementOfGoods",
  },
  {
    id: 3,
    title: "Продажа",
    icon: "sellingGoods",
    link: "/sellingGoods",
  },
  {
    id: 4,
    title: "Учет товаров",
    icon: "storage",
    link: "/warehouseAccounting",
  },
  { id: 5, title: "Деньги", icon: "cash", link: "/cash" },
  { id: 6, title: "HR-Зарплата", icon: "salary", link: "/salary" },
  {
    id: 7,
    title: "Финансы и  анализ",
    icon: "financeAnalysis",
    link: "/financeAnalysis",
  },
  { id: 8, title: "Настройки", icon: "adminPanel", link: "/adminPanel" },
]);

onMounted(() => {
  users.value = JSON.parse(localStorage.getItem("user"));

  filteredLists.value = menu.value.filter((item) =>
    users.value.permissions.includes(item.link.slice(1) + ".read")
  );
});

const push = (item) => {
  activeItemId.value = item.id;
  if (item.id === 8) emit("toggleAdmin");
  else {
    emit("closeAdmin");
    router.push(item.link);
  }
}
</script>

<template>
  <v-card class="sidebar">
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
            @click="push(item)"
            :class="item.id === activeItemId ? 'activeBg' : ''"
          >
            <v-list-item-title>
              <span :class="item.id === activeItemId ? 'active' : 'title'">{{
                item.title
              }}</span></v-list-item-title
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
.activeBg {
  background: #111165;
}
.active {
  color: rgb(214, 209, 209);
  font-family: "Inter", sans-serif;
  font-weight: 400;
}
.title {
  color: #848484;
  font-family: "Inter", sans-serif;
  font-weight: 300;
}

.icons {
  padding-right: 10px;
}

.admin:hover .icons {
  animation: 0.2s tremor ease;
}

@keyframes tremor {
  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(15deg);
  }

  75% {
    transform: rotate(-15deg);
  }
}
</style>
