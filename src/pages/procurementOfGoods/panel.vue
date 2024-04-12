<script setup>
import { ref, defineProps, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(["procurementOfGoods"]);
const emit = defineEmits(["closeAdmin"]);
const router = useRouter();
const users = ref([]);
const filteredLists = ref([]);
const filteredAdmins = ref([]);

const admins = ref([
  {
    id: 1,
    title: "Отчеты",
    link: "/return",
    icon: "settings",
  },
  { id: 2, title: "Взаимодействие с клиентами", link: "", icon: "settings" },
  { id: 3, title: "АВС анализ", link: "", icon: "settings" },
  { id: 4, title: "Акт сверки с клиентами", link: "", icon: "settings" },
  { id: 5, title: "Отчет покупки киентов", link: "", icon: "settings" },
]);

const lists = ref([
  {
    id: 1,
    title: "Покупка",
    child: [
      { id: 1, title: "Покупка товаров", link: "/procurementOfGoods" },
      { id: 2, title: "Возврат постащику", link: "/providerOfGoods" },
      { id: 3, title: "Заказ поставщику", link: "" },
    ],
  },
]);

function push(item) {
  emit("close");
  router.push(item.link);
}

// onBeforeUnmount(() => {
//   window.onbeforeunload = () => {
//     return "У вас есть несохраненные данные. Вы уверены, что хотите покинуть страницу?";
//   };
// });

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
  <div
    class="sidebar"
    :class="props.procurementOfGoods ? 'open' : 'close fadeOut'"
    style="background-color: #f2faff"
  >
    <div class="title">
      <div v-for="list in lists" :key="list.id">
        <ul class="list">
          <span class="span text-uppercase text-black font-weight-regular">
            {{ list.title }}
          </span>
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
            <span class="span text-uppercase text-black font-weight-regular">
              {{ admin.title }}
            </span>
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

.sidebar {
  width: auto;
  transition: width 0.3s ease-in-out;
}

.open {
  width: 350px;
}

.close {
  width: 0;
  transition: width 0.3s ease-in-out;
}

.fadeOut {
  animation: fadeOut 0.2s ease-in-out forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    z-index: -111;
  }
}

.span {
  padding: 8px 20px 10px;
  border-bottom: 1px solid #c7c5c5;
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
  color: #08072e;
  font-weight: normal;
  cursor: pointer;
}
</style>
