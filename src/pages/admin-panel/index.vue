<script setup>
import { ref, defineProps, onMounted, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(["admin", "admins", "lists"]);
const emit = defineEmits(["toggle"]);
const router = useRouter();
const users = ref([]);
const filteredLists = ref([]);
const filteredAdmins = ref([]);

watch(props.admins, (newVal) => {
  if (newVal) {
    console.log("admins");
    filteredAdmins.value = props.admins.filter((item) =>
      users.value.permissions.includes(item.link.slice(1) + ".read")
    );
  }
});

watch(props.lists, (newVal) => {
  if (newVal) {
    console.log("lists");
    filteredLists.value = props.lists.map((list) => {
      return {
        ...list,
        child: list.child.filter((item) =>
          users.value.permissions.includes(item.link.slice(6) + ".read")
        ),
      };
    });
  }
});

function push(item) {
  emit("toggle");
  router.push(item.link);
}

onMounted(() => {
  users.value = JSON.parse(localStorage.getItem("user"));
});
</script>

<template>
  <div
    class="sidebar"
    :class="props.admin ? 'open' : 'close fadeOut'"
    style="background-color: #f2faff"
  >
    <div class="title">
      <div v-for="list in props.lists" :key="list.id">
        <ul class="list">
          <span class="span text-uppercase text-black font-weight-regular">
            {{ list.title }}
          </span>
          <li
            @click="push(child)"
            :class="child.link === $route.path ? 'active' : ''"
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
        <div v-for="list in props.admins" :key="list.id">
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
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 3px;
  border-radius: 50px;
  background: #c7c5c5;
  transition: width 20s ease-in-out;
}

.sidebar:hover ::-webkit-scrollbar {
  transition: width 20s ease-in-out;
  width: 8px;
}

.active {
  color: #08072e;
  font-weight: 600;
}

.sidebar {
  max-height: 100vh;
  overflow: auto;
}

::-webkit-scrollbar-thumb {
  background: #08072e;
  border-radius: 50px;
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
  max-height: 92vh;
  overflow: auto;
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
