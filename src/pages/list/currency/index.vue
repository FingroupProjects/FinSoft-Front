<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '@/composables/toast'
import currentDate from "@/composables/date/currentDate.js";
import currency from '@/api/currency.js'
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage
} from "@/composables/constant/buttons.js";
import Icons from "@/composables/Icons/Icons.vue";
import showDate from "@/composables/date/showDate.js";
import useLineMarking from "./scripts/lineMarking.js";
import useCurrencyData from "./requests/currencyData.js";
import useCurrencyRateData from "./requests/currencyRateData.js";


const router = useRouter()

const dialog = ref(false)
const rateDialog = ref(false)

const idCurrency = ref(null)
const idCurrencyRate = ref(null)
const isExistsCurrency = ref(false)
const isExistsCurrencyRate = ref(false)
const currencyInDialogTitle = ref(null)
const search = ref('')
const selected = ref([])

const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const headers = ref([
  { title: '№', key: 'id', align: 'start'},
  { title: 'Наименование', key: 'name'},
  { title: 'Символьный код', key: 'symbol_code'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: 'Курс валюты', key: 'last_exchange_rate.value', sortable: false},
])

const headersRate = ref([
  { title: '№', key: 'id'},
  { title: 'Дата', key: 'date'},
  { title: 'Курс', key: 'value'},
])

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}


const { lineMarking, markedID } = useLineMarking()
const { loading, currencies, paginations, getCurrencyData } = useCurrencyData()
const { loadingRate, rates, paginationsRate, getCurrencyRateData } = useCurrencyRateData()


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

const update = async ({page, itemsPerPage, sortBy, search}) => {

  const body = {
    name: nameRef.value,
    symbol_code: symbolRef.value,
    digital_code: digitalRef.value
  }

  try {
    const { status } = await currency.update(idCurrency.value, body)
    if (status === 200) {
      await getCurrencyData({page, itemsPerPage, sortBy, search})
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
      dialog.value = false
      markedID.value = null
    }
  } catch (e) {

  }
}

const openDialog = (item) => {
  dialog.value = true
  if (item === 0) {
    idCurrency.value = 0
    isExistsCurrency.value = false
  } else {
    idCurrency.value = item.id
    isExistsCurrency.value = true
    nameRef.value = item.name
    symbolRef.value = item.symbol_code
    digitalRef.value = item.digital_code
    currencyInDialogTitle.value = nameRef.value
  }

}

const addRate = async ({ page, itemsPerPage, sortBy }) => {
  const body = {
    date: showDate(dateRef.value, '-'),
    value: valueRef.value
  }

  try {
    await currency.addRate(idCurrency.value, body)
    await getCurrencyRateData({ page, itemsPerPage, sortBy }, idCurrency.value)
    await getCurrencyData({ page, itemsPerPage, sortBy })
    showToast(addMessage)
    valueRef.value = null
    rateDialog.value = false
  } catch(e) {
    showToast(e.response.data.message, 'red')
  }

}

const updateRate = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    date: dateRef.value.split('.').reverse().join('-'),
    value: Number(valueRef.value)
  }

  try {
    const {status} = await currency.updateRate(idCurrencyRate.value, body)

    if (status === 200) {
      await getCurrencyRateData({page, itemsPerPage, sortBy}, idCurrency.value)
      await getCurrencyData({ page, itemsPerPage, sortBy })
      showToast(editMessage)
      rateDialog.value = false
    }
  } catch (e) {
    console.log(e)
  }
}

const editDialogRate = (item) => {
  rateDialog.value = true
  isExistsCurrencyRate.value = true
  idCurrencyRate.value = item.id
  dateRef.value = item.date.split('.').reverse().join('-')
  valueRef.value = item.value
}

const addDialogRate = () => {
  rateDialog.value = true
  isExistsCurrencyRate.value = false
}

const removeCurrencyRate = async ({page, itemsPerPage, sortBy}) => {
  try {
    const { data } = await currency.removeRate(idCurrencyRate.value)
    if (data.result) {
      showToast(removeMessage, 'red')
      await getCurrencyRateData({page, itemsPerPage, sortBy}, idCurrency.value)
    }
  } catch (e) {

  } finally {
    rateDialog.value = false
  }
}

const addBasedOnCurrency = () => {
  if (markedID.value === null) return showToast(warningMessage, 'warning')

  dialog.value = true

  currencies.value.forEach(item => {
    if (markedID.value === item.id) {
      nameRef.value = item.name
      symbolRef.value = item.symbol_code
      digitalRef.value = item.digital_code
    }
  })
}


onMounted(async () => {
  dateRef.value = currentDate()
})

watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    symbolRef.value = null
    digitalRef.value = null
    rates.value = []
    loadingRate.value = true
  }
})

watch(rateDialog, newVal => {
  if (!newVal) {
    dateRef.value = currentDate()
    valueRef.value = null
    isExistsCurrencyRate.value = false
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
      <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3">
            <Icons @click="openDialog(0)" name="add" />
            <Icons @click="addBasedOnCurrency" name="copy" />
            <Icons @click="removeCurrency" name="delete" />
          </div>

          <div class="w-100">
            <v-text-field
                v-model="search"
                prepend-inner-icon="search"
                density="compact"
                label="Поиск..."
                variant="outlined"
                color="info"
                rounded="lg"
                clear-icon="close"
                hide-details
                single-line
                clearable
                flat
            ></v-text-field>
          </div>
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
            <td>{{ item.name }}</td>
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
            <span>{{ isExistsCurrency ? currencyInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="removeCurrency" name="delete"/>
                <Icons v-if="isExistsCurrency" @click="update" name="save"/>
                <Icons v-else @click="addCurrency" name="save"/>
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
                <Icons @click="removeCurrencyRate" name="delete"/>
                <Icons @click="addDialogRate" name="add"/>
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
                @update:options="getCurrencyRateData({}, idCurrency)"
                fixed-footer
                hover
            >
              <template v-slot:item="{ item, index }">
                <tr @dblclick="editDialogRate(item)">
                  <td class="d-flex align-center">
                    <Icons class="mt-2 me-2" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                    <span>{{ index + 1 }}</span>
                  </td>
                  <td>{{ item.date }}</td>
                  <td>{{ item.value }}</td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card>
        </v-card>
      </v-dialog>

<!--  addCurrencyRate    -->
      <v-dialog v-model="rateDialog" activator="parent">
        <v-card style="border: 2px solid #3AB700" min-width="400" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center pr-5 pt-3">
            <span class="pl-5">{{ isExistsCurrencyRate ? 'Изменить' : 'Добавить' }} курс</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="removeCurrencyRate" name="delete"/>
                <Icons v-if="isExistsCurrencyRate" @click="updateRate" name="save"/>
                <Icons v-else @click="addRate" name="save"/>
              </div>
              <v-btn @click="rateDialog = false"  variant="text" :size="32" class="pt-2 pl-1">
                <Icons name="close" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100 pa-5">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100 ga-5">
                <v-text-field
                    v-model="dateRef"
                    :rules="[rules.required]"
                    type="date"
                    label="Дата"
                    rounded="lg"
                    color="green"
                    variant="outlined"
                    density="compact"
                    clear-icon="close"
                />
                <v-text-field
                    v-model="valueRef"
                    :rules="[rules.required]"
                    type="number"
                    placeholder="1.0000"
                    label="Курс"
                    rounded="lg"
                    color="green"
                    variant="outlined"
                    density="compact"
                    clear-icon="close"
                    hide-spin-buttons
                    clearable
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>
  </v-col>
  </div>
  
  
</template>

<style scoped>

</style>