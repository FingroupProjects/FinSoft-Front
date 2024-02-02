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
    <div class="d-flex">
      <Sidebar :rale="rale" />
      <router-view />
    </div>
  </v-app>
</template>

<style scoped></style>