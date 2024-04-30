<script setup>
import { useRoute } from "vue-router";
import {ref, watch, onMounted} from "vue";
import Header from "./components/header/Header.vue";
import showToast from "./composables/toast/index.js";
import AdminPanel from "./pages/admin-panel/index.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";
import warningModal from "./components/paymentWarning/warningModal.vue";

const rale = ref(true);
const procurementOfGoods = ref(false);
const admin = ref(false);
const route = useRoute();
const isLayout = ref(true);
const lists = ref([]);
const admins = ref([]);
const isChangedDocument = ref(false)
const isUpdateOrCreateDocument = ref(false)

const toggleSidebar = () => {
  rale.value = !rale.value;
};

const toggleAdmin = (data) => {
  lists.value = data.lists;
  admins.value = data.admins;
  admin.value = true;
};

watch(route, (newVal) => {
  isLayout.value = !!newVal.meta.hideSideBarAndHeader;
});

window.addEventListener("load", () => {
  window.addEventListener("online", () => {
    showToast("Подключение восстановлена!", "green", 3500)
  })

  window.addEventListener("offline", () => {
    showToast("Отсутствует интернет соединение!", "red", 600000)
  })
})

const changed = data => {
  // console.log(data)
  return isChangedDocument.value = data
}

</script>

<template>
  <v-app v-cloak>
    <div v-if="isLayout">
      <div class="bg_auth">
        <router-view />
      </div>
    </div>
    <div v-else>
      <Header @rale="toggleSidebar" />
      <div class="content">
        <Sidebar
          style="z-index: 5"
          @toggleProcurementOfGoods="procurementOfGoods = !procurementOfGoods"
          @toggleAdmin="toggleAdmin"
          @closeAdmin="admin = false"
          :rale="rale"
          :admin="admin"
        />
        <AdminPanel
          class="panel"
          @changedDocument="isChangedDocument = false"
          :isChangedDocument="isChangedDocument"
          :class="{ active: admin }"
          :admins="admins"
          :lists="lists"
          :admin="admin"
          @toggle="admin = !admin"
        />
        <warningModal />
        <router-view class="w-100 block" @changed="changed"/>
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.content {
  display: flex;
  padding-top: 45px;
  height: 100vh;
  background-color: #e8edf0ff;
}

.block {
  max-height: 100vh;
  overflow: auto;
}

.bg_auth {
  width: 100%;
  height: 100vh;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  position: relative;
  background-image: url("assets/svg/auth/login-bg.jpg");
  background-repeat: initial;
  background-attachment: initial;
  background-origin: initial;
  background-clip: initial;
  background-color: initial;
  background-size: cover !important;
  background-position: right top !important;
}

.panel {
  position: relative;
  top: 0;
  left: -100%;
  width: 0px;
  height: 100vh;
  background-color: white;
  transition: left 0.2s ease-in-out, width 0.2s ease-in-out;
  z-index: 1;
}

.panel.active {
  left: 0;
  width: 360px;
  display: block;
}
</style>
