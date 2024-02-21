<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import currency from '../../../api/currency.js'
import showToast from "../../../composables/toast/index.js";
import showDate from "../../../composables/date/showDate";
import currentDate from "../../../composables/date/currentDate";
import changeTheDateForSending from "../../../composables/date/changeTheDateForSending";
import {add, prevIcon} from "../../../composables/constant/buttons.js";

const route = useRoute()

const isDialog = ref(false)
const updateDialog = ref(false)
const deleteDialog = ref(false)
const loading = ref(false)
const search = ref('')

const currentCurrencyRateID = ref(null)
const symbolRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const dateError = ref(null)
const valueError = ref(null)

const currencies = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Дата', key: 'date'},
  { title: 'Значение', key: 'value'},
  { title: '#', key: 'icons', align: 'center', sortable: false},
])

onMounted( async () => {
  dateRef.value = currentDate()  
  symbolRef.value = useRoute().query.symbol
})

const getCurrencyRateData = async ({ page, itemsPerPage, sortBy, search}) => {
  try {
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

const goToEdit = item => {
  currentCurrencyRateID.value = item.id
  dateRef.value = item.date
  valueRef.value = item.value
  updateDialog.value = true
}

const update = async ({page, itemsPerPage, sortBy}) => {
  if (validateCurrentRate() !== true) return

  const body = {
    date: changeTheDateForSending(dateRef.value, '.'),
    value: Number(valueRef.value)
  }

  const {status} = await currency.updateRate(currentCurrencyRateID.value, body)

  if (status === 200) {
    await getCurrencyRateData({page, itemsPerPage, sortBy})
    showToast('Успешно обновлено!')
    updateDialog.value = false
  }
}

const goToDelete = item => {
  currentCurrencyRateID.value = item.id
  deleteDialog.value = true
}
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between  align-center ms-2">
        <div class="rounded-circle bg-blue pa-2 cursor-pointer" @click="$router.push('/list/currency')">
          <v-icon color="white" size="25">{{ prevIcon }}</v-icon>
        </div>
        
        <v-btn color="info">
          <span>{{ add }}</span>
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
                      <v-btn :loading="loading" color="info" type="submit">{{ add }}</v-btn>
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
          <div class="d-flex flex-column text-sm-body-1">
            <p><strong>Наименование:</strong> {{ useRoute().query.name }}</p>
            <p><strong>Символьный код:</strong> {{ useRoute().query.symbol }}</p>
            <p><strong>Цифровой код:</strong> {{ useRoute().query.digital }}</p>
          </div>

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
            hover
            @update:options="getCurrencyRateData"
        >
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
          </template>

          <template v-slot:item.icons="{ item }">
            <v-icon color="info" @click="goToEdit(item)" class="icon">edit</v-icon>
            <v-icon color="info" @click="goToDelete(item)" class="icon me-2">delete</v-icon>
          </template>
        </v-data-table-server>
      </v-card>

      <v-card>
        <v-dialog width="500" v-model="updateDialog" activator="parent">
          <v-card class="rounded-xl pl-4" :title="'Изменение '">
            <v-form class="w-100 pa-4" @submit.prevent="update">
              <v-row class="w-100">
                <v-col class="d-flex flex-column justify-between w-100 ga-5">
                  <v-text-field
                      v-model="dateRef"
                      variant="outlined"
                      type="text"
                      :error-messages="dateError"
                      label="Дата"
                  />
                  <v-text-field
                      v-model="valueRef"
                      variant="outlined"
                      type="text"
                      :error-messages="valueError"
                      label="Значение"
                  />
                  <div class="d-flex ga-2 justify-end align-center">
                    <v-btn :loading="loading" color="green" type="submit">Добавить</v-btn>
                  </div>
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