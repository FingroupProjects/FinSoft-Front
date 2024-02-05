<script setup>
import { ref } from 'vue'

const admins = ref([
  { id: 1, title: 'Настройки программы', link: '' },
  { id: 2, title: 'Настройка разделов', link: '' },
]);

const lists = ref([
  {
    id: 1, title: 'Справочник', child: [
      { id: 1, title: 'Банковские Счета Организаций' },
      { id: 2, title: 'Валюты', link: '/list/currency' },
      { id: 3, title: 'Виды Цен' },
      { id: 4, title: 'Договоры Контрагентов' },
      { id: 5, title: 'Кассы' },
      { id: 6, title: 'Контрагенты' },
      { id: 7, title: 'Наборы Упаковок' },
      { id: 8, title: 'Номенклатура' },
      { id: 9, title: 'Организации' },
      { id: 10, title: 'Пользователи' },
      { id: 11, title: 'Прочие Расходы' },
      { id: 12, title: 'Склады' },
      { id: 13, title: 'Сотрудники' },
      { id: 14, title: 'Должность' },
    ]
  }
]);
</script>

<template>
  <div class="admin_panel">
    <div class="d-flex align-start">
      <div>
        <v-list v-for="list in lists" :key="list.id">
          <h2>{{ list.title }}</h2>
          <v-list nav v-for="child in list.child" :key="child.id">
            <v-list-item :title="child.title">

            </v-list-item></v-list>
        </v-list>
      </div>
      <div>
        <v-list nav v-for="admin in admins" :key="admin.id">
          <v-list-item :title="admin.title" @click="ff"></v-list-item>
        </v-list>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_panel {
  position: absolute;
  top: 47px;
  right: 0;
  width: calc(100vw - 260px);
  height: calc(100vh - 50px);
  background: white;
  box-shadow: 5px 5px 5px 5px rgb(58, 56, 56);
  z-index: 10;
  padding: 20px;
}
</style>