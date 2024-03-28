<script setup>
import { useRoute } from 'vue-router'

import Header from "./components/header/Header.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";

import { ref, watch } from "vue"
import showToast from "./composables/toast/index.js";


const rale = ref(false)
const route = useRoute()
const isLayout = ref(true)

const toggleSidebar = () => {
  rale.value = !rale.value
}

watch(route, (newVal) => {
  isLayout.value = !!newVal.meta.hideSideBarAndHeader;
})

window.addEventListener('load', () => {

  window.addEventListener('online', () => {
    showToast('Подключение восстановлена!', 'green', 3500)
  })

  window.addEventListener('offline', () => {
    showToast('Отсутствует интернет соединение!', 'red', 600000)
  })
})

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
        <Sidebar :rale="rale" />
        <router-view class="w-100 block" />
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.content {
  display: flex;
  padding-top: 45px;
  height: 100vh;
  background-color: #E8EDF0FF;
  position: relative;
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
  background-image: url('assets/svg/auth/login-bg.jpg');
  background-repeat: initial;
  background-attachment: initial;
  background-origin: initial;
  background-clip: initial;
  background-color: initial;
  background-size: cover !important;
  background-position: right top !important;
}
</style>