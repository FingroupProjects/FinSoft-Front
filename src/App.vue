<script setup>
import Header from "./components/header/Header.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";
// import Admin_panel from "./components/sidebar/Admin_panel.vue";
import { ref } from "vue"

const rale = ref(false)

const isAdmin = ref(false)

function toggleAdmin() {
  isAdmin.value = !isAdmin.value
  console.log(isAdmin.value);
}

function toggleSidebar() {
  rale.value = !rale.value
}
</script>

<template>
  <v-app>
    <Header @rale="toggleSidebar" />
    <div class="content">
      <Sidebar @toggleAdmin="toggleAdmin" :rale="rale" />
      <!-- <Admin_panel v-if="isAdmin" /> -->
      <router-view />
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
</style>