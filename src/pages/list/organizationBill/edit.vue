<script setup>
import {onMounted, ref,} from "vue"
import organizationBill from "../../../api/organizationBill.js";
import currency from "../../../api/currency.js";
import organization from "../../../api/organizations.js";import { useRoute } from 'vue-router';

const route = useRoute();



const currencies = ref([])
const organizations = ref([])
const digitalCodes = ref([])

const id = ref(null)

const body = ref({
  name: "",
  bill_number: "",
  currency: {
    digital_code: "",
    id: ""
  },

  organization: {
    name: "",
    id: ""
  }
})

const fetchCurrency = async () => {
  try {
    const { data } = await currency.getCurrency();
    currencies.value = data.result;
    console.log(currencies.value)
  } catch (error) {
    console.error(error);
  }
}

const ID = ref(null)
const OrganizationID = ref(null)


const itemProps = (item) => {
  return {
    title: item.digital_code,
  }
}
const organizationProps = (item) => {
  return {
    title: item.name,
  }
}

const getId = async () => {
  try {
    const { data } = await organizationBill.getById(id.value)
    body.value = data.result
    console.log(body.value)
  } catch (e) {
    console.log(e);
  }
}

const fetchOrganizations = async () => {
  try {
    const { data } = await organization.index()
    organizations.value = data.result

  } catch (error) {

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
    console.log(res)
  } catch (error) {
    console.error(error)
  }
}
onMounted(() => {
    id.value = route.params.id;
    getId()

  fetchOrganizations()
  fetchCurrency()
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
        <v-text-field variant="outlined" label="Наименование" v-model="body.name" />
        <v-text-field variant="outlined" label="Номер счета" v-model="body.bill_number" />
        <v-select :items="currencies" :item-props="itemProps" v-model="body.currency" label="Выберите валюту"></v-select>
        <v-select :items="organizations" :item-props="organizationProps" v-model="body.organization" label="Выберите организацию"></v-select>
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