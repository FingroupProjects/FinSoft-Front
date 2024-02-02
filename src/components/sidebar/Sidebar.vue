<script setup>
import { ref, defineProps, onMounted } from 'vue'

const props = defineProps(['rale'])
const drawer = ref(true)

</script>

<template>
  <v-card class="sidebar">
    <v-layout>
      <v-navigation-drawer v-model="drawer" :rail="props.rale">

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item title="Планирование" value="home"><v-icon size="20">home</v-icon></v-list-item>
          <v-list-item title="Закупки товаров" value="account"><v-icon>basket</v-icon></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" title="Закупки товаров" value="users"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" title="Учет складов" value="users"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" title="Касса и банка" value="users"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" title="Зарплата и кадры" value="users"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" title="Финансов и анализ" value="users"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" title="Админ-панель " value="users"></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 100vw"></v-main>
    </v-layout>
  </v-card>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  padding-top: 45px
}
</style>
