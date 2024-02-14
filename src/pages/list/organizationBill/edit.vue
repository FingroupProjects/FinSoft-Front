<script setup>
import {onMounted, ref,} from "vue"
import { useRoute } from 'vue-router';
import organizationBill from "../../../api/organizationBill.js";
import currency from "../../../api/currency.js";
import organization from "../../../api/organizations.js";

const route = useRoute();


const organizationsBill = ref([])
const currencies = ref([])
const organizations = ref([])




const getDataById = async () => {
  try {
    const { data } = await organizationBill.getById(route.params.id)
    organizationsBill.value = data.result
    console.log(organizationsBill.value)
  } catch (e) {
    console.log(e);
  }
}

const fetchCurrency = async () => {
  try {
    const { data } = await currency.getCurrency();
    currencies.value = data.result;
  } catch (error) {
    console.error(error);
  }
}

const fetchOrganizations = async () => {
  try {
    const { data } = await organization.getAll()
    organizations.value = data.result

  } catch (error) {

  }
}

const currencyName = item => {
  return {
    title: item.name
  }
}

const organizationName = item => {
  return {
    title: item.name
  }
}

const update = async () => {
  try {
    const bodyData = {
      bill_number: body.value.bill_number,
      name: body.value.name,
      currency_id: body.value.currency.id,
      organization_id: body.value.organization.id
    }
    const res = await organizationBill.update(id.value, bodyData)
  } catch (error) {
    console.error(error)
  }
}
onMounted(async () => {
  await getDataById()
  await fetchOrganizations()
  await fetchCurrency()
})

</script>

<template>
  <div>
    <v-card  class="block">
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" color="info" @click="$router.push({name: 'organizationBill'})">Назад</v-btn>
    </div>
    <div>

      <div class="d-flex ga-5">
        <v-text-field variant="outlined" label="Наименование" v-model="organizationsBill.name" />
        <v-text-field variant="outlined" label="Номер счета" v-model="organizationsBill.bill_number" />
        <v-select :items="currencies" :item-props="currencyName" label="Выберите валюту"></v-select>
        <v-select :items="organizations" :item-props="organizationName" label="Выберите организацию"></v-select>
      </div>

      <div class="d-flex justify-end mt-4">
        <v-btn rounded="lg" color="info" @click="update()">Обновить</v-btn>
      </div>
    </div>
    </v-card>
  </div>
</template>

<style scoped>
.block {
  border-radius: 6px;
  padding: 20px;

}
</style>