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
const search = ref('');

const symbolRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const dateError = ref(null)
const valueError = ref(null)

const currencies = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Наименование', key: 'name'},
  { title: 'Дата', key: 'date'},
  { title: 'Символьный код', key: 'currency'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: 'Значение', key: 'value'},
])

onMounted( async () => {
  dateRef.value = currentDate()  
  symbolRef.value = useRoute().query.symbol
})

const getCurrencyRateData = async ({ page, itemsPerPage, sortBy, search}) => {
  try {
    console.log(sortBy)
    const response = await currency.show(route.params.id)
    const { data } = await currency.showRate(route.params.id, { page, itemsPerPage, sortBy }, search)
    currencies.value = data.result.data.map(item => ({
      ...item,
      date: showDate(item.date),
      name: response.data.result.name,
      digital_code: response.data.result.digital_code
    }))
    paginations.value = data.result.pagination
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

const addRate = async ({ page, itemsPerPage, sortBy }) => {
  if (validateCurrentRate() !== true) return

  const body = {
    date: changeTheDateForSending(dateRef.value),
    value: valueRef.value
  }

  try {
    const { data } = await currency.addRate(body, route.params.id)
    currencies.value = data.result
    await getCurrencyRateData({ page, itemsPerPage, sortBy })
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
      <div class="d-flex justify-space-between  align-center ms-2">
        <v-btn variant="outlined" color="info" @click="$router.push('/list/currency')">Назад</v-btn>
        
        <v-btn color="info">
          <span>Создать</span>
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
                      <v-btn :loading="loading" color="info" type="submit">Добавить</v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-dialog>
        </v-btn>
        
      </div>
      <v-card class="mt-4 table">
        <v-card-title class="d-flex align-center pe-2">
          Курс валюты: {{ useRoute().query.symbol }}

          <v-spacer />
          <v-spacer />
          <v-spacer />

          <v-text-field
              v-model="search"
              prepend-inner-icon="search"
              density="compact"
              label="Поиск..."
              single-line
              flat
              hide-details
              variant="outlined"
          ></v-text-field>
        </v-card-title>
        <v-data-table-server
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            :loading="loading"
            v-model:items-per-page="paginations.per_page"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="currencies"
            :search="search"
            :item-value="headers.title"
            @update:options="getCurrencyRateData"
        >
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
        </v-data-table-server>

      </v-card>
    </v-col>
  </div>
</template>

<style scoped>

</style>