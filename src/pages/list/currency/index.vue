<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import changeTheDateForSending from '../../../composables/date/changeTheDateForSending'
import currentDate from "../../../composables/date/currentDate.js";
import currency from '../../../api/currency.js'
import {
  add,
  addIcon, addMessage,
  cancel,
  edit,
  editIcon, editMessage,
  prevIcon, remove,
  removeIcon, removeMessage,
  showIcon, warningMessage
} from "../../../composables/constant/buttons.js";
import Icons from "../../../composables/Icons/Icons.vue";
import binarySearch from "../../../composables/binarySearch/binarySearch.js";
import {tr} from "vuetify/locale";
import showDate from "../../../composables/date/showDate.js";

const router = useRouter()

const loading = ref(true)
const loadingRate = ref(true)
const dialog = ref(false)

const idCurrency = ref(null)
const isExistsCurrency = ref(false)
const markedID = ref(null)
const currencyInDialogTitle = ref(null)
const search = ref('')

const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const currencies = ref([])
const paginations = ref([])
const rates = ref([])
const paginationsRate = ref([])

const headers = ref([
  { title: '№', key: 'id', align: 'center'},
  { title: 'Наименование', key: 'name'},
  { title: 'Символьный код', key: 'symbol_code'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: 'Курс валюты', key: 'last_exchange_rate.value', sortable: false},
])

const headersRate = ref([
  { title: 'Дата', key: 'date'},
  { title: 'Курс', key: 'value'},
])

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}

const getCurrencyData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true
  try {
    const { data } = await currency.get({page, itemsPerPage, sortBy}, search)
    paginations.value = data.result.pagination
    currencies.value = data.result.data.map(item => ({
      ...item,
      isActive: false
    }))
    loading.value = false
  } catch (e) {

  }
}

const getCurrencyRateData = async ({ page, itemsPerPage, sortBy, search}) => {
  try {
    const response = await currency.show(idCurrency.value)
    const { data } = await currency.showRate(idCurrency.value, { page, itemsPerPage, sortBy }, search)
    rates.value = data.result.data.map(item =>  ({
      ...item,
      date: showDate(item.date),
      name: response.data.result.name,
      digital_code: response.data.result.digital_code
    }))
    paginationsRate.value = data.result.pagination
    loadingRate.value = false
  } catch (e) {

  }
}



const addCurrency = async ({ page, itemsPerPage, sortBy }) => {

  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }
  
  const res = await currency.add(body)
  if (res.status === 201) {
    await getCurrencyData({ page, itemsPerPage, sortBy })
    showToast(addMessage)
    valueRef.value = null
    idCurrency.value = res.data.result.id
  }

}


const createCurrentRate = async () => {
  const body = {
    date: changeTheDateForSending(dateRef.value),
    value: valueRef.value
  }

  const {status} = await currency.addRate(body, String(idCurrency.value))

  if (status === 201) {
    showToast(addMessage)
    nameRef.value = null
    symbolRef.value = null
    digitalRef.value = null
    dialog.value = false
  }
}

const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    symbol_code: symbolRef.value,
    digital_code: digitalRef.value
  }

  try {
    const { status } = await currency.update(idCurrency.value, body)
    if (status === 200) {
      await getCurrencyData({page, itemsPerPage, sortBy})
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}

const removeCurrency = async ({page, itemsPerPage, sortBy}) => {
  if (markedID.value === null) return showToast(warningMessage, 'warning')

  try {
    const {status} = await currency.remove(markedID.value)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getCurrencyData({page, itemsPerPage, sortBy})
    }
  } catch (e) {

  }
}


const openDialog = item => {
  dialog.value = true
  idCurrency.value = item.id

  const index = binarySearch(currencies.value, item.id)
  if (index !== 1) {
    isExistsCurrency.value = true
    nameRef.value = item.name
    symbolRef.value = item.symbol_code
    digitalRef.value = item.digital_code
    currencyInDialogTitle.value = nameRef.value
  }
}

const lineMarking = (item) => {
  markedID.value = item.id;
}

onMounted(() => {
  dateRef.value = currentDate()
})

watch(dialog, newVal => {
  if (!newVal) {
    symbolRef.value = null
    digitalRef.value = null
    rates.value = []
    loadingRate.value = true
  }
})
</script>

