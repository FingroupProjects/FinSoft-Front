<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import counterpartyAgreementApi from "../../../api/counterpartyAgreement"
import counterpartyApi from "../../../api/counterparty"
import currencyApi from '../../../api/currency.js'
import organizationApi from "../../../api/organizations.js"
import priceTypeApi from "../../../api/priceType.js"
import showToast from '../../../composables/toast'
import changeTheDateForSending from '../../../composables/date/changeTheDateForSending'
import currentDate from '../../../composables/date/currentDate'

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

const createCounterpartyAgreement = async () => {
  try {
    const body = {
      name: name.value,
      date: changeTheDateForSending(date.value, '-'),
      organization_id: organization.value.id,
      counterparty_id: counterparty.value.id,
      contact_person: contact_person.value,
      contract_number: '00002',
      currency_id: currency.value.id,
      payment_id: payment.value.id,
      comment: comment.value,
      price_type_id: price_type.value.id,
    }
    console.log(body);
    const res = await counterpartyAgreementApi.create(body)
    showToast('Успешно добавлено')
    router.push({ name: 'counterpartyeAgreement' })
  } catch (e) {
    console.log(e);
  }
}
onMounted(async () => {
  date.value = currentDate()
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
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}

</script>
<template>
  <div>
    <v-col class="d-flex flex-column ga-5">
      <div class="d-flex justify-start">
        <v-btn rounded="lg" variant="outlined" color="info"
          @click.prevent="$router.push('counterpartyeAgreement')">Назад</v-btn>
      </div>
      <v-card class="block">
        <v-form @submit.prevent="createCounterpartyAgreement" ref="form">
          <div class="d-flex ga-5">
            <v-text-field v-model="name" density="compact" :rules="[rules.required]" variant="outlined"
              label="Наименование"></v-text-field>
            <v-text-field v-model="date" density="compact" :rules="[rules.required, rules.date]" v-mask="'##-##-####'"
              variant="outlined" label="Дата"></v-text-field>
            <v-text-field v-model="contact_person" density="compact" :rules="[rules.required]" variant="outlined"
              label="Контактное лицо"></v-text-field>
            <v-text-field v-model="comment" density="compact" variant="outlined" label="Комментарий"></v-text-field>
          </div>
          <div class="d-flex ga-5">
            <v-select v-model="organization" :items="organizations" :item-props="organizationProps"
              :rules="[rules.required]" label="Организация"></v-select>
            <v-select v-model="counterparty" :items="counterparties" :item-props="counterpartyProps"
              :rules="[rules.required]" label="Контрагент"></v-select>
            <v-select v-model="currency" :items="currencies" :item-props="currencyProps" :rules="[rules.required]"
              label="Валюта договора"></v-select>
            <v-select v-model="payment" :items="payments" :item-props="paymentProps" :rules="[rules.required]"
              density="compact" variant="outlined" rounded="lg" label="Валюта оплаты"></v-select>
            <v-select v-model="price_type" :items="price_types" :item-props="price_typeProps" :rules="[rules.required]"
              label="Тип валюты"></v-select>
          </div>
          <div class="d-flex justify-end mt-4">
            <v-btn rounded="lg" color="info" type="submit">Создать</v-btn>
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