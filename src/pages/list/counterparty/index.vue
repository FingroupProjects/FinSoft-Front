<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import counterpartyApi from "../../../api/counterparty"

const loading = ref(true)

const router = useRouter()

const counterparty = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id', align: 'start', },
  { title: 'Наименование', key: 'name', },
  { title: 'Адрес', key: 'address' },
  { title: 'Тип контрагента', key: 'roles' },
  { title: 'Телефон', key: 'phone' },
  { title: 'Эл. почта', key: 'email' },
  { title: 'Дата создания', key: 'created_at' },
  { title: '#', key: 'icons', align: 'center' },
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

const pushToRename = item => {
  router.push({ name: 'renameCounterparty', params: { id: item.id } })
}

const showDetail = item => {
  router.push({ name: 'detailCounterparty', params: { id: item.id } })
}

const fetchCounterparty = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { data } = await counterpartyApi.get(page, itemsPerPage, sortBy)
    console.log(data);
    counterparty.value = data.result.data.map(item => ({
      ...item,
      created_at: formatDateTime(item.created_at),
      roles: formatRole(item.roles)
    }))
    paginations.value = data.result.pagination
    loading.value = false
  } catch (error) {
    console.error(error)
  }
}

</script>
<template>
  <div>
    <v-col class="d-flex flex-column ga-5">
      <div class="d-flex w-100 justify-space-between">
        <div>
          <h2>Список контрагентов</h2>
        </div>
        <v-btn rounded="lg" color="info" @click="$router.push('createCounterparty')">Создать</v-btn>
      </div>
      <v-card class="table">
        <v-data-table-server :items="counterparty" :headers="headers" :loading="loading"
          items-per-page-text="Элементов на странице:" loading-text="Загрузка" no-data-text="Нет данных"
          @update:options="fetchCounterparty" v-model:items-per-page="paginations.per_page"
          :items-length="paginations.total || 0" :item-value="headers.title">
          <template v-slot:item.id="{ item, index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #item.icons="{ item }">
            <v-icon class="icon mr-2" @click="pushToRename(item)">edit</v-icon>
            <v-icon class="icon" @click="showDetail(item)">visibility</v-icon>
          </template>
        </v-data-table-server>
      </v-card>
    </v-col>
  </div>
</template>

<style scoped>
.icon {
  opacity: 75%;
}

.icon:hover {
  opacity: 100%;
}
</style>