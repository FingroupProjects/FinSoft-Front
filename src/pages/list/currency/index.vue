<script setup>
import { onMounted, ref } from "vue";
import currency from '../../../api/currency.js'

const loadingData = ref(true)
const expand = ref(false);
const loading = ref(false);
const isCurrentRate = ref(false)

const idCurrency = ref(null)
const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const dateError = ref(null)
const valueError = ref(null)

const currencies = ref([])

const headers = ref([
  { title: 'Наименование', key: 'name'},
  { title: 'Символьный код', key: 'symbol_code'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: '#', key: 'icons'}
])

onMounted(() => {
  getCurrencyData()
})

const getCurrencyData = async () => {
  try {
    const { data } = await currency.getCurrency()
    currencies.value = data.result
    loadingData.value = false
  } catch (e) {
    
  }
}
const addCurrency = async () => {
  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }

  const res = await currency.addCurrency(body)
  if (res.status === 201) {
    isCurrentRate.value = true
    idCurrency.value = res.data.result.id
  }

}


const validateCurrentRate = () => {
  dateError.value = null
  valueError.value = null

  if (dateRef.value === null) {
    return dateError.value = 'Заполните поле!'
  }

  if (dateRef.value.length <= 9) {
    return dateError.value = 'Заполните поле доконца!'
  }

  if (valueRef.value === null) {
    return valueError.value = 'Заполните поле!'
  }

  return true
}

const addCurrentRate = async () => {
  if (validateCurrentRate() !== true) return
  
  let parts = dateRef.value.split('/');
  let day = parts[0];
  let month = parts[1];
  let year = parts[2];
  let newDate = `${year}/${month}/${day}`;

  const body = {
    date: newDate,
    value: valueRef.value
  }

  const res = await currency.addCurrencyRate(body, String(idCurrency.value))
  console.log(res)
}

const getItem = item => {
  console.log(item)
}

</script>

<template>
  <v-col>
    <v-icon size="40" color="info" class="ma-2" @click="expand = !expand">add_circle</v-icon>
    <v-expand-transition>
      <v-card v-show="expand" height="210" width="100%" class="mx-auto">
        <v-form class="w-100 pa-4" @submit.prevent="addCurrency">
          <v-row class="w-100">
            <v-col class="d-flex justify-between w-100 ga-5">
              <v-text-field variant="outlined" :disabled="isCurrentRate" placeholder="Доллар" label="Название" v-model="nameRef" />
              <v-text-field variant="outlined" :disabled="isCurrentRate" placeholder="USD" v-mask="'SSS'" label="Символный код"
                v-model="symbolRef" />
              <v-text-field variant="outlined" :disabled="isCurrentRate" placeholder="132" v-mask="'###'" label="Цифровой код"
                v-model="digitalRef" />
              <v-btn :loading="loading" color="green" class="mt-2" type="submit" :hidden="isCurrentRate">Добавить</v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-form class="w-100 pa-4" v-show="isCurrentRate" @submit.prevent="addCurrentRate">
          <v-row class="w-100">
            <v-col class="d-flex justify-between w-100 ga-5">
              <v-text-field variant="outlined" type="tel" :error-messages="dateError" placeholder="30/04/2004" v-mask="'##/##/####'" label="Дата" v-model="dateRef" />
              <v-text-field variant="outlined" :disabled="isCurrentRate" label="Символный код" value="usd" v-model="symbolRef" />
              <v-text-field variant="outlined" type="tel" :error-messages="valueError" placeholder="1.0000" label="Значение" v-model="valueRef" />
              <v-btn :loading="loading" color="green" class="mt-2" type="submit">Добавить</v-btn>
            </v-col>
          </v-row>
        </v-form>

      </v-card>
    </v-expand-transition>
    <v-card class="mt-4 table">
      <v-data-table 
        :headers="headers"
        :items="currencies" 
        :loading="loadingData"
      >
        <template #item.icons="{ item }">
          <v-icon @click="getItem(item)" color="info">visibility</v-icon>
        </template>
      </v-data-table>
    </v-card>
  </v-col>
</template>

<style scoped>

</style>