<script setup>
import { useRoute } from 'vue-router'

import Header from "./components/header/Header.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Admin_panel from "./components/sidebar/Admin_panel.vue";
import { ref, watch } from "vue"

const rale = ref(false)
const isAdmin = ref(false)
const route = useRoute()
const isLayout = ref(true)

const toggleAdmin = () => {
  isAdmin.value = !isAdmin.value
}

const toggleSidebar = () => {
  rale.value = !rale.value
}


watch(route, (newVal) => {
  isLayout.value = !!newVal.meta.hideSideBarAndHeader;
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
        <Sidebar @toggleAdmin="toggleAdmin" @closeAdmin="isAdmin = false" :rale="rale" />
        <Admin_panel v-if="isAdmin" @close="isAdmin = false" :rale="rale" />
        <router-view class="w-100 px-4 py-4" />
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.content {
  display: flex;
  padding-top: 45px;
  background-color: #E8EDF0FF;
  position: relative;
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
  background-image: url('auth/login-bg.jpg');
  background-repeat: initial;
  background-attachment: initial;
  background-origin: initial;
  background-clip: initial;
  background-color: initial;
  background-size: cover !important;
  background-position: right top !important;
}
</style>