<script setup>
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import counterpartyAgreementApi from "../../../api/counterpartyAgreement"
import counterpartyApi from "../../../api/counterparty"
import currencyApi from '../../../api/currency.js'
import organizationApi from "../../../api/organizations.js"
import priceTypeApi from "../../../api/priceType.js"
import showToast from '../../../composables/toast'
import changeTheDateForSending from '../../../composables/date/changeTheDateForSending'
import showDate from '../../../composables/date/showDate'

const router = useRouter()
const route = useRoute();

const organizations = ref([])
const counterparties = ref([])
const currencies = ref([])
const payments = ref([])
const price_types = ref([])

const form = ref({
  name: '',
  date: '',
  contact_person: '',
  comment: '',
  organization_id: '',
  counterparty_id: '',
  currency_id: '',
  payment_id: '',
  price_type_id: '',
})


const getById = async () => {
  try {
    const { data } = await counterpartyAgreementApi.getById(route.params.id)
    const formattedDate = new Date(data.result.date).toISOString().split('T')[0];
    form.value = { ...data.result, date: formattedDate };
  } catch (e) {
    console.log(e);
  }
}

const getOrganization = async () => {
  try {
    const { data } = await organizationApi.getAll({ itemsPerPage: 10000 });
    organizations.value = data.result.data;
  }
  catch (e) {
    console.log(e);
  }
}

const getCounterparty = async () => {
  try {
    const { data } = await counterpartyApi.get({ itemsPerPage: 10000 })
    counterparties.value = data.result.data
  }
  catch (e) {
    console.log(e);
  }
}

const getCurrency = async () => {
  try {
    const { data } = await currencyApi.get({ itemsPerPage: 10000 })
    currencies.value = data.result.data
  }
  catch (e) {
    console.log(e);
  }
}

const getPayment = async () => {
  try {
    const { data } = await currencyApi.get({ itemsPerPage: 10000 })
    payments.value = data.result.data
  }
  catch (e) {
    console.log(e);
  }
}

const getPriceType = async () => {
  try {
    const { data } = await priceTypeApi.get({ itemsPerPage: 10000 })
    price_types.value = data.result.data
  }
  catch (e) {
    console.log(e);
  }
}

const updateCounterpartyAgreement = async () => {
  try {
    const body = {
      name: form.value.name,
      date: changeTheDateForSending(form.value.date, '-'),
      organization_id: form.value.organization_id,
      counterparty_id: form.value.counterparty_id,
      contact_person: form.value.contact_person,
      contract_number: '00002',
      currency_id: form.value.currency_id,
      payment_id: form.value.payment_id,
      comment: form.value.comment,
      price_type_id: form.value.price_type_id,
    }
    console.log(body);
    const res = await counterpartyAgreementApi.update(body)
    showToast('Успешно обновлено')
    router.push({ name: 'counterpartyeAgreement' })
  } catch (e) {
    console.log(e);
  }
}

onMounted(async () => {
  await getById()
  await getOrganization()
  await getCounterparty()
  await getCurrency()
  await getPayment()
  await getPriceType()
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

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения',
  date: v => (v && /^\d{4}.\d{2}.\d{2}$/.test(v)) || 'Формат даты должен быть YYYY.MM.DD',
}

</script>
<template>
  <div>
    <v-col class="d-flex flex-column ga-5">
      <div class="d-flex justify-start">
        <v-btn rounded="lg" variant="outlined" color="info"
          @click.prevent="$router.push('/list/counterpartyeAgreement')">Назад</v-btn>
      </div>
      <v-card class="block">
        <v-form @submit.prevent="updateCounterpartyAgreement" ref="form">
          <div class="d-flex ga-5">
            <v-text-field v-model="form.name" :rules="[rules.required]" variant="outlined"
              label="Наименование"></v-text-field>
            <v-text-field v-model="form.date" type="date" :rules="[rules.required, rules.date]" variant="outlined"
              label="Дата"></v-text-field>
            <v-text-field v-model="form.contact_person" :rules="[rules.required]" variant="outlined"
              label="Контактное лицо"></v-text-field>
            <v-text-field v-model="form.comment" variant="outlined" label="Комментарий"></v-text-field>
          </div>
          <div class="d-flex ga-5">
            <v-select v-model="form.organization_id" :items="organizations" :item-props="organizationProps"
              :rules="[rules.required]" label="Организация"></v-select>
            <v-select v-model="form.counterparty_id" :items="counterparties" :item-props="counterpartyProps"
              :rules="[rules.required]" label="Контрагент"></v-select>
            <v-select v-model="form.currency_id" :items="currencies" :item-props="currencyProps" :rules="[rules.required]"
              label="Валюта договора"></v-select>
            <v-select v-model="form.payment_id" :items="payments" :item-props="paymentProps" :rules="[rules.required]"
              label="Валюта оплаты"></v-select>
            <v-select v-model="form.price_type_id" :items="price_types" :item-props="price_typeProps"
              :rules="[rules.required]" label="Тип валюты"></v-select>
          </div>
          <div class="d-flex justify-end mt-4">
            <v-btn rounded="lg" color="info" type="submit">Изменить</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-col>
  </div>
</template>
<style scoped>
.block {
  border-radius: 6px;
  padding: 20px;
}
</style>