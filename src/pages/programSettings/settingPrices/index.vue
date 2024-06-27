<script setup>
import { onMounted, ref } from "vue";
import settingPricesApi from "../../../api/list/settingPrices";
import Icons from "../../../composables/Icons/Icons.vue"

const paginations = ref([]);
const items = ref([]);
const markedID = ref([])

const search = ref('')
const loading = ref(true)

const headers = ref([
  { title: "Номер", key: "doc_number" },
  { title: "Дата", key: "start_date" },
  { title: "Статус", key: "active" },
  { title: "Клиент", key: "counterparty.name" },
  { title: "Организация", key: "organization.name" },
  { title: "Склад", key: "storage.name" },
  { title: "Автор", key: "author.name" },
  { title: "Валюта", key: "currency.name" },
]);

const getSettingPrices = async () => {
  try {
    const {
      data: { result },
    } = await settingPricesApi.getData();
    items.value = result.data;
    paginations.value = result.pagination;
    console.log(items.value);
    loading.value = false
  } catch (e) {
    console.error(e);
  }
};
</script>
<template>
  <div class="pa-4">
    <v-btn @click="$router.push('settingProcesCreate')">Создать</v-btn>
    <v-card>
      <v-data-table-server
        style="height: calc(100vh - 150px)"
        items-per-page-text="Элементов на странице:"
        loading-text="Загрузка"
        no-data-text="Нет данных"
        v-model:items-per-page="paginations.per_page"
        :loading="loading"
        :headers="headers"
        :items-length="paginations.total || 0"
        :items="items"
        :item-value="headers.title"
        :search="search"
       
        @update:options="getSettingPrices"
        page-text="{0}-{1} от {2}"
        :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        show-select
        fixed-header
        hover
      /> 
    </v-card>
  </div>
</template>
