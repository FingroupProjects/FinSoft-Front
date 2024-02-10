<script setup>
import { ref, onMounted } from "vue"
import counterpartyApi from "../../../api/counterparty"

const loading = ref(true)
const counterparty = ref([])
const headers = ref([
  { title: 'Наименование', key: 'name', },
  { title: 'Адрес', key: 'address' },
  { title: 'Тип контрагента', key: 'roles' },
  { title: 'Телефон', key: 'phone' },
  { title: 'Эл. почта', key: 'email' },
  { title: 'Дата создания', key: 'created_at' },
]);

const formatDateTime = (dateTimeString) => {
  const dateTime = new Date(dateTimeString)
  return dateTime.toLocaleDateString('ru-RU')
}

const formatRole = (roles) => {
  const roleMap = {
    1: "Клиент",
    2: "Поставщик",
    3: "Прочие отношения"
  };

  return roles.map(role => roleMap[role] || "Неизвестная роль").join(", ");
};

const fetchCounterparty = async () => {
  try {
    const { data } = await counterpartyApi.getCounterparty()
    counterparty.value = data.result.map(item => ({
      ...item,
      created_at: formatDateTime(item.created_at),
      roles: formatRole(item.roles)
    }))
    loading.value = false
    console.log(counterparty.value)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchCounterparty()
})
</script>
<template>
  <div class="d-flex flex-column ga-5">
    <div class="d-flex justify-end">
      <v-btn rounded="lg" color="info" @click="$router.push('createCounterparty')">Создать</v-btn>
    </div>
    <v-card class="table">
      <v-data-table :items="counterparty" :headers="headers" :loading="loading"></v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.table {
  background: white;
  padding: 5px;
  border-radius: 16px;
  max-height: 90vh;
  overflow: auto;
}
</style>