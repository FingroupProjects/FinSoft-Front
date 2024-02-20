<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import counterpartyAgreement from "../../../api/counterpartyAgreement"

const router = useRouter()

const loading = ref(true)

const result = ref([])
const pagination = ref([])

const headers = ref([
  { title: '№', key: 'id', align: 'start', },
  { title: 'Наименование', key: 'name', },
  { title: 'Контактное лицо', key: 'contact_person' },
  { title: 'Номер контракта', key: 'contract_number' },
  { title: 'Дата', key: 'date' },
  { title: 'Комментарий', key: 'comment' },
  { title: 'Контрагент', key: 'counterparty_id.name' },
  { title: 'Валюта договора', key: 'currency_id.symbol_code' },
  { title: 'Организация', key: 'organization_id.name' },
  { title: 'Валюта оплаты', key: 'payment_id.symbol_code' },
  { title: 'Тип валюты', key: 'price_type_id.name' },
  // { title: '#', key: 'icons', align: 'center' },
]);

const getDocuments = async ({ page, itemsPerPage, sortBy }) => {
  try {
    loading.value = true
    const { data } = await counterpartyAgreement.get(page, itemsPerPage, sortBy)
    result.value = data.result.data
    pagination.value = data.result.pagination
    loading.value = false
  }
  catch (e) {
    console.log(e);
  }
}

</script>

<template>
  <div>
    <v-col class="d-flex flex-column ga-5">
      <div class="d-flex w-100 justify-space-between">
        <div>
          <h2>Договоры контрагентов</h2>
        </div>
        <v-btn rounded="lg" color="info" @click="$router.push('createCounterpartyAgreement')">Добавить</v-btn>
      </div>
      <v-card class="table">
        <v-data-table-server :items="result" :headers="headers" :loading="loading"
          items-per-page-text="Элементов на странице:" loading-text="Загрузка" no-data-text="Нет данных"
          @update:options="getDocuments" v-model:items-per-page="pagination.per_page"
          :items-length="pagination.total || 0" :item-value="headers.title">
          <template v-slot:item.id="{ item, index }">
            <span>{{ index + 1 }}</span>
          </template>
          <!-- <template #item.icons="{ item }">
            <div class="d-flex">

              <v-icon color="info" class="icon mr-2" @click="pushToRename(item)">edit</v-icon>
              <v-icon color="info" class="icon" @click="showDetail(item)">visibility</v-icon>
            </div>

          </template> -->
        </v-data-table-server>
      </v-card>
    </v-col>
  </div>
</template>
<style scoped></style>