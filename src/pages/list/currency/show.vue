<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import currency from '../../../api/currency.js'
import showToast from "../../../composables/toast/index.js";
import showDate from "../../../composables/date/showDate";
import currentDate from "../../../composables/date/currentDate";
import changeTheDateForSending from "../../../composables/date/changeTheDateForSending";

const route = useRoute()

const expand = ref(false);
const loading = ref(false);

const symbolRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const dateError = ref(null)
const valueError = ref(null)

const currencies = ref([])

const headers = ref([
  { title: 'Дата', key: 'date'},
  { title: 'Символьный код', key: 'currency'},
  { title: 'Значение', key: 'value'},
])

onMounted( async () => {
  dateRef.value = currentDate()  
  symbolRef.value = useRoute().query.symbol
  await getCurrencyRateData(route.params.id)
})

const getCurrencyRateData = async (id) => {
  try {
    const { data } = await currency.showCurrencyRate(id)
    currencies.value = data.result.map(item => ({
      ...item,
      date: showDate(item.date)
    }))
    loading.value = false
  } catch (e) {
    
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

const addRate = async () => {
  if (validateCurrentRate() !== true) return
 
  const body = {
    date: changeTheDateForSending(dateRef.value),
    value: valueRef.value
  }

  const { data } = await currency.addCurrencyRate(body, route.params.id)
  currencies.value = data.result
  await getCurrencyRateData(route.params.id)
  showToast('Успешно добавлена')
  valueRef.value = null

}

</script>

<template>
  <v-col>
    <div class="d-flex  align-center ms-2">
      <v-btn color="info" @click="$router.push('/list/currency')">Назад</v-btn>
      <v-icon size="40" color="green" class="ma-2" @click="expand = !expand">add_circle</v-icon>
    </div>
    <v-expand-transition>
      <v-card v-show="expand" height="95" width="100%" class="mx-auto">
        <v-form class="w-100 pa-4" @submit.prevent="addRate">
          <v-row class="w-100">
            <v-col class="d-flex justify-between w-100 ga-5">
              <v-text-field variant="outlined" type="tel" :error-messages="dateError" placeholder="30/04/2004" v-mask="'##/##/####'" label="Дата" v-model="dateRef" />
              <v-text-field variant="solo" label="Символный код" disabled v-model="symbolRef" />
              <v-text-field variant="outlined" type="number" :error-messages="valueError" placeholder="1.0000" label="Значение" v-model="valueRef" />
              <v-btn :loading="loading" color="green" class="mt-2" type="submit">Добавить</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-expand-transition>
    <v-card class="mt-4 table">
      <v-data-table 
        items-per-page-text="Элементов на странице:" 
        loading-text="Загрузка" 
        no-data-text="Нет данных"
        :headers="headers"
        :items="currencies" 
        :loading="loading"
      >

      </v-data-table>
    </v-card>
  </v-col>
</template>

<style scoped>

</style>