<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import counterpartyAgreementApi from "../../../api/counterpartyAgreement"
import counterpartyApi from "../../../api/counterparty"
import currencyApi from '../../../api/currency.js'
import organizationApi from "../../../api/organizationBill.js"
import showToast from '../../../composables/toast'


const router = useRouter()

const organizations = ref([])
const counterparties = ref([])
const currencies = ref([])
const payments = ref([])
const price_types = ref([])

const name = ref('')
const date = ref('')
const contact_person = ref('')
const comment = ref('')
const organization = ref('')
const counterparty = ref('')
const currency = ref('')
const payment = ref('')
const price_type = ref('')

const getOrganization = async () => {
  try {
    const { data } = await organizationApi.getAll();
    organizations.value = data.result;
    console.log(organizations.value, 'organization');
  }
  catch (e) {
    console.log(e);
  }
}

const getCounterprty = async () => {
  try {
    const { data } = await counterpartyApi.get()
    counterparties.value = data.result.data
    console.log(counterparties.value, 'counterpartyApi');
  }
  catch (e) {
    console.log(e);
  }
}

const getCurrency = async () => {
  try {
    const { data } = await currencyApi.get()
    currencies.value = data.result.data
    console.log(data, 'currency');
  }
  catch (e) {
    console.log(e);
  }
}

const getPayment = async () => {
  try {
    const { data } = await currencyApi.get()
    payments.value = data.result.data
    console.log(data, 'payment');
  }
  catch (e) {
    console.log(e);
  }
}

const getPriceType = async () => {
  try {
    const { data } = await currencyApi.get()
    price_types.value = data.result.data
    console.log(data, 'price');
  }
  catch (e) {
    console.log(e);
  }
}

const createCounterpartyAgreement = async () => {
  try {
    body = {
      name: name.value,
      contract_number: contract_number.value,
      date: date.value,
      organization_id: organization.value,
      counterparty_id: counterparty.value,
      contact_person: contact_person.value,
      currency_id: currency.value,
      payment_id: payment.value,
      comment: comment.value,
      price_type_id: price_type.value,
    }
    const res = await counterpartyAgreementApi.create(body)
    console.log(res);
  } catch (e) {
    console.log(e);
  }
}
onMounted(async () => {
  getOrganization()
  getCounterprty()
  getCurrency()
  getPayment()
  getPriceType()
})

const organizationProps = (item) => {
  return {
    title: item.name,
  }
}

const counterpartyProps = (item) => {
  return {
    title: item.name,
  }
}

const currencyProps = (item) => {
  return {
    title: item.name,
  }
}

const paymentProps = (item) => {
  return {
    title: item.name,
  }
}

const price_typeProps = (item) => {
  return {
    title: item.name,
  }
}

</script>
<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" color="info" @click.prevent="$router.push('counterpartyeAgreement')">Назад</v-btn>
    </div>
    <v-card class="block">
      <v-form @submit.prevent="createCounterpartyAgreement">
        <div class="d-flex ga-5">
          <v-text-field v-model="name" variant="outlined" label="Наименование"></v-text-field>
          <v-text-field v-model="date" variant="outlined" label="Дата"></v-text-field>
          <v-text-field v-model="contact_person" variant="outlined" label="Контактное лицо"></v-text-field>
          <v-text-field v-model="comment" variant="outlined" label="Комментарий"></v-text-field>
        </div>
        <div class="d-flex ga-5">
          <v-select v-model="organization" :items="organizations" :item-props="organizationProps"
            label="Организация"></v-select>
          <v-select v-model="counterparty" :items="counterparties" :item-props="counterpartyProps"
            label="Контрагент"></v-select>
          <v-select v-model="currency" :items="currencies" :item-props="currencyProps" label="Валюта договора"></v-select>
          <v-select v-model="payment" :items="payments" :item-props="paymentProps" label="Валюта оплаты"></v-select>
          <v-select v-model="price_type" :items="price_types" :item-props="price_typeProps" label="Тип валюты"></v-select>
        </div>
        <div class="d-flex justify-end mt-4">
          <v-btn rounded="lg" color="info" type="submit">Создать</v-btn>
        </div>
      </v-form>
    </v-card>
  </div>
</template>
<style scoped>
.block {
  border-radius: 6px;
  padding: 20px;
}
</style>