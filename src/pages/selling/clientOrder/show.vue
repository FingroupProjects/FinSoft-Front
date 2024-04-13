<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import validate from "./validate.js";
import { useRoute, useRouter } from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import currencyApi from "../../../api/list/currency.js";
import clientOrderApi from "../../../api/documents/clientOrder.js";
import goodApi from "../../../api/list/goods.js";
import { editMessage } from "../../../composables/constant/buttons.js";
import {BASE_COLOR} from "../../../composables/constant/colors.js";
import "../../../assets/css/procurement.css";

const router = useRouter()
const route = useRoute()

const form = reactive({
  doc_number: null,
  date: null,
  shipping_date: null,
  organization: null,
  organizations: [],
  counterparty: null,
  counterparties: [],
  cpAgreement: null,
  cpAgreements: [],
  comment: null,
  currency: null,
})

const loading = ref(false)
const author = ref(null)
const markedID = ref([])
const goods = ref([{
  id: 1,
  good_id: null,
  amount: 1,
  auto_sale_percent: null,
  auto_sale_sum: null,
  price: null,
}])

const organizations = ref([])
const counterparties = ref([])
const cpAgreements = ref([])
const currencies = ref([])
const listGoods = ref([])

const headers = ref([
  {title: 'Товары', key: 'goods', sortable: false},
  {title: 'Количество', key: 'currency.name', sortable: false},
  {title: 'Cумма без скидки', key: 'currency.name', sortable: false},
  {title: 'Сумма со скидкой', key: 'currency.name', sortable: false},
  {title: 'Цена', key: 'currency.name', sortable: false},
  {title: 'Сумма', key: 'currency.name', sortable: false},
])


const getClientOrderDetails = async () => {
  const { data } = await clientOrderApi.getById(route.params.id)

  form.doc_number = data.result.doc_number
  form.date = data.result.date
  form.shipping_date = data.result.shippingDate
  form.organization = {
    id: data.result.organization.id,
    name: data.result.organization.name
  }
  form.counterparty = {
    id: data.result.counterparty.id,
    name: data.result.counterparty.name
  }
  setTimeout(() => {
    form.cpAgreement = {
      id: data.result.counterpartyAgreement.id,
      name: data.result.counterpartyAgreement.name
    }
  }, 300)

  form.comment = data.result.comment
  form.currency = data.result.currency
  goods.value = data.result.orderGoods.map(item => ({
    good_id: item.good.id,
    amount: item.amount,
    auto_sale_percent: item.auto_sale_percent,
    auto_sale_sum: item.auto_sale_sum,
    price: item.price,
  }))
}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterparties.value = data.result.data
}

const getCpAgreements = async () => {
  const { data } = await cpAgreementApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  cpAgreements.value = data.result.data
}
const getCurrencies = async () => {
  const { data } = await currencyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  currencies.value = data.result.data
}

const getGoods = async () => {
  const { data } = await goodApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  listGoods.value = data.result.data
}

const decreaseCountOfGoods = () => {
  goods.value = goods.value.filter((item) => !markedID.value.includes(item.id))
}

const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
}

const increaseCountOfGoods = () => {
  const missingData = goods.value.some(validateItem)
  if (missingData) return

  goods.value.push({id: goods.value.length + 1, good_id: null, amount: 1, auto_sale_percent: null, auto_sale_sum: null, price: null })
}

const validateItem = (item) => {
  if (item.good_id === null) {
    showToast("Поле Товар не может быть пустым", "warning")
    return true
  }
  if (item.amount === null) {
    showToast("Поле Количество не может быть пустым", "warning")
    return true
  }
  if (item.price === null) {
    showToast("Поле Цена не может быть пустым", "warning")
    return true
  }
  return false
}

const updateProcurement = async () => {
  if (validate(form.date, form.organization, form.counterparty, form.cpAgreement, form.currency) !== true) return

  const missingData = goods.value.some(validateItem)
  if (missingData) return

  const body = {
    date: form.date,
    shipping_date: form.shipping_date,
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
    counterparty_id: typeof form.counterparty === 'object' ? form.counterparty.id : form.counterparty,
    counterparty_agreement_id: typeof form.cpAgreement === 'object' ? form.cpAgreement.id : form.cpAgreement,
    currency_id: typeof form.currency === 'object' ? form.currency.id : form.currency,
    comment: form.comment,
    summa: totalPrice.value,
    order_status_id: 1,
    goods: goods.value.map((item) => ({
      good_id: Number(item.good_id),
      amount: Number(item.amount),
      price: Number(item.price),
      auto_sale_percent: 10,
      auto_sale_sum: 100.5
    }))
 }

 try {
   const res = await clientOrderApi.update(route.params.id ,body)
   if (res.status === 200) {
     showToast(editMessage)
     router.push('/clientOrder')
   }
 } catch (e) {
   console.log(e)
 }
}