<template>
  <div>
    <v-col>
    <div class="d-flex justify-space-between text-uppercase ">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span>Валюты</span>
      </div>
      <v-card variant="text" min-width="200" class="d-flex align-center ga-2">
        <div class="d-flex">
          <div class="d-flex ga-2 mt-1 me-3">
            <Icons name="add"/>
            <Icons name="copy"/>
            <Icons @click="removeCurrency" name="delete"/>
          </div>
          <v-icon color="info" size="32">search</v-icon>
          <input
              class="input"
              type="search"
              v-model="search"
          />
        </div>
        <Icons name="filter" class="mt-1"/>
      </v-card>
    </div>

    <v-card class="mt-2 table">
      <v-data-table-server
          style="height: 78vh"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          v-model:items-per-page="paginations.per_page"
          :loading="loading"
          :headers="headers"
          :items-length="paginations.total || 0"
          :items="currencies"
          :item-value="headers.title"
          :search="search"
          @update:options="getCurrencyData"
          fixed-header
          hover
      >
        <template v-slot:item="{ item, index }">
          <tr @click="lineMarking(item)" @dblclick="openDialog(item)" :class="{'bg-grey-lighten-2' : markedID === item.id}">
            <td class="d-flex  align-center">
              <Icons class="mt-2 me-2" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
              <span>{{ index + 1 }}</span>
            </td>
            <td>
              <span>{{ item.name }}</span>
            </td>
            <td>{{ item.symbol_code }}</td>
            <td>{{ item.digital_code }}</td>
            <td>{{ item.last_exchange_rate === null ? '' : item.last_exchange_rate.value}}</td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>

<!-- Modal -->
    <v-card>
      <v-dialog class="mt-2 pa-2"  v-model="dialog">
        <v-card style="border: 2px solid #3AB700" min-width="300" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="">{{ isExistsCurrency ? currencyInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons name="delete"/>
                <Icons @click="update" name="save"/>
              </div>
              <v-btn @click="dialog = false"  variant="text" :size="32" class="pt-2 pl-1">
                <Icons name="close" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100" @submit.prevent="addCurrency">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    v-model="nameRef"
                    :rules="[rules.required]"
                    color="green"
                    rounded="lg"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Доллар"
                    label="Название"
                    clear-icon="close"
                    clearable
                />
                <v-text-field
                    v-model="symbolRef"
                    :rules="[rules.required]"
                    color="green"
                    rounded="lg"
                    variant="outlined"
                    density="compact"
                    placeholder="USD"
                    v-mask="'AAA'"
                    label="Символный код"
                    clear-icon="close"
                    clearable
                />
                <v-text-field
                    v-model="digitalRef"
                    :rules="[rules.required]"
                    color="green"
                    rounded="lg"
                    density="compact"
                    variant="outlined"
                    placeholder="132"
                    v-mask="'###'"
                    label="Цифровой код"
                    clear-icon="close"
                    clearable
                />
              </v-col>
            </v-row>
          </v-form>

          <v-card class="table" style="border: 1px solid #3AB700">
            <div class="d-flex w-100 rounded-t-lg mb-1 align-center " style="border-bottom: 1px solid #3AB700">
              <div class="d-flex justify-end w-100 ga-2 pt-1 me-2" style="padding-top: 4px !important;">
                <Icons name="add"/>
              </div>
            </div>
            <v-data-table-server
                style="height: 38vh"
                items-per-page-text="Элементов на странице:"
                loading-text="Загрузка"
                no-data-text="Нет данных"
                v-model:items-per-page="paginationsRate.per_page"
                :loading="loadingRate"
                :headers="headersRate"
                :items-length="paginationsRate.total || 0"
                :items="rates"
                :item-value="headersRate.title"
                :search="search"
                @update:options="getCurrencyRateData"
                fixed-footer
                hover
            >
              <template v-slot:item="{ item, index }">
                <tr>
                  <td>{{ item.date }}</td>
                  <td>{{ item.value }}</td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card>
        </v-card>
      </v-dialog>
    </v-card>

  </v-col>
  </div>
  
  
</template>

<style scoped>
input {
  border: 1px solid #478bf6;
  border-radius: 5px;
  padding: 2px 5px;
  font-size: 14px;
}
input:focus {
  outline: none;
}
</style>