<script setup>
import { ref, onMounted } from "vue"
import organizationBill from "../../../api/organizationBill.js"
import currency from "../../../api/currency.js";


const loading = ref(true)
const organizationBills = ref([])
const headers = ref([
  { title: 'Наименование', key: 'name', },
  { title: 'Счет', key: 'bill_number' },
  { title: 'Валюта', key: 'currency' },
  { title: 'Организация', key: 'organization' }
]);

const fetchCounterparty = async () => {
  try {
    const { data } = await organizationBill.index()
    loading.value = false
    organizationBills.value = data.result

    console.log(data)
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
      <v-btn rounded="lg" color="info" @click="$router.push({name: 'createOrganizationBill'})">Добавить</v-btn>
    </div>
    <v-card class="table">
      <v-data-table :items="organizationBills" :headers="headers" :loading="loading"></v-data-table>
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