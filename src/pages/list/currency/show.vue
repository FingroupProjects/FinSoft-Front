<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import currency from '../../../api/currency.js'
import showToast from "../../../composables/toast/index.js";

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

onMounted( () => {
  getCurrencyRateData(route.params.id)
})

const getCurrencyRateData = async (id) => {
  try {
    const { data } = await currency.showCurrencyRate(id)
    currencies.value = data.result
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
  
  let parts = dateRef.value.split('/');
  let day = parts[0];
  let month = parts[1];
  let year = parts[2];
  let newDate = `${year}/${month}/${day}`;

  const body = {
    date: newDate,
    value: valueRef.value
  }

  const { data } = await currency.addCurrencyRate(body, route.params.id)
  currencies.value = data.result
  showToast('Успешно добавлена')

}

</script>

<template>
  <v-col>
    <div class="d-flex justify me-2">
      <span>Назад</span>
      <v-icon size="40" color="info" class="ma-2" @click="expand = !expand">add_circle</v-icon>
    </div>
    <v-expand-transition>
      <v-card v-show="expand" height="95" width="100%" class="mx-auto">
        <v-form class="w-100 pa-4" @submit.prevent="addRate">
          <v-row class="w-100">
            <v-col class="d-flex justify-between w-100 ga-5">
              <v-text-field variant="outlined" type="tel" :error-messages="dateError" placeholder="30/04/2004" v-mask="'##/##/####'" label="Дата" v-model="dateRef" />
              <v-text-field variant="outlined" label="Символный код" v-model="symbolRef" />
              <v-text-field variant="outlined" type="tel" :error-messages="valueError" placeholder="1.0000" label="Значение" v-model="valueRef" />
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