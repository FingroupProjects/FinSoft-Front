<script setup>
import { ref, defineProps, onMounted, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Icons from "../../composables/Icons/Icons.vue";
import { useConfirmDocumentStore } from "../../store/confirmDocument.js";

const props = defineProps(["admin", "admins", "lists", "isChangedDocument"]);
const emit = defineEmits(["toggle", "changedDocument"]);
const router = useRouter();
const users = ref([]);
const filteredLists = ref([]);
const filteredAdmins = ref([]);
const showConfirmModal = ref(false)
const panelItem = ref({});
const confirmDocument = useConfirmDocumentStore()

watch(props.admins, (newVal) => {
  if (newVal) {
    filteredAdmins.value = props.admins.filter((item) =>
        users.value.permissions.includes(item.link.slice(1) + ".read")
    );
  }
});

watch(props.lists, (newVal) => {
  if (newVal) {
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
  panelItem.value = item
  if (props.isChangedDocument) {
    return showConfirmModal.value = true
  }
  emit("toggle");
  router.push(item.link);
}

const toggleChangedDocument = (action) => {

  showConfirmModal.value = false;
  if (action === 'cancel') {
    emit("changedDocument");
    router.push(panelItem.value.link);
  } else {
   confirmDocument.updateOrCreateDocument()
  }

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
              :class="child.link === $route.path ? 'active_list' : ''"
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
    <v-card>
      <v-dialog persistent class="mt-2 pa-2" v-model="showConfirmModal">
        <v-card
            style="max-width: 400px; border-radius: 16px"
            class="mx-auto flex flex-col"
        >
          <v-card-title
              class="d-flex justify-space-between align-center text-h6"
          >
            <span>Подтверждение</span>
            <v-btn
                @click="showConfirmModal = false"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
            >
              <Icons name="close" title="Закрыть" />
            </v-btn>
          </v-card-title>
          <v-card-text class="text-subtitle-1"
          >Сохранить текущие изменения?</v-card-text
          >
          <v-card-actions class="d-flex justify-end align-end">
            <v-btn
                @click="toggleChangedDocument('cancel')"
                class="text-none w-[200px] h-[20px]"
                color="red"
                variant="flat"
            >Нет</v-btn
            >
            <v-btn
                @click="toggleChangedDocument('updateOrCreate')"
                class="text-none w-[200px] h-[20px]"
                color="green"
                variant="flat"
            >Да</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>


    </v-card>
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

.active_list {
  color: #08072e;
  font-weight: 600;
}

.sidebar {
  max-height: 100vh;
  overflow: auto;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
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
  font-weight: 400;
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
  /* font-weight: normal; */
  cursor: pointer;
}
</style>
