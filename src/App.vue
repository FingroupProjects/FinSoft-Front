<script setup>
import Header from "./components/header/Header.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";
import { ref } from "vue"

const rale = ref(false)

function toggleSidebar() {
  rale.value = !rale.value
}
</script>

<template>
  <v-app>
    <Header @rale="toggleSidebar" />
    <div class="content">
      <Sidebar :rale="rale" />
      <router-view />
    </div>
  </v-app>
</template>

<style scoped>
.content {
  display: flex;
  padding-top: 45px;
  background-color: #E8EDF0FF;
}
</style>