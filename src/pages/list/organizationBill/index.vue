<script setup>
import { ref, onMounted } from "vue"
import organizationBill from "../../../api/organizationBill.js"
import { useRouter } from "vue-router"

const router = useRouter()

const loading = ref(true)
const organizationBills = ref([])

const headers = ref([
  { title: 'Наименование', key: 'name', },
  { title: 'Счет', key: 'bill_number' },
  { title: 'Валюта', key: 'currencyName' },
  { title: 'Организация', key: 'organizationName' },
  { title: '#', key: 'icons' },
]);


const fetchCounterParty = async () => {
  try {
    const { data } = await organizationBill.getAll()
    loading.value = false

    organizationBills.value = data.result.map(item => ({
      ...item,
      currencyName: item.currency.name,
      organizationName: item.organization.name
    }))

    console.log(data)
  } catch (error) {
    console.error(error)
  }
}

const pushToEdit = item => {
  router.push({ name: 'editOrganizationBill', params: { id: item.id } })
}

onMounted(() => {
  fetchCounterParty()
})

</script>
<template>
  <div class="d-flex flex-column ga-5">
    <div class="d-flex justify-end">
      <v-btn rounded="lg" color="info" @click="$router.push({name: 'createOrganizationBill'})">Добавить</v-btn>
    </div>
    <v-card class="table">
      <v-data-table :items="organizationBills" :headers="headers" :loading="loading">
        <template #item.icons="{ item }">
          <v-icon class="icon" @click="pushToEdit(item)">edit</v-icon>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped></style>