<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import currency from '../../../api/currency.js'
import showToast from '../../../composables/toast'
import changeTheDateForSending from '../../../composables/date/changeTheDateForSending'
import currentDate from '../../../composables/date/currentDate'

const router = useRouter()

const expand = ref(false);
const loading = ref(true);
const isCurrentRate = ref(false)

const idCurrency = ref(null)
const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const dateError = ref(null)
const valueError = ref(null)
const nameError = ref(null)
const digitalError = ref(null)
const symbolError = ref(null)

const currencies = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id', align: 'start',},
  { title: 'Наименование', key: 'name', align: 'start',},
  { title: 'Символьный код', key: 'symbol_code', align: 'start',},
  { title: 'Цифровой код', key: 'digital_code', align: 'start',},
  { title: '#', key: 'icons', align: 'start', sortable: false,},
])

onMounted( async () => {
  dateRef.value = currentDate()
})

const getCurrencyData = async ({ page, itemsPerPage, sortBy }) => {
  loading.value = true
  try {
    const { data } = await currency.get(page, itemsPerPage, sortBy )
    currencies.value = data.result.data
    paginations.value = data.result.pagination
    loading.value = false
  } catch (e) {

  }
}

const validateCurrency = () => {
  nameError.value = null
  digitalError.value = null
  symbolError.value = null

  if (nameRef.value === null) {
    return nameError.value = 'Заполните поле!'
  }

  if (nameRef.value.length < 3) {
    return nameError.value = 'Не менее трёх символов!'
  }

  if (digitalRef.value === null) {
    return digitalError.value = 'Заполните поле!'
  }


  if (symbolRef.value === null) {
    return symbolError.value = 'Заполните поле!'
  }

  return true
}


const addCurrency = async ({ page, itemsPerPage, sortBy }) => {
  if (validateCurrency() !== true) return

  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }

  const res = await currency.add(body)
  if (res.status === 201) {
    await getCurrencyData({ page, itemsPerPage, sortBy })
    showToast('Успешно добавлена')
    isCurrentRate.value = true
    valueRef.value = null
    idCurrency.value = res.data.result.id
  }

}


const validateCurrencyRate = () => {
  dateError.value = null
  valueError.value = null

  if (dateRef.value === null) {
    return dateError.value = 'Заполните поле!'
  }

  if (dateRef.value.length <= 9) {
    return dateError.value = 'Введите правильную дату!'
  }

  if (valueRef.value === null) {
    return valueError.value = 'Заполните поле!'
  }

  if (Number(valueRef.value) > 9999999.9999) {
    return valueError.value = 'Значение не должно превышать 9999999!'
  }

  return true
}

const back = () => {
  nameRef.value = null
  symbolRef.value = null
  digitalRef.value = null
  isCurrentRate.value = false
  expand.value = false
}

const createCurrentRate = async () => {
  if (validateCurrencyRate() !== true) return
  

  const body = {
    date: changeTheDateForSending(dateRef.value),
    value: valueRef.value
  }

  const res = await currency.addRate(body, String(idCurrency.value))
  if (res.status === 201) {
    showToast('Успешно добавлена')
    nameRef.value = null
    symbolRef.value = null
    digitalRef.value = null
    isCurrentRate.value = false
    expand.value = false
  }
}

const goToShow = (id, symbol) => {
  router.push({ path: `/list/currency/${id}`, query: { symbol } });
}

</script>

<template>
  <div>
    <v-col>
    <v-icon size="40" color="green" class="ma-2" @click="expand = !expand">add_circle</v-icon>
    <v-expand-transition>
      <v-card v-show="expand" :height="isCurrentRate ? 210 : 95" width="100%" class="mx-auto">
        <v-form class="w-100 pa-4" @submit.prevent="addCurrency">
          <v-row class="w-100">
            <v-col class="d-flex justify-between w-100 ga-5">
              <v-text-field variant="outlined" :disabled="isCurrentRate" :error-messages="nameError" placeholder="Доллар" label="Название" v-model="nameRef" />
              <v-text-field variant="outlined" :disabled="isCurrentRate" :error-messages="symbolError" placeholder="USD" v-mask="'AAA'" label="Символный код"
                v-model="symbolRef" />
              <v-text-field variant="outlined" :disabled="isCurrentRate" :error-messages="digitalError" placeholder="132" v-mask="'###'" label="Цифровой код"
                v-model="digitalRef" />
              <v-btn :loading="loading" color="green" class="mt-2" type="submit" :hidden="isCurrentRate">Добавить</v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-form class="w-100 pa-4" v-show="isCurrentRate" @submit.prevent="createCurrentRate">
          <v-row class="w-100">
            <v-col class="d-flex justify-between w-100 ga-5">
              <v-text-field variant="outlined" type="tel" :error-messages="dateError" placeholder="30/04/2004" v-mask="'##/##/####'" label="Дата" v-model="dateRef" />
              <v-text-field variant="outlined" :disabled="isCurrentRate" label="Символный код" :value="symbolRef" v-model="symbolRef" />
              <v-text-field variant="outlined" type="number" :error-messages="valueError" placeholder="1.0000" label="Значение" v-model="valueRef" />
              <v-btn :loading="loading" color="green" class="mt-2" type="submit">Добавить</v-btn>
              <v-btn :loading="loading" color="info" class="mt-2" type="button" @click="back">Назад</v-btn>
            </v-col>
          </v-row>
        </v-form>

      </v-card>
    </v-expand-transition>
    <v-card class="mt-4 table">
      <v-data-table-server
          :loading="loading"
          v-model:items-per-page="paginations.per_page"
          :headers="headers"
          :items-length="Number(paginations.total)"
          :items="currencies"
          :item-value="headers.title"
          @update:options="getCurrencyData"
      >
        <template v-slot:item.id="{ item }">
          <span>{{ item.id }}</span>
        </template>
        <template v-slot:item.icons="{ item }">
          <v-icon @click="goToShow(item.id, item.symbol_code)" color="info">visibility</v-icon>
        </template>
      </v-data-table-server>
    </v-card>
  </v-col>
  </div>
  
</template>

<style scoped>

</style>