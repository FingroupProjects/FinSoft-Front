<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import currency from '../../../api/currency.js'
import showToast from "../../../composables/toast/index.js";
import showDate from "../../../composables/date/showDate";
import currentDate from "../../../composables/date/currentDate";
import changeTheDateForSending from "../../../composables/date/changeTheDateForSending";

const route = useRoute()

const isDialog = ref(false);
const loading = ref(false);

const symbolRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const dateError = ref(null)
const valueError = ref(null)

const currencies = ref([])

const headers = ref([
  { title: 'Наименование', key: 'name'},
  { title: 'Дата', key: 'date'},
  { title: 'Символьный код', key: 'currency'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: 'Значение', key: 'value'},
])

onMounted( async () => {
  dateRef.value = currentDate()  
  symbolRef.value = useRoute().query.symbol
  await getCurrencyRateData(route.params.id)
})

const getCurrencyRateData = async (id) => {
  try {
    const { data } = await currency.showRate(id)
    currencies.value = data.result.exchangeRates.map(item => ({
      ...item,
      name: data.result.name,
      digital_code: data.result.digital_code
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

  if (Number(valueRef.value) > 9999999) {
    return valueError.value = 'Слишком больше значение!'
  }

  return true
}

const addRate = async () => {
  if (validateCurrentRate() !== true) return
 
  const body = {
    date: changeTheDateForSending(dateRef.value),
    value: valueRef.value
  }

  try {
    const { data } = await currency.addRate(body, route.params.id)
    currencies.value = data.result
    await getCurrencyRateData(route.params.id)
    showToast('Успешно добавлена')
    valueRef.value = null
    isDialog.value = false
  } catch(e) {

  }


}
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex  align-center ms-2">
        <v-btn color="info" @click="$router.push('/list/currency')">Назад</v-btn>
        
        <v-btn icon="add_circle" variant="text">
          <v-icon size="40" color="green" class=""></v-icon>
          <v-dialog width="500" v-model="isDialog" activator="parent">   
            <v-card class="rounded-xl pl-4" :title="'Курс валюты: ' + symbolRef">
              <v-form class="w-100 pa-4" @submit.prevent="addRate">
                <v-row class="w-100">
                  <v-col class="d-flex flex-column justify-between w-100 ga-5">
                    <v-text-field variant="outlined" type="tel" :error-messages="dateError" placeholder="30/04/2004"
                                  v-mask="'##/##/####'" label="Дата" v-model="dateRef"/>
                    <v-text-field variant="outlined" type="number" :error-messages="valueError" placeholder="1.0000"
                                  label="Значение" v-model="valueRef"/>
                    <div class="d-flex ga-2 justify-end align-center">
                      <v-btn :loading="loading" color="green" type="submit">Добавить</v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-dialog>
        </v-btn>
        
      </div>
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
  </div>
</template>

<style scoped>

</style>