const totalPrice = computed(() => {
  let sum = 0
  goods.value.forEach(item => {
    sum += item.price * item.amount
  })
  return sum
})


onMounted( () => {
  author.value = JSON.parse(localStorage.getItem('user')).name || null

  Promise.all([
      getOrganizations(),
      getCounterparties(),
      getCpAgreements(),
      getCurrencies(),
      getGoods(),
      getClientOrderDetails()
  ])
})


watch(() => form.counterparty, async (data) => {
  form.cpAgreement = null

  const id = typeof data === 'object' ? data.id : data

  try {
    const res = await cpAgreementApi.getById(id)
    form.currency = {
      id: res.data.result.currency_id.id,
      name: res.data.result.currency_id.name
    }

    const array = Object.prototype.toString.call(res.data.result) === '[object Array]'
    const obj = Object.prototype.toString.call(res.data.result) === '[object Object]'

    cpAgreements.value = array ? res.data.result : obj ? [res.data.result] : []

  } catch (e) {
    cpAgreements.value = []
  }
})


</script>
<template>
  <div class="document">
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Заказ от клиента (просмотр)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="updateProcurement" name="add"/>
              <Icons title="Скопировать" @click="" name="copy"/>
              <Icons title="Удалить" @click="" name="delete"/>
            </div>
          </div>
        </v-card>
      </div>
    </v-col>
    <v-divider/>
    <v-divider/>
    <div style="background: #fff;">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field  :value="form.doc_number"/>
          <custom-text-field label="Дата" type="date" v-model="form.date"/>
          <custom-autocomplete label="Организация" :items="organizations"  v-model="form.organization"/>
          <custom-autocomplete label="Поставщик" :items="counterparties" v-model="form.counterparty"/>
          <custom-text-field label="Дата" type="date" v-model="form.shipping_date"/>
          <custom-autocomplete label="Договор" :items="cpAgreements" v-model="form.cpAgreement"/>
        </div>
      </v-col>
      <v-col>
        <div :style="`border: 1px solid ${BASE_COLOR}`" class="rounded">
          <div class="d-flex pa-1 ga-1">
            <Icons name="add" title="Добавить поле" @click="increaseCountOfGoods"/>
            <Icons name="delete" @click="decreaseCountOfGoods"/>
          </div>
          <div class="d-flex flex-column w-100 goods">
            <v-data-table
                style="height: 78vh"
                items-per-page-text="Элементов на странице:"
                loading-text="Загрузка"
                no-data-text="Нет данных"
                :headers="headers"
                :items="goods"
                v-model="markedID"
                item-value="id"
                page-text='{0}-{1} от {2}'
                :items-per-page-options="[
                  {value: 25, title: '25'},
                  {value: 50, title: '50'},
                  {value: 100, title: '100'},
                ]"
                show-select
                fixed-header
            >
              <template v-slot:item="{ item, index }">
                <tr :key="index">
                  <td>
                    <CustomCheckbox
                      v-model="markedID"
                      @change="lineMarking(item)"
                      :checked="markedID.includes(item.id)"
                    >
                      <span>{{ index + 1}}</span>
                    </CustomCheckbox>
                  </td>
                  <td>
                    <custom-autocomplete v-model="item.good_id" :items="listGoods" min-width="150" />
                  </td>
                  <td>
                    <custom-text-field v-model="item.amount" v-mask="'########'" min-width="50" max-width="90" />
                  </td>
                  <td>
                    <custom-text-field v-model="item.auto_sale_percent" v-mask="'##########'" min-width="80" max-width="110"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.auto_sale_sum" v-mask="'##########'" min-width="80" max-width="110"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.price" v-mask="'##########'" min-width="80" max-width="110"/>
                  </td>
                  <td>
                    <custom-text-field readonly :value="item.amount * item.price"  min-width="100" max-width="110"/>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
        <div class="d-flex justify-space-between w-100 mt-2 bottomField">
          <div class="d-flex ga-10">
            <custom-text-field readonly :value="author" min-width="140" max-width="110"/>
            <custom-text-field label="Комментарий" v-model="form.comment" min-width="310"/>
          </div>
          <div class="d-flex ga-6">
            <custom-text-field readonly  :value="'Общая сумма: ' + totalPrice" min-width="180" max-width="110"/>
            <custom-autocomplete v-model="form.currency" label="Валюта" :items="currencies" min-width="110" max-width="110" />
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped>

</style>