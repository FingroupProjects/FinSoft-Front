<script setup>
import {onMounted, ref,} from "vue"
import { useRouter } from "vue-router";
import organizationBill from "../../../api/list/organizationBill.js";
import currency from "../../../api/list/currency.js";
import organization from "../../../api/list/organizations.js";

const currencies = ref([])
const organizations = ref([])
const digitalCodes = ref([])

const router = useRouter()
const name = ref('')
const bill_number = ref('')
const currency_id = ref('')
const currency_name = ref('')
const organization_id = ref('')

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

const fetchOrganizations = async () => {
  try {
    const { data } = await organization.index()
    organizations.value = data.result

  } catch (error) {
    console.error(error)
  }
}


const create = async () => {
  try {
    const body = {
      name: name.value,
      bill_number: bill_number.value,
      currency_id: ID._rawValue.id,
      organization_id: OrganizationID._rawValue.id
    }
    console.log(body);
    const res = await organizationBill.create(body)
    console.log(res)

    router.push({name: 'organizationBill'})
  } catch (error) {
    console.error(error)
  }
}
onMounted(() => {
  fetchOrganizations()
  fetchCurrency()
})

</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" :color="BASE_COLOR" @click="$router.push({name: 'organizationBill'})">Назад</v-btn>
    </div>
    <div class="block">

      <div class="d-flex ga-5">
        <v-text-field variant="outlined" label="Наименование" v-model="name" />
        <v-text-field variant="outlined" label="Номер счета" v-model="bill_number" />
        <v-select :items="currencies" :item-props="itemProps" v-model="ID" label="Выберите валюту"></v-select>
        <v-select :items="organizations" :item-props="organizationProps" v-model="OrganizationID" label="Выберите организацию"></v-select>

      </div>

      <div class="d-flex justify-end mt-4">
        <v-btn rounded="lg" :color="BASE_COLOR" @click="create()">Создать</v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block {
  background: white;
  border-radius: 6px;
  padding: 20px;

}
</style